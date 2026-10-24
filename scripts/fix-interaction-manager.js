// React Native 0.87+ removed InteractionManager, but React Navigation's
// stack still calls createInteractionHandle / clearInteractionHandle.
// Those handles have done nothing since React Native 0.82, so this script
// replaces the calls with "undefined". It runs after every npm install
// and is safe to run more than once.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', '@react-navigation');
let changedFiles = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8');
      if (!text.includes('InteractionManager')) continue;

      const updated = text
        .replace(/InteractionManager\.createInteractionHandle\(\)/g, 'undefined')
        .replace(/InteractionManager\.clearInteractionHandle\([^)]*\)/g, 'undefined');

      if (updated !== text) {
        fs.writeFileSync(full, updated);
        changedFiles += 1;
      }
    }
  }
}

walk(root);
console.log(`fix-interaction-manager: patched ${changedFiles} file(s).`);
