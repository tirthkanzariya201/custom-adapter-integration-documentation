/**
 * Builds per-OS, per-mediation guide pages for Native (phase 1).
 * Output: guides/{android|ios}/{product}/{mediation}.mdx
 *
 * Each mediation page uses H2 Installation + H2 Configuration for the right TOC.
 */

const fs = require('fs');
const path = require('path');
const { normalizeBody } = require('./mdx-content-normalize');
const { assembleNativeOsPage, assembleNextGenPage } = require('./gma/assemble-page');

const rootDir = path.resolve(__dirname, '..');
const guidesDir = path.join(rootDir, 'guides');

const { MEDIATION_DISPLAY_TITLES, MEDIATION_ORDER, resolveMediationSourceDir } = require('./gma/doc-constants');

const NETWORK_ORDER = MEDIATION_ORDER;

const NETWORK_TITLES = MEDIATION_DISPLAY_TITLES;

const OS_CONFIG = {
  android: { engineSuffix: 'android-engine', label: 'Android' },
  ios: { engineSuffix: 'ios-engine', label: 'iOS' },
};

const PRODUCT_CONFIG = {
  'custom-adapter-gma-sdk': {
    label: 'Custom Adapter (GMA SDK)',
    contentRoot: path.join(rootDir, 'tapmind-custom-adapter-sdk-integration'),
    wrapper: 'native',
    introSource: 'readme',
    platforms: ['android', 'ios'],
    mediations: null,
  },
  'custom-adapter-gma-next-gen-sdk': {
    label: 'Custom Adapter (GMA Next-Gen SDK)',
    contentRoot: path.join(rootDir, 'next-gen-sdk-integration', 'next-gen-integration-sdk'),
    wrapper: 'native',
    introSource: 'platform-mdx',
    platforms: ['android'],
    mediations: ['admob', 'google-ad-manager'],
  },
};

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

function normalizeBodyLocal(body) {
  return normalizeBody(body);
}

function firstExisting(baseDir, candidates) {
  for (const rel of candidates) {
    const full = path.join(baseDir, rel);
    if (fs.existsSync(full)) return rel;
  }
  return null;
}

function readSection(baseDir, relPath, demoteBy) {
  const full = path.join(baseDir, relPath);
  if (!fs.existsSync(full)) return { imports: [], body: '' };
  const raw = fs.readFileSync(full, 'utf8');
  const imports = extractImports(raw);
  let body = parseFrontmatter(raw).body;
  body = removeImportLines(body);
  body = stripLeadingH1(body);
  if (demoteBy > 0) body = demoteHeadings(body, demoteBy);
  body = normalizeBodyLocal(body);
  return { imports, body };
}

function resolveInstallOrConfig(baseDir, networkKey, kind) {
  const sourceDir = resolveMediationSourceDir(networkKey);
  return firstExisting(baseDir, [
    `${sourceDir}/${kind}.mdx`,
    `${sourceDir}/${kind}.md`,
  ]);
}

function resolveReadme(baseDir, networkKey) {
  const sourceDir = resolveMediationSourceDir(networkKey);
  return firstExisting(baseDir, [
    `${sourceDir}.mdx`,
    `${sourceDir}/README.mdx`,
    `${sourceDir}/README.md`,
  ]);
}

function hasInstallation(baseDir, networkKey) {
  return Boolean(resolveInstallOrConfig(baseDir, networkKey, 'installation'));
}

function discoverMediations(engineDir, fixedList) {
  if (fixedList) {
    return fixedList.filter((key) => hasInstallation(engineDir, key));
  }
  return NETWORK_ORDER.filter((key) => hasInstallation(engineDir, key));
}

function readProductIntro(product, os) {
  const engineKey = `${product.wrapper}-${os}-engine`;
  const baseDir = path.join(product.contentRoot, engineKey);
  if (product.introSource === 'platform-mdx') {
    const rel = `${engineKey}.mdx`;
    if (fs.existsSync(path.join(product.contentRoot, rel))) {
      return readSection(product.contentRoot, rel, 0);
    }
  }
  return readSection(baseDir, 'README.mdx', 0);
}

function writeMdx(filePath, frontmatter, importSet, body) {
  const imports = [...importSet].sort().join('\n');
  const output = `---
title: ${frontmatter.title}
description: >-
  ${frontmatter.description}
---

${imports ? `${imports}\n\n` : ''}${body}
`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, output.replace(/\r\n/g, '\n'), 'utf8');
}

function buildProductForOs(os, productKey) {
  const product = PRODUCT_CONFIG[productKey];
  if (!product.platforms.includes(os)) return [];

  const osMeta = OS_CONFIG[os];
  const engineDir = path.join(
    product.contentRoot,
    `${product.wrapper}-${osMeta.engineSuffix}`,
  );
  if (!fs.existsSync(engineDir)) return [];

  const mediations = discoverMediations(engineDir, product.mediations);
  const outDir = path.join(guidesDir, os, productKey);
  const generated = [];

  const intro = readProductIntro(product, os);

  for (const networkKey of mediations) {
    const title = NETWORK_TITLES[networkKey];
    const pageImports = new Set();

    const configRel = resolveInstallOrConfig(engineDir, networkKey, 'configuration');
    const config = configRel ? readSection(engineDir, configRel, 1) : { imports: [], body: '' };

    let body;
    if (productKey === 'custom-adapter-gma-sdk') {
      const assembled = assembleNativeOsPage({
        os,
        mediation: networkKey,
        gitbookConfig: config.body,
      });
      assembled.imports.forEach((i) => pageImports.add(i));
      body = assembled.body;
    } else if (productKey === 'custom-adapter-gma-next-gen-sdk') {
      const assembled = assembleNextGenPage({ mediation: networkKey });
      assembled.imports.forEach((i) => pageImports.add(i));
      body = assembled.body;
    } else {
      intro.imports.forEach((i) => pageImports.add(i));
      const readmeRel = resolveReadme(engineDir, networkKey);
      const readme = readmeRel ? readSection(engineDir, readmeRel, 0) : { imports: [], body: '' };
      readme.imports.forEach((i) => pageImports.add(i));
      const installRel = resolveInstallOrConfig(engineDir, networkKey, 'installation');
      const install = installRel ? readSection(engineDir, installRel, 1) : { imports: [], body: '' };
      install.imports.forEach((i) => pageImports.add(i));
      config.imports.forEach((i) => pageImports.add(i));
      body = `## Installation

${install.body}

---

## Configuration

${config.body}
`;
    }

    const pagePath = path.join(outDir, `${networkKey}.mdx`);
    writeMdx(
      pagePath,
      {
        title,
        description: `${title} ${osMeta.label} guide for ${product.label}.`,
      },
      pageImports,
      body,
    );
    generated.push(path.relative(rootDir, pagePath).replace(/\\/g, '/'));
  }

  return { productKey, os, mediations, generated };
}

function removeProductOverviewPages() {
  const removed = [];
  for (const os of Object.keys(OS_CONFIG)) {
    for (const productKey of Object.keys(PRODUCT_CONFIG)) {
      const overviewPath = path.join(guidesDir, os, productKey, 'overview.mdx');
      if (fs.existsSync(overviewPath)) {
        fs.unlinkSync(overviewPath);
        removed.push(path.relative(rootDir, overviewPath).replace(/\\/g, '/'));
      }
    }
  }
  return removed;
}

function removeStaleMediationPages() {
  const removed = [];
  for (const r of results) {
    if (!r.generated?.length) continue;
    const outDir = path.join(guidesDir, r.os, r.productKey);
    if (!fs.existsSync(outDir)) continue;
    const keep = new Set(r.generated.map((p) => path.basename(p)));
    for (const file of fs.readdirSync(outDir)) {
      if (!file.endsWith('.mdx') || keep.has(file)) continue;
      const full = path.join(outDir, file);
      fs.unlinkSync(full);
      removed.push(path.relative(rootDir, full).replace(/\\/g, '/'));
    }
  }
  return removed;
}

const results = [];
for (const os of Object.keys(OS_CONFIG)) {
  for (const productKey of Object.keys(PRODUCT_CONFIG)) {
    const r = buildProductForOs(os, productKey);
    if (r && r.generated) results.push(r);
  }
}

const removedOverviews = removeProductOverviewPages();
if (removedOverviews.length) {
  console.log('Removed product overview pages:', removedOverviews.join(', '));
}

const removedStale = removeStaleMediationPages();
if (removedStale.length) {
  console.log('Removed stale mediation pages:', removedStale.join(', '));
}

fs.writeFileSync(
  path.join(__dirname, 'os-mediation-build-manifest.json'),
  JSON.stringify(results, null, 2),
);

console.log('Built OS × mediation guides:');
for (const r of results) {
  console.log(`  ${r.os}/${r.productKey}: ${r.generated?.length || 0} pages`);
}

module.exports = { buildProductForOs, results };
