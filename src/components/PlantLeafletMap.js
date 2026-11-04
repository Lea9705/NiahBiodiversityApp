// The map. It shows the Leaflet page (src/utils/leafletHtml.js) inside a
// WebView, sends it the pins, and tells the app when a pin's "Open record"
// button is tapped.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { LEAFLET_HTML } from '../utils/leafletHtml';

// The page's own address. Anything else (for example a link in the map's
// credits) is opened in the phone's browser, not inside the map.
const PAGE_ORIGIN = 'https://localhost';

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

  const pinsScript = useMemo(() => pinsToScriptValue(pins), [pins]);

  // Send the pins whenever the page is ready or the pins change.
  useEffect(() => {
    if (!ready || !webViewRef.current) return;

    webViewRef.current.injectJavaScript(
      `window.setPins && window.setPins(${pinsScript}); true;`
    );
  }, [ready, pinsScript]);

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
        ref={webViewRef}
        source={{ html: LEAFLET_HTML, baseUrl: `${PAGE_ORIGIN}/` }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onLoadStart={() => setReady(false)}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStart}
        style={[styles.webView, { backgroundColor }]}
      />

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
    overflow: 'hidden',
  },

  webView: {
    flex: 1,
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
