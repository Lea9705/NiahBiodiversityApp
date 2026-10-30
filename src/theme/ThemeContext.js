// Light / dark mode for the whole app.
// - The app starts in light mode.
// - toggleTheme() switches modes, and the choice is remembered on the phone.
// - Screens call useTheme() and rebuild their styles when the mode changes.
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

const STORAGE_KEY = 'themeMode';
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
  const [mode, setModeState] = useState(DEFAULT_MODE);
  const [ready, setReady] = useState(false);

  // Load the saved choice once, before anything is drawn.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);

        if (!cancelled && (saved === 'dark' || saved === 'light')) {
          setModeState(saved);
        }
      } catch (error) {
        console.log('Could not read the saved theme:', error.message);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Make system dialogs (alerts, keyboard) follow the in-app choice too.
  useEffect(() => {
    try {
      Appearance.setColorScheme(mode);
    } catch (error) {
      // Older systems do not support this. The app still themes itself.
    }
  }, [mode]);

  const setMode = useCallback((next) => {
    setModeState(next);

    SecureStore.setItemAsync(STORAGE_KEY, next).catch((error) => {
      console.log('Could not save the theme:', error.message);
    });
  }, []);

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

  if (!ready) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
