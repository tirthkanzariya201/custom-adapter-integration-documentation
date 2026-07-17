const fs = require('fs');
const path = require('path');

function listMdx(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listMdx(full, files);
    else if (entry.name.endsWith('.mdx')) files.push(full);
  }
  return files;
}

function stripFrontmatter(text) {
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('---', 3);
  if (end === -1) return text;
  return text.slice(end + 3);
}

const roots = process.argv.slice(2);
const scanRoots = roots.length
  ? roots
  : [
      'getting-started',
      'gradle-setup',
      'reference',
      'guides',
      'snippets',
      'overview.mdx',
    ];

const odd = [];
function scan(file) {
  if (!fs.existsSync(file)) return;
  if (fs.statSync(file).isFile()) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) return;
    checkFile(file);
    return;
  }
  for (const f of listMdx(file)) checkFile(f);
}

function checkFile(file) {
    const body = stripFrontmatter(fs.readFileSync(file, 'utf8'));
    const matches = body.match(/```/g) || [];
    if (matches.length % 2 !== 0) {
      odd.push({ file: path.relative(process.cwd(), file).replace(/\\/g, '/'), count: matches.length });
    }
}

for (const root of scanRoots) {
  scan(path.resolve(root));
}

console.log(JSON.stringify(odd, null, 2));
