/**
 * Generates reference/class-network-key-registry.mdx from scripts/gma/class-registry.js
 */
const fs = require('fs');
const path = require('path');
const { REGISTRY } = require('./gma/class-registry');
const { MEDIATION_DISPLAY_TITLES } = require('./gma/doc-constants');

const rootDir = path.resolve(__dirname, '..');
const outPath = path.join(rootDir, 'reference', 'class-network-key-registry.mdx');

const GMA_MEDIATIONS = ['admob', 'google-ad-manager', 'applovin', 'levelplay'];
const NEXTGEN_MEDIATIONS = ['admob', 'google-ad-manager'];

const GMA_PACKAGES = [
  { label: 'Native', androidKey: 'native-android', iosKey: 'native-ios' },
  { label: 'Flutter', androidKey: 'flutter', iosKey: 'flutter' },
  { label: 'React Native', androidKey: 'react-native', iosKey: 'react-native' },
  { label: 'Unity', androidKey: 'unity', iosKey: 'unity' },
  { label: 'Cocos', androidKey: 'cocos', iosKey: 'cocos' },
];

function mediationLabel(key) {
  return MEDIATION_DISPLAY_TITLES[key] || key;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatCodeCell(value) {
  if (value === 'n/a') return 'n/a';
  return `<code>${escapeHtml(value)}</code>`;
}

function buildRegistryTable(rows) {
  const lines = [
    '<table class="registry-table">',
    '<thead>',
    '<tr><th>Package</th><th>Mediation</th><th>Android class</th><th>iOS class</th></tr>',
    '</thead>',
    '<tbody>',
  ];

  for (const [pkg, mediation, android, ios] of rows) {
    lines.push(
      `<tr><td>${escapeHtml(pkg)}</td><td>${escapeHtml(mediation)}</td><td>${formatCodeCell(android)}</td><td>${formatCodeCell(ios)}</td></tr>`,
    );
  }

  lines.push('</tbody>', '</table>');
  return lines.join('\n');
}

function androidClass(frameworkKey, mediation) {
  const entry = REGISTRY[frameworkKey]?.[mediation];
  if (!entry) return 'n/a';
  if (entry.networkKey) return entry.networkKey;
  if (entry.className) return entry.className;
  return entry.android || 'n/a';
}

function iosClass(frameworkKey, mediation) {
  const entry = REGISTRY[frameworkKey]?.[mediation];
  if (!entry) return 'n/a';
  if (entry.networkKey) return entry.networkKey;
  if (entry.className && frameworkKey === 'native-ios') return entry.className;
  if (entry.ios) return entry.ios;
  return 'n/a';
}

function buildGmaTable() {
  const rows = [];

  for (const pkg of GMA_PACKAGES) {
    for (const mediation of GMA_MEDIATIONS) {
      const android = androidClass(pkg.androidKey, mediation);
      const ios = iosClass(pkg.iosKey, mediation);
      if (android === 'n/a' && ios === 'n/a') continue;
      rows.push([pkg.label, mediationLabel(mediation), android, ios]);
    }
  }

  return buildRegistryTable(rows);
}

function buildNextGenTable() {
  const rows = NEXTGEN_MEDIATIONS.map((mediation) => {
    const entry = REGISTRY['next-gen-android'][mediation];
    return ['Native', mediationLabel(mediation), entry.className, 'n/a'];
  });

  return buildRegistryTable(rows);
}

const body = `---
title: Class & Network Key Registry
description: The canonical class strings and network key for every SDK product and mediation.
---

Every integration page references class names and network keys. This page is the single source of truth - integration pages link here instead of duplicating values.

## How to use this page

1. Find your SDK product, framework, and mediation partner in the tables below.
2. Copy the class name (or network key for LevelPlay) **exactly** into your mediation dashboard. Long class names wrap in the table - click a class name to select the full string, then copy.
3. If ads fail in release builds, see [Troubleshooting](/reference/troubleshooting) - consumer ProGuard rules ship in the published AARs.

## Custom Adapter (GMA SDK)

${buildGmaTable()}

## Custom Adapter (GMA Next-Gen SDK)

${buildNextGenTable()}
`;

fs.writeFileSync(outPath, body.replace(/\r\n/g, '\n'), 'utf8');
console.log('Wrote', path.relative(rootDir, outPath));
