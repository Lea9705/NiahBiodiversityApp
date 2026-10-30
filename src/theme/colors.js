// Shared colour palettes for the app's two themes.
// ThemeContext picks the set that matches the current mode, so change values
// here to re-theme the shared components (buttons, inputs, bottom bar...).

export const lightColors = {
  bg: '#F7F8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF3EC',
  border: '#C9D6C5',
  borderSubtle: '#DDE6DA',
  textPrimary: '#17261C',
  textSecondary: '#4D6052',
  textMuted: '#5C6E60',
  warningBg: '#FBEED0',
  warningText: '#8A5A00',
  successBg: '#DDF0E1',
  successText: '#1F6B3A',
  accentBg: '#E1EEF9',
  accentText: '#1F6FB0',
  buttonBg: '#2A7A45',
  buttonText: '#FFFFFF',
  errorText: '#B3392F',
};

export const darkColors = {
  bg: '#171614',
  surface: '#201F1C',
  surfaceAlt: '#2A2823',
  border: '#4A4844',
  borderSubtle: '#3A3833',
  textPrimary: '#F0EEE6',
  textSecondary: '#A6A399',
  textMuted: '#78766E',
  warningBg: '#4A3510',
  warningText: '#F2B84B',
  successBg: '#1F3010',
  successText: '#8FC15A',
  accentBg: '#16324A',
  accentText: '#6FB0EC',
  buttonBg: '#F0EEE6',
  buttonText: '#171614',
  errorText: '#E5484D',
};

// Kept so any older `import { colors }` still works (light is the default).
export const colors = lightColors;
