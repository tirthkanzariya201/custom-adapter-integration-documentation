const fs = require('fs');
const path = require('path');

const roots = [
  path.join(__dirname, '..', 'orchestration-sdk-integration'),
  path.join(__dirname, '..', 'next-gen-sdk-integration'),
];

const AGENT_BLOCK = /\r?\n---\r?\n\r?\n# Agent Instructions[\s\S]*$/;

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  content = content.replace(AGENT_BLOCK, '\n');
  content = content.replace(/\n###\s*\n/g, '\n');
  content = content.replace(/\n{3,}/g, '\n\n');
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walk(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += walk(full);
    else if (entry.name.endsWith('.mdx')) {
      if (cleanFile(full)) count++;
    }
  }
  return count;
}

let total = 0;
for (const root of roots) {
  if (fs.existsSync(root)) total += walk(root);
}
console.log('Cleaned', total, 'files');
