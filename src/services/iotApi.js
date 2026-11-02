// src/services/iotApi.js
//
// IoT API client for the mobile app.
//
// IMPORTANT:
// Do not hardcode production API keys in the mobile app.
// The backend team must confirm the approved mobile authentication method.

export const IOT_ENDPOINTS = {
  sensors:
    'https://4rmy4ul48k.execute-api.ap-southeast-1.amazonaws.com/sensors',

  alerts:
    'https://4rmy4ul48k.execute-api.ap-southeast-1.amazonaws.com/alerts',

  websocket:
    'wss://5hjbdij5il.execute-api.ap-southeast-1.amazonaws.com/prod',
};

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

async function getJson(url, signal) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  const body = await response.text();

  let payload = null;

  try {
    payload = body ? JSON.parse(body) : null;
  } catch (_) {
    // Response is not valid JSON.
  }

  if (!response.ok) {
    const error = new Error(
      response.status === 401 || response.status === 403
        ? 'Backend authentication is required. Ask the backend team for the approved mobile access method.'
        : `IoT request failed (${response.status}).`
    );

    error.status = response.status;

    throw error;
  }

  return payload;
}

export async function fetchSensors(signal) {
  const payload = await getJson(
    IOT_ENDPOINTS.sensors,
    signal
  );

  return normalizeArray(payload, [
    'sensors',
    'readings',
    'data',
    'items',
  ]);
}

export async function fetchAlerts(signal) {
  const payload = await getJson(
    IOT_ENDPOINTS.alerts,
    signal
  );

  return normalizeArray(payload, [
    'alerts',
    'data',
    'items',
  ]);
}

export function openIotSocket({ onMessage, onStatus }) {
  let socket;

  try {
    socket = new WebSocket(IOT_ENDPOINTS.websocket);

    onStatus?.('connecting');

    socket.onopen = () => {
      onStatus?.('connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch (_) {
        onMessage?.({
          message: event.data,
        });
      }
    };

    socket.onerror = () => {
      onStatus?.('error');
    };

    socket.onclose = () => {
      onStatus?.('disconnected');
    };
  } catch (_) {
    onStatus?.('error');
  }

  return () => {
    if (
      socket &&
      socket.readyState < WebSocket.CLOSING
    ) {
      socket.close();
    }
  };
}