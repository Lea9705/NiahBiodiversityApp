// src/services/iotApi.js
//
// IoT data for the mobile app.
//
// The phone only talks to OUR server, the same one the website uses. The server
// holds the AWS access, so no AWS key or AWS address is stored in the app.
import { authFetch } from '../utils/session';

const SERVER = '52.62.125.146';

export const IOT_ENDPOINTS = {
  // Sensor readings. The server must provide this route (the website expects it too).
  sensors: `http://${SERVER}/api/iot/sensors`,

  // Live alerts. The server receives them from AWS and passes them on here.
  alertsSocket: `ws://${SERVER}/api/ws/alerts`,
};

const REQUEST_TIMEOUT_MS = 15000;

function normalizeArray(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
}

function failure(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await authFetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (error) {
    throw failure(
      error?.name === 'AbortError'
        ? 'The IoT request took too long. It will be tried again automatically.'
        : 'Cannot reach the server. Check your internet connection.',
      0
    );
  } finally {
    clearTimeout(timer);
  }

  const body = await response.text();

  let payload = null;

  try {
    payload = body ? JSON.parse(body) : null;
  } catch (_) {
    // The reply is not valid JSON.
  }

  if (!response.ok) {
    const serverMessage =
      typeof payload?.error === 'string' ? payload.error : '';

    if (response.status === 401) {
      throw failure(
        'Your login has expired. Please log out and log in again.',
        401
      );
    }

    if (response.status === 403) {
      throw failure(
        'Your account is not allowed to see IoT data. Ask the backend team to allow your role.',
        403
      );
    }

    if (response.status === 404) {
      throw failure(
        'The server does not have the IoT sensor route yet. Ask the backend team to add GET /api/iot/sensors.',
        404
      );
    }

    throw failure(
      serverMessage || `IoT request failed (${response.status}).`,
      response.status
    );
  }

  return payload;
}

export async function fetchSensors() {
  const payload = await getJson(IOT_ENDPOINTS.sensors);

  return normalizeArray(payload, ['sensors', 'readings', 'data', 'items']);
}

const IGNORED_MESSAGE_TYPES = [
  'ping',
  'pong',
  'heartbeat',
  'connected',
  'connection',
  'ack',
  'welcome',
];

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// Turns whatever the server sends into a list of alerts.
export function alertsFromMessage(data) {
  if (Array.isArray(data)) {
    return data.filter(isObject);
  }

  if (!isObject(data)) {
    return [];
  }

  if (IGNORED_MESSAGE_TYPES.includes(String(data.type || '').toLowerCase())) {
    return [];
  }

  for (const key of ['alerts', 'items']) {
    if (Array.isArray(data[key])) {
      return data[key].filter(isObject);
    }
  }

  if (Array.isArray(data.data)) {
    return data.data.filter(isObject);
  }

  if (isObject(data.alert)) {
    return [data.alert];
  }

  if (isObject(data.data)) {
    return [data.data];
  }

  return [data];
}

// Listens for live alerts. It reconnects by itself, waiting a little longer
// each time (2s, 4s, 8s ... up to 30s). Call the function it returns to stop.
export function openAlertSocket({ onAlerts, onStatus }) {
  let socket = null;
  let retryTimer = null;
  let attempt = 0;
  let stopped = false;

  const scheduleRetry = () => {
    if (stopped) return;

    attempt += 1;
    const delay = Math.min(30000, 2000 * 2 ** (attempt - 1));
    retryTimer = setTimeout(connect, delay);
  };

  const connect = () => {
    if (stopped) return;

    onStatus?.('connecting');

    try {
      socket = new WebSocket(IOT_ENDPOINTS.alertsSocket);
    } catch (_) {
      onStatus?.('disconnected');
      scheduleRetry();
      return;
    }

    socket.onopen = () => {
      attempt = 0;
      onStatus?.('connected');
    };

    socket.onmessage = (event) => {
      let data;

      try {
        data = JSON.parse(event.data);
      } catch (_) {
        data = { message: String(event.data) };
      }

      const alerts = alertsFromMessage(data);

      if (alerts.length > 0) {
        onAlerts?.(alerts);
      }
    };

    // An error is always followed by a close, which handles the retry.
    socket.onerror = () => {};

    socket.onclose = () => {
      socket = null;

      if (!stopped) {
        onStatus?.('disconnected');
        scheduleRetry();
      }
    };
  };

  connect();

  return () => {
    stopped = true;
    clearTimeout(retryTimer);

    if (socket) {
      socket.onclose = null;

      try {
        socket.close();
      } catch (_) {
        // Already closed.
      }
    }
  };
}
