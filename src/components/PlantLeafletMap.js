// The map. It shows the Leaflet page (src/utils/leafletHtml.js) inside a
// WebView, sends it the pins, and tells the app when a pin's "Open record"
// button is tapped.
//
// It never sits blank and silent: it says "Loading map..." while it starts,
// shows the reason when the page cannot load, and reloads the page by itself
// (waiting a little longer each time).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Linking,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LEAFLET_HTML } from '../utils/leafletHtml';

// The page's own address. Anything else (for example a link in the map's
// credits) is opened in the phone's browser, not inside the map.
const PAGE_ORIGIN = 'https://localhost';

// How long to wait for the map page to start before loading it again:
// 15s the first time, then 30s, 45s ... never more than 60s.
const WAIT_STEP_MS = 15000;
const MAX_WAIT_MS = 60000;

// Turns the pins into text that is safe to put inside a script.
export function pinsToScriptValue(pins) {
  return JSON.stringify(pins || [])
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export default function PlantLeafletMap({
  pins,
  onOpenPin,
  backgroundColor = '#E6EEE4',
  textColor = '#17261C',
}) {
  const webViewRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState('');

  // Goes up by one each time the page is loaded again.
  const [attempt, setAttempt] = useState(0);

  const pinsScript = useMemo(() => pinsToScriptValue(pins), [pins]);

  // Send the pins whenever the page is ready or the pins change.
  useEffect(() => {
    if (!ready || !webViewRef.current) return;

    webViewRef.current.injectJavaScript(
      `window.setPins && window.setPins(${pinsScript}); true;`
    );
  }, [ready, pinsScript]);

  // The page must say "ready" soon. If it does not, say so and load it again.
  useEffect(() => {
    if (ready) return undefined;

    const wait = Math.min(WAIT_STEP_MS * (attempt + 1), MAX_WAIT_MS);

    const timer = setTimeout(() => {
      setProblem((current) =>
        current ||
        'The map is taking a long time to load. Check the internet connection.'
      );
      setAttempt((n) => n + 1);
    }, wait);

    return () => clearTimeout(timer);
  }, [ready, attempt]);

  const handleMessage = (event) => {
    let message;

    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch (error) {
      return;
    }

    if (message.type === 'ready') {
      setProblem('');
      setReady(true);
    } else if (message.type === 'open' && message.id !== undefined) {
      if (onOpenPin) onOpenPin(String(message.id));
    } else if (message.type === 'error') {
      setProblem(message.message || 'The map could not load.');
    }
  };

  const handleError = (event) => {
    const description =
      (event && event.nativeEvent && event.nativeEvent.description) ||
      'unknown problem';

    setReady(false);
    setProblem(`The map page could not load (${description}). Trying again...`);
  };

  const handleHttpError = (event) => {
    const code = event && event.nativeEvent && event.nativeEvent.statusCode;

    setProblem(`The map page could not load (error ${code || '?'}). Trying again...`);
  };

  // Android can stop the WebView's process to free memory. Start it again.
  const handleProcessGone = () => {
    setReady(false);
    setProblem('The map stopped working. Starting it again...');
    setAttempt((n) => n + 1);
  };

  const handleShouldStart = (request) => {
    const url = String((request && request.url) || '');

    if (url === 'about:blank' || url.startsWith(PAGE_ORIGIN)) {
      return true;
    }

    Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <WebView
        key={attempt}
        ref={webViewRef}
        source={{ html: LEAFLET_HTML, baseUrl: `${PAGE_ORIGIN}/` }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onLoadStart={() => setReady(false)}
        onMessage={handleMessage}
        onError={handleError}
        onHttpError={handleHttpError}
        onRenderProcessGone={handleProcessGone}
        onContentProcessDidTerminate={handleProcessGone}
        onShouldStartLoadWithRequest={handleShouldStart}
        style={[styles.webView, { backgroundColor }]}
      />

      {!ready && !problem && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={textColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading map...
          </Text>
        </View>
      )}

      {!!problem && (
        <View style={styles.problem}>
          <Text style={[styles.problemText, { color: textColor }]}>
            {problem}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Clipping a WebView with rounded corners can make it draw nothing on
    // some Android phones, so only iPhone clips.
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
  },

  webView: {
    flex: 1,
  },

  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
  },

  problem: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  problemText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
