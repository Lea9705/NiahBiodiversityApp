// Removes files the app does not use.
//
// Run it from the project folder:
//   node cleanup.js                shows what it WOULD delete (deletes nothing)
//   node cleanup.js --go           deletes them
//   node cleanup.js --go --iot     also deletes the old IoT screen files
const fs = require('fs');
const path = require('path');

const go = process.argv.includes('--go');
const withIot = process.argv.includes('--iot');

if (!fs.existsSync('package.json') || !fs.existsSync('app.json') || !fs.existsSync('src')) {
  console.log('This does not look like the project folder (package.json, app.json or src is missing).');
  console.log('Open Command Prompt in the project folder first. Nothing was deleted.');
  process.exit(1);
}

const sizeOf = (p) => {
  const s = fs.statSync(p);
  if (!s.isDirectory()) return s.size;
  return fs.readdirSync(p).reduce((t, n) => t + sizeOf(path.join(p, n)), 0);
};
const human = (n) =>
  n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n > 1024 ? Math.round(n / 1024) + ' KB' : n + ' bytes';
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Code files, and what to delete.
const CODE = [
  ['src/components/RecordListItem.js', 'an old list item that no screen uses'],
  ['src/screens/RecordsScreen.js', 'an old screen that is not in the app any more'],
  ['src/screens/BotanistProfileScreen-LAPTOP-V9509ADH.js', 'a duplicate copy made by OneDrive/Git on another laptop'],
];
const IOT = [
  ['src/screens/IotScreen.js', 'the IoT page (replaced by the Map)'],
  ['src/services/iotApi.js', 'the IoT data code (only the IoT page used it)'],
];
const candidates = [...CODE, ...(withIot ? IOT : [])].filter(([p]) => fs.existsSync(p));

// Every other code file that stays. If one of them still loads a file we are
// about to delete, that file is NOT deleted.
const walk = (d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
};
const norm = (p) => p.replace(/\\/g, '/');
const deleting = new Set(candidates.map(([p]) => norm(p)));
const staying = [...walk('src'), 'App.js'].filter((f) => fs.existsSync(f) && !deleting.has(norm(f)));
const stayingText = staying.map((f) => [f, fs.readFileSync(f, 'utf8')]);

const stillLoadedBy = (file) => {
  const base = path.basename(file, '.js');
  const re = new RegExp('[\'"]([^\'"]*/)?' + escapeRe(base) + '(\\.js)?[\'"]');
  const hit = stayingText.find(([, text]) => re.test(text));
  return hit ? norm(hit[0]) : null;
};

const items = [
  { p: 'crash-log.txt', why: 'an old crash log from the phone' },
  { p: 'full-crash.txt', why: 'an old crash log from the phone' },
  { p: 'package.json.bak', why: 'a backup copy of package.json' },
  { p: 'package-lock.json.bak', why: 'a backup copy of package-lock.json' },
  { p: 'install-log.txt', why: 'an old install log' },
  { p: 'disable-r8.js', why: 'a one-time helper that has already been used' },
  {
    p: 'dist',
    why: 'build output from "expo export" (it is made again when needed)',
    guard: () => (fs.existsSync('dist/metadata.json') || fs.existsSync('dist/assetmap.json') ? null : 'it does not look like build output'),
  },
  {
    p: 'docs',
    why: 'an empty folder',
    guard: () => (fs.statSync('docs').isDirectory() && fs.readdirSync('docs').length === 0 ? null : 'it is not empty'),
  },
  ...candidates.map(([p, why]) => ({ p, why, guard: () => { const by = stillLoadedBy(p); return by ? `${by} still loads it` : null; } })),
  {
    p: 'assets/splash.png',
    why: 'an image that app.json and the code never use',
    guard: () => {
      const inJson = fs.readFileSync('app.json', 'utf8').includes('splash.png');
      const inCode = stayingText.some(([, t]) => t.includes('splash.png'));
      return inJson || inCode ? 'something still refers to it' : null;
    },
  },
];

let total = 0;
let count = 0;
const skipped = [];

console.log(go ? 'Deleting:\n' : 'Nothing is deleted yet. This is what WOULD be deleted:\n');

for (const item of items) {
  if (!fs.existsSync(item.p)) continue;

  const problem = item.guard ? item.guard() : null;
  if (problem) { skipped.push(`${item.p}  (kept: ${problem})`); continue; }

  const size = sizeOf(item.p);
  total += size;
  count += 1;
  console.log(`  ${item.p}  (${human(size)})  - ${item.why}`);

  if (go) {
    try {
      fs.rmSync(item.p, { recursive: true, force: true });
    } catch (e) {
      console.log(`     could not delete it: ${e.message}`);
    }
  }
}

// An empty services folder is left behind when the IoT code is removed.
if (go && fs.existsSync('src/services') && fs.readdirSync('src/services').length === 0) {
  fs.rmdirSync('src/services');
}

// Keep the big log files out of Git and out of the cloud build from now on.
const IGNORE = ['crash-log.txt', 'full-crash.txt', '*.bak'];
if (fs.existsSync('.gitignore')) {
  const raw = fs.readFileSync('.gitignore', 'utf8');
  const crlf = raw.includes('\r\n');
  const have = new Set(raw.split(/\r?\n/).map((l) => l.trim()));
  const missing = IGNORE.filter((l) => !have.has(l));

  if (missing.length) {
    if (go) {
      const eol = crlf ? '\r\n' : '\n';
      const text = raw.endsWith('\n') || raw === '' ? raw : raw + eol;
      fs.writeFileSync('.gitignore', text + missing.join(eol) + eol);
      console.log(`\n.gitignore: added ${missing.join(', ')} so such files are never uploaded again.`);
    } else {
      console.log(`\n.gitignore: would add ${missing.join(', ')}`);
    }
  }
}

if (skipped.length) {
  console.log('\nLeft alone on purpose:');
  skipped.forEach((s) => console.log('  ' + s));
}

if (count === 0) {
  console.log('Nothing to delete. The project is already clean.');
} else {
  console.log(`\n${count} item${count === 1 ? '' : 's'}, ${human(total)} in total.`);
  console.log(go ? 'Done. Now check the app: npx expo start -c' : 'To really delete them, run:  node cleanup.js --go');
}
