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

// Same as fetch, but adds the login token when someone is logged in.
export function authFetch(url, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };

  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  return fetch(url, { ...options, headers });
}