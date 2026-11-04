// Changes the app version in app.json. Everything else is left as it is.
//
// Run once, from the project folder:   node bump-version.js 1.1.0
const fs = require('fs');

const FILE = 'app.json';
const wanted = process.argv[2];

if (!wanted || !/^\d+\.\d+\.\d+$/.test(wanted)) {
  console.log('Please type the new version after the file name, for example:');
  console.log('  node bump-version.js 1.1.0');
  process.exit(1);
}

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

const before = app.expo.version;
app.expo.version = wanted;

let output = JSON.stringify(app, null, 2) + '\n';

if (usesCrlf) {
  output = output.replace(/\n/g, '\r\n');
}

fs.writeFileSync(FILE, output);

console.log(`Done. The app version was ${before} and is now ${wanted}.`);
