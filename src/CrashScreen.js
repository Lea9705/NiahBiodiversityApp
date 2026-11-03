// Shown instead of the app closing by itself when something goes wrong.
// It uses only plain React Native parts, so it still works when the rest of
// the app (themes, login, database) is the thing that failed.
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

function describe(error) {
  const name = error && error.name ? error.name : 'Error';
  const message =
    error && error.message ? error.message : String(error);
  const stack =
    error && error.stack
      ? String(error.stack).split('\n').slice(0, 30).join('\n')
      : '';

  return { name, message, stack };
}

export default function CrashScreen({ error, where }) {
  const info = describe(error);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>The app hit a problem</Text>

        <Text style={styles.hint}>
          Please take a screenshot of this page and send it to the developer.
        </Text>

        {where ? <Text style={styles.where}>{where}</Text> : null}

        <Text style={styles.label}>Error</Text>
        <Text selectable style={styles.error}>
          {info.name}: {info.message}
        </Text>

        {info.stack ? (
          <View>
            <Text style={styles.label}>Details</Text>
            <Text selectable style={styles.stack}>
              {info.stack}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// Catches errors while a screen is being drawn. In a real (non-development)
// build it also catches fatal errors that would otherwise close the app.
export class CrashBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, where: '' };
  }

  static getDerivedStateFromError(error) {
    return { error, where: 'The app stopped while drawing a screen.' };
  }

  componentDidMount() {
    if (__DEV__ || !global.ErrorUtils) return;

    this.previousHandler = global.ErrorUtils.getGlobalHandler
      ? global.ErrorUtils.getGlobalHandler()
      : null;

    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      if (isFatal) {
        this.setState({ error, where: 'The app stopped unexpectedly.' });
        return;
      }

      if (this.previousHandler) {
        this.previousHandler(error, isFatal);
      }
    });
  }

  componentWillUnmount() {
    if (this.previousHandler && global.ErrorUtils) {
      global.ErrorUtils.setGlobalHandler(this.previousHandler);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <CrashScreen error={this.state.error} where={this.state.where} />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F5',
  },

  content: {
    padding: 22,
    paddingTop: 70,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8E2B23',
  },

  hint: {
    fontSize: 14,
    lineHeight: 21,
    color: '#3D2B28',
    marginTop: 10,
  },

  where: {
    fontSize: 12,
    color: '#6B5551',
    marginTop: 12,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#6B5551',
    marginTop: 22,
    marginBottom: 6,
  },

  error: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#17261C',
  },

  stack: {
    fontSize: 10,
    lineHeight: 15,
    color: '#3D2B28',
  },
});
