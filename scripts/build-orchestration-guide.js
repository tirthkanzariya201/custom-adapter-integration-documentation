const fs = require('fs');
const path = require('path');
const { normalizeBody } = require('./mdx-content-normalize');

const rootDir = path.resolve(__dirname, '..');
const orchDir = path.join(
  rootDir,
  'orchestration-sdk-integration',
  'tapmind-orchestration-sdk-integration',
  'native-android-engine',
);
const outDir = path.join(rootDir, 'guides', 'android', 'orchestration-sdk');

const SECTIONS = [
  {
    // Single consolidated page to match the client’s "Native Android" tab requirement.
    slug: 'overview',
    title: 'Native Android',
    file: path.join(orchDir, 'native-android.mdx'),
  },
];

function stripCr(line) {
  return line.replace(/\r$/, '');
}

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return { body: content };
  const end = content.indexOf('---', 3);
  if (end === -1) return { body: content };
  return { body: content.slice(end + 3).replace(/^\s+/, '') };
}

function stripLeadingH1(body) {
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length && stripCr(lines[i]).trim() === '') i++;
  const line = stripCr(lines[i] || '');
  if (line && /^#\s+/.test(line) && !/^##/.test(line)) {
    lines.splice(i, 1);
    while (i < lines.length && stripCr(lines[i]).trim() === '') lines.splice(i, 1);
  }
  return lines.join('\n').trim();
}

function readSectionBody(filePath, isOverview) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let body = parseFrontmatter(raw).body;
  body = stripLeadingH1(body);
  if (isOverview) {
    body = body.replace(/<Card[^>]*>[\s\S]*?<\/Card>/g, '');
    body = body.replace(/## Native Android[\s\S]*?(?=##|$)/, '').trim();
  }
  return normalizeBody(body.trim());
}

function writePage(section, body) {
  const content =
    body ||
    (section.slug === 'support'
      ? 'Contact your TapMind Account Manager for Orchestration SDK support.'
      : '');

  const output = `---
title: ${section.title}
description: >-
  ${section.title} for TapMind Orchestration SDK on Android.
---

${content}
`;

  const filePath = path.join(outDir, `${section.slug}.mdx`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, output.replace(/\r\n/g, '\n'), 'utf8');
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function removeLegacyPages() {
  const removed = [];
  const legacyFiles = [
    path.join(rootDir, 'guides', 'android', 'orchestration-sdk.mdx'),
    path.join(rootDir, 'guides', 'native', 'orchestration-sdk.mdx'),
  ];
  for (const filePath of legacyFiles) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      removed.push(path.relative(rootDir, filePath).replace(/\\/g, '/'));
    }
  }
  return removed;
}

const generated = [];
for (const section of SECTIONS) {
  const body = readSectionBody(section.file, section.isOverview);
  generated.push(writePage(section, body));
}

const removed = removeLegacyPages();
if (removed.length) {
  console.log('Removed legacy orchestration pages:', removed.join(', '));
}

fs.writeFileSync(
  path.join(__dirname, 'orchestration-build-manifest.json'),
  JSON.stringify({ generated }, null, 2),
);

console.log(`Built ${generated.length} Orchestration SDK pages:`);
for (const rel of generated) {
  console.log(`  ${rel}`);
}

module.exports = { SECTIONS, generated };
