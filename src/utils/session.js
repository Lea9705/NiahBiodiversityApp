// Keeps the logged-in user and login token in memory, so any file can
// send authenticated requests without passing props around.
let currentToken = '';
let currentUser = null;

export function setSession(token, user) {
  currentToken = token || '';
  currentUser = user || null;
}

export function clearSession() {
  currentToken = '';
  currentUser = null;
}

export function getToken() {
  return currentToken;
}

export function getUser() {
  return currentUser;
}


// Same as fetch, but gives up after a time limit. Without it, a request that
// is cut off by a dropped connection can wait for minutes, and the screen that
// is waiting for it looks frozen.
export function fetchWithTimeout(url, options = {}, ms = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return fetch(url, { ...options, signal: controller.signal })
    .catch((error) => {
      if (error && error.name === 'AbortError') {
        const timeoutError = new Error(
          'Request timed out: the server took too long to answer.'
        );
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }

      throw error;
    })
    .finally(() => clearTimeout(timer));
}

// Same as fetch, but adds the login token when someone is logged in.
export function authFetch(url, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };

  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  return fetchWithTimeout(url, { ...options, headers });
}

// Same as authFetch, but as the account that owns the given login token,
// whoever is (or is not) logged in right now. Used to send the records of an
// account that has logged out.
export function authFetchAs(token, url, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetchWithTimeout(url, { ...options, headers });
}
