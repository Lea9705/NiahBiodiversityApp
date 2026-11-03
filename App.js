// Safe start.
// If the app fails while it is starting, or while a screen is drawn, the error is
// shown on the screen instead of the app closing by itself. In normal use this
// just starts the real app, which lives in src/AppMain.js.
import React from 'react';
import CrashScreen, { CrashBoundary } from './src/CrashScreen';

let AppMain = null;
let startupError = null;

try {
  // Loading the app can fail (for example a library that is missing from the
  // installed app). That error is caught here and shown.
  AppMain = require('./src/AppMain').default;
} catch (error) {
  startupError = error;
}

export default function App() {
  if (startupError) {
    return <CrashScreen error={startupError} where="The app could not start." />;
  }

  return (
    <CrashBoundary>
      <AppMain />
    </CrashBoundary>
  );
}
