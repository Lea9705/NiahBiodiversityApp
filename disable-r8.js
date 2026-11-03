// Turns off Android's code shrinker (R8) for the release app.
//
// Why: the shrinker damages WorkManager (brought in by react-native-maps) and the
// installed app crashes the moment it opens. This script changes only the
// "expo-build-properties" entry in app.json. Everything else is left as it is.
//
// Run once, from the project folder:   node disable-r8.js
const fs = require('fs');

const FILE = 'app.json';

const KEEP_RULES = [
  '-keep class androidx.work.** { *; }',
  '-keep class androidx.room.** { *; }',
  '-keep class * extends androidx.room.RoomDatabase { *; }',
  '-dontwarn androidx.work.**',
].join('\n');

if (!fs.existsSync(FILE)) {
  console.log('app.json was not found here. Open Command Prompt in the project folder first.');
  process.exit(1);
}

const raw = fs.readFileSync(FILE, 'utf8');
const usesCrlf = raw.includes('\r\n');
const app = JSON.parse(raw.replace(/^\uFEFF/, ''));

if (!app.expo) {
  console.log('This app.json has no "expo" section, so nothing was changed.');
  process.exit(1);
}

const androidSettings = (existing) => ({
  ...(existing || {}),
  usesCleartextTraffic: true,
  enableMinifyInReleaseBuilds: false,
  enableShrinkResourcesInReleaseBuilds: false,
  extraProguardRules: KEEP_RULES,
});

let found = false;

const plugins = (app.expo.plugins || []).map((plugin) => {
  const name = Array.isArray(plugin) ? plugin[0] : plugin;

  if (name !== 'expo-build-properties') {
    return plugin;
  }

  found = true;

  const options = (Array.isArray(plugin) && plugin[1]) || {};

  return [
    'expo-build-properties',
    { ...options, android: androidSettings(options.android) },
  ];
});

if (!found) {
  plugins.push(['expo-build-properties', { android: androidSettings() }]);
}

app.expo.plugins = plugins;

let output = JSON.stringify(app, null, 2) + '\n';

if (usesCrlf) {
  output = output.replace(/\n/g, '\r\n');
}

fs.writeFileSync(FILE, output);

console.log('Done. app.json now turns off the code shrinker for the release app.');
console.log('Next: npx eas-cli build --platform android --profile preview');
