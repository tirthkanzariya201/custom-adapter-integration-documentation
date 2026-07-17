const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const base = path.join(rootDir, 'tapmind-custom-adapter-sdk-integration/native-android-engine');
const outFile = path.join(base, 'integration-guide.poc.mdx');

const NETWORKS = [
  {
    title: 'AdMob',
    readme: 'admob/README.mdx',
    installation: 'admob/installation.mdx',
    configuration: 'admob/configuration.mdx',
  },
  {
    title: 'Google Ad Manager',
    readme: 'google-ad-manager/README.mdx',
    installation: 'google-ad-manager/installation.mdx',
    configuration: 'google-ad-manager/configuration.mdx',
  },
  {
    title: 'AppLovin',
    readme: 'applovin/README.mdx',
    installation: 'applovin/installation.mdx',
    configuration: 'applovin/configuration.mdx',
  },
  {
    title: 'IronSource LevelPlay',
    readme: 'ironsource-levelplay/README.mdx',
    installation: 'ironsource-levelplay/installation.mdx',
    configuration: 'ironsource-levelplay/configuration.mdx',
  },
];

function stripCr(line) {
  return line.replace(/\r$/, '');
}

function extractImports(raw) {
  const imports = [];
  for (const line of raw.split('\n')) {
    const m = stripCr(line).match(/^import\s+.+$/);
    if (m) imports.push(m[0].trim());
  }
  return imports;
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

function removeImportLines(body) {
  return body
    .split('\n')
    .filter((line) => !/^import\s+.+$/.test(stripCr(line).trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function demoteHeadings(body, levels) {
  return body
    .split('\n')
    .map((line) => {
      const clean = stripCr(line);
      const m = clean.match(/^(#{1,6})(\s+.+)$/);
      if (!m) return line;
      const newLevel = Math.min(6, m[1].length + levels);
      return '#'.repeat(newLevel) + m[2];
    })
    .join('\n');
}

function readSection(relPath, demoteBy) {
  const full = path.join(base, relPath);
  const raw = fs.readFileSync(full, 'utf8');
  const imports = extractImports(raw);
  let body = parseFrontmatter(raw).body;
  body = removeImportLines(body);
  body = stripLeadingH1(body);
  if (demoteBy > 0) body = demoteHeadings(body, demoteBy);
  return { imports, body };
}

const allImports = new Set();
const parts = [];

const platform = readSection('README.mdx', 0);
platform.imports.forEach((i) => allImports.add(i));
parts.push(`# Native Android Integration Guide

${platform.body}
`);

for (const network of NETWORKS) {
  const readme = readSection(network.readme, 0);
  const installation = readSection(network.installation, 1);
  const configuration = readSection(network.configuration, 1);

  [readme, installation, configuration].forEach((s) => s.imports.forEach((i) => allImports.add(i)));

  parts.push(`## ${network.title}

${readme.body}

### Installation

${installation.body}

### Configuration

${configuration.body}
`);
}

const importBlock = [...allImports].sort().join('\n');
const output = `---
description: >-
  Native Android integration guide for TapMind Custom Adapter across AdMob,
  Google Ad Manager, AppLovin, and IronSource LevelPlay.
---

${importBlock ? `${importBlock}\n\n` : ''}${parts.join('\n')}
`;

fs.writeFileSync(outFile, output.replace(/\r\n/g, '\n'), 'utf8');
console.log('Wrote', path.relative(rootDir, outFile));
console.log('Imports:', [...allImports].join(', '));
console.log('H2 sections:', NETWORKS.map((n) => n.title).join(', '));
