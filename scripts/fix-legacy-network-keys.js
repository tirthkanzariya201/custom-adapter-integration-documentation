/**
 * Replace legacy LevelPlay network key values in GitBook source trees.
 * Canonical key: 15c11cb1d
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const targets = [
  path.join(rootDir, 'tapmind-custom-adapter-sdk-integration'),
  path.join(rootDir, 'next-gen-sdk-integration'),
];

const replacements = [
  ['15c101ba1', '15c11cb1d'],
  ['15c101cb1d', '15c11cb1d'],
  ['15c11cbd1', '15c11cb1d'],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(md|mdx)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

let updated = 0;
for (const dir of targets) {
  for (const file of walk(dir)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    for (const [from, to] of replacements) {
      content = content.split(from).join(to);
    }
    if (content !== original) {
      fs.writeFileSync(file, content.replace(/\r\n/g, '\n'), 'utf8');
      updated += 1;
    }
  }
}

console.log(`Updated ${updated} legacy source files with canonical network key.`);
