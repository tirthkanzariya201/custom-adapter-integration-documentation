/**
 * Validates agent-readable markdown fence balance for all docs.json nav pages.
 * Applies the same prepareForAgentMarkdown pass used at build time.
 */
const fs = require('fs');
const path = require('path');
const { normalizeAgentSafeMarkdown } = require('./mdx-content-normalize');

const rootDir = path.resolve(__dirname, '..');
const docs = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs.json'), 'utf8'));

function collectPages(nodes, pages = []) {
  for (const node of nodes) {
    if (typeof node === 'string') pages.push(node);
    else if (node.page) pages.push(node.page);
    else if (node.pages) collectPages(node.pages, pages);
    else if (node.groups) collectPages(node.groups, pages);
  }
  return pages;
}

function stripFrontmatter(text) {
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('---', 3);
  if (end === -1) return text;
  return text.slice(end + 3);
}

const pages = [...new Set(collectPages(docs.navigation.tabs))];
const problems = [];

for (const page of pages) {
  const file = path.join(rootDir, `${page}.mdx`);
  if (!fs.existsSync(file)) {
    problems.push({ page, issue: 'missing file' });
    continue;
  }
  const raw = fs.readFileSync(file, 'utf8');
  const body = normalizeAgentSafeMarkdown(stripFrontmatter(raw));
  const fences = body.match(/```/g) || [];
  if (fences.length % 2 !== 0) {
    problems.push({ page, issue: 'odd fence count', count: fences.length });
  }
}

console.log(`Checked ${pages.length} nav pages`);
console.log(JSON.stringify(problems, null, 2));
