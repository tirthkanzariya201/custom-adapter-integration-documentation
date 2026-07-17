/**
 * Simulate naive agent markdown export: strip imports/components, count fences.
 */
const fs = require('fs');
const path = require('path');

function stripFrontmatter(text) {
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('---', 3);
  if (end === -1) return text;
  return text.slice(end + 3);
}

function listMdx(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listMdx(full, files);
    else if (entry.name.endsWith('.mdx')) files.push(full);
  }
  return files;
}

function simulateAgentMarkdown(body) {
  let out = body;
  out = out.replace(/^import\s.+$/gm, '');
  out = out.replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, '');
  out = out.replace(/<(?:Callout|Tabs|Tab|Columns|Card)[^>]*>[\s\S]*?<\/(?:Callout|Tabs|Tab|Columns|Card)>/g, '');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

function fenceState(text) {
  const matches = text.match(/```/g) || [];
  return { count: matches.length, balanced: matches.length % 2 === 0 };
}

const docsPages = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../docs.json'), 'utf8'),
);

function collectPages(node, out = []) {
  if (node.page) out.push(node.page + '.mdx');
  if (node.pages) node.pages.forEach((p) => collectPages(p, out));
  return out;
}

const pages = [];
for (const tab of docsPages.navigation.tabs) {
  if (tab.pages) tab.pages.forEach((p) => collectPages(p, pages));
  if (tab.groups) tab.groups.forEach((g) => g.pages.forEach((p) => collectPages(p, pages)));
}

const root = path.join(__dirname, '..');
const bad = [];
for (const page of pages) {
  const file = path.join(root, page.replace(/\//g, path.sep));
  if (!fs.existsSync(file)) {
    bad.push({ page, issue: 'missing' });
    continue;
  }
  const raw = stripFrontmatter(fs.readFileSync(file, 'utf8'));
  const source = fenceState(raw);
  const exported = fenceState(simulateAgentMarkdown(raw));
  if (!source.balanced) {
    bad.push({ page, issue: 'source-unbalanced', count: source.count });
  } else if (!exported.balanced) {
    bad.push({ page, issue: 'export-unbalanced', count: exported.count });
  }
}

console.log(`Checked ${pages.length} nav pages`);
console.log(JSON.stringify(bad, null, 2));
