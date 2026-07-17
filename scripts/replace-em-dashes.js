/**
 * Replace em dashes and en dashes in published documentation content.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const GLOBS = [
  'getting-started',
  'reference',
  'snippets',
  'gradle-setup',
  'guides',
  'overview.mdx',
  'README.mdx',
  'scripts/gma',
];

function collectFiles(dirOrFile) {
  const full = path.join(rootDir, dirOrFile);
  if (!fs.existsSync(full)) return [];
  const stat = fs.statSync(full);
  if (stat.isFile()) return [full];
  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const child = path.join(full, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(path.relative(rootDir, child)));
    else if (/\.(mdx|md|js)$/.test(entry.name)) out.push(child);
  }
  return out;
}

function transform(content) {
  let next = content;
  // Prose em dash with spaces
  next = next.replace(/ — /g, ' - ');
  // Table n/a placeholders (em dash alone in cells)
  next = next.replace(/\| — \|/g, '| n/a |');
  next = next.replace(/\| —$/gm, '| n/a');
  // En dash ranges in prose (not in URLs)
  next = next.replace(/Q(\d+)–(\d+)/g, 'Q$1-$2');
  return next;
}

let changed = 0;
for (const rel of GLOBS) {
  for (const file of collectFiles(rel)) {
    const raw = fs.readFileSync(file, 'utf8');
    const next = transform(raw);
    if (next !== raw) {
      fs.writeFileSync(file, next, 'utf8');
      changed++;
      console.log('Updated:', path.relative(rootDir, file));
    }
  }
}

console.log(`Done. ${changed} file(s) updated.`);
