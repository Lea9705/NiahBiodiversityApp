// Login for the botanist: sends the email and password to the server,
// then remembers the logged-in user and token. The login is kept in memory
// and also saved in the phone's secure storage under 'authToken' and
// 'authUser', because the Home, Activities and approved-records code reads
// it from there.
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { setSession, clearSession } from '../utils/session';

const LOGIN_URL = 'http://52.62.125.146/api/login';
const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

// Only these roles may log in to the app (compared in lower case).
// Any other role, such as an officer, is treated like a wrong login.
const ALLOWED_ROLES = ['botanist', 'admin'];

const INVALID_LOGIN_MESSAGE =
  'Invalid login credentials, please check your email address or password.';

// Every kind of wrong login gets this same sentence, so the app never reveals
// whether an email exists, is suspended, or belongs to another role.
function invalidLogin() {
  const error = new Error(INVALID_LOGIN_MESSAGE);
  error.code = 'INVALID_CREDENTIALS';
  return error;
}

async function requestLogin(email, password) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let response;

  try {
    response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(
      error?.name === 'AbortError'
        ? 'The server took too long to answer. Please try again.'
        : 'Cannot reach the server. Check your internet connection and try again.'
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data = null;

  try {
    data = text.trim() ? JSON.parse(text) : null;
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const serverMessage = typeof data?.error === 'string' ? data.error : '';

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw invalidLogin();
    }
    if (response.status === 429) {
      throw new Error('Too many attempts. Please wait a moment and try again.');
    }

    throw new Error(serverMessage || `Login failed (error ${response.status}).`);
  }

  const token = typeof data?.token === 'string' ? data.token.trim() : '';
  const user = data?.user;

  if (!token || !user || user.id == null) {
    throw new Error('The server sent an unexpected reply. Please try again.');
  }

  const safeUser = { ...user };
  delete safeUser.password;

  return { token, user: safeUser };
}

const UserContext = createContext({
  user: null,
  token: '',
  userName: '',
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  const login = useCallback(async (email, password) => {
    const result = await requestLogin(email, password);

    const role = String(result.user.role || '').trim().toLowerCase();

    if (!ALLOWED_ROLES.includes(role)) {
      throw invalidLogin();
    }

    // Save to secure storage first, so screens that read it find the login
    // as soon as the app moves to the home screen.
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, result.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));
    } catch (error) {
      console.log('Could not save login to secure storage:', error.message);
      throw new Error('Could not save your login on this phone. Please try again.');
    }

    setSession(result.token, result.user);
    setUser(result.user);
    setToken(result.token);

    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken('');

    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      userName: user?.name || '',
      isLoggedIn: !!token,
      login,
      logout,
    }),
    [user, token, login, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}