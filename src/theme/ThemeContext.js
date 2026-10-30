// Light / dark mode for the whole app.
// - Visitors (not logged in) always start in light mode. They can switch for
//   the moment, but it is not remembered.
// - Staff get the mode they tapped last time as soon as they log in. Their
//   choice is saved on the phone every time they tap the button.
// - When staff log out, the app goes back to light mode.
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors } from './colors';
import { useUser } from '../context/UserContext';

const STAFF_KEY = 'staffThemeMode';
const DEFAULT_MODE = 'light';

const ThemeContext = createContext({
  mode: DEFAULT_MODE,
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setMode: () => {},
  // pick(darkValue, lightValue) returns the value for the current mode.
  pick: (dark, light) => light,
});

export function ThemeProvider({ children }) {
  const { isLoggedIn } = useUser();
  const [mode, setModeState] = useState(DEFAULT_MODE);

  // Log in: use the mode this staff member chose last time (light if none).
  // Log out, or never logged in: light.
  useEffect(() => {
    let cancelled = false;

    if (!isLoggedIn) {
      setModeState(DEFAULT_MODE);
      return undefined;
    }

    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STAFF_KEY);

        if (!cancelled) {
          setModeState(saved === 'dark' ? 'dark' : DEFAULT_MODE);
        }
      } catch (error) {
        console.log('Could not read the saved theme:', error.message);
        if (!cancelled) setModeState(DEFAULT_MODE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // Make system dialogs (alerts, keyboard) follow the in-app choice too.
  useEffect(() => {
    try {
      Appearance.setColorScheme(mode);
    } catch (error) {
      // Older systems do not support this. The app still themes itself.
    }
  }, [mode]);

  const setMode = useCallback(
    (next) => {
      setModeState(next);

      // Only staff choices are remembered.
      if (isLoggedIn) {
        SecureStore.setItemAsync(STAFF_KEY, next).catch((error) => {
          console.log('Could not save the theme:', error.message);
        });
      }
    },
    [isLoggedIn]
  );

  const toggleTheme = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: mode === 'dark' ? darkColors : lightColors,
      toggleTheme,
      setMode,
      pick: (dark, light) => (mode === 'dark' ? dark : light),
    }),
    [mode, toggleTheme, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
