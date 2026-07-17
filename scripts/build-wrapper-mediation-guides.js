/**
 * Builds per-wrapper, per-mediation guide pages.
 * Output: guides/{unity|flutter|cocos}/{product}/{mediation}.mdx
 */

const fs = require('fs');
const path = require('path');
const { mergeWrapperConfiguration } = require('./merge-wrapper-configuration');
const { normalizeBody } = require('./mdx-content-normalize');
const { assembleWrapperPage } = require('./gma/assemble-page');
const {
  extractPrerequisiteBullets,
  stripPrerequisiteCallouts,
  buildMergedPrerequisitesCallout,
} = require('./mdx-content-normalize');

const rootDir = path.resolve(__dirname, '..');
const guidesDir = path.join(rootDir, 'guides');

const WRAPPERS = ['unity', 'flutter', 'cocos', 'react-native'];

const { MEDIATION_DISPLAY_TITLES, MEDIATION_ORDER, resolveMediationSourceDir } = require('./gma/doc-constants');

const NETWORK_ORDER = MEDIATION_ORDER;

const NETWORK_TITLES = MEDIATION_DISPLAY_TITLES;

const PRODUCT_CONFIG = {
  'custom-adapter-gma-sdk': {
    label: 'Custom Adapter (GMA SDK)',
    contentRoot: path.join(rootDir, 'tapmind-custom-adapter-sdk-integration'),
    mediations: null,
  },
};

/** Cocos: AdMob and GAM only (per structure brief — AppLovin/LevelPlay not available). */
const WRAPPER_MEDIATIONS = {
  cocos: ['admob', 'google-ad-manager'],
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

function readSection(baseDir, relPath, demoteBy) {
  const full = path.join(baseDir, relPath);
  if (!fs.existsSync(full)) return { imports: [], body: '' };
  const raw = fs.readFileSync(full, 'utf8');
  const imports = extractImports(raw);
  let body = parseFrontmatter(raw).body;
  body = removeImportLines(body);
  body = stripLeadingH1(body);
  if (demoteBy > 0) body = demoteHeadings(body, demoteBy);
  body = normalizeBody(body);
  return { imports, body };
}

function firstExisting(baseDir, candidates) {
  for (const rel of candidates) {
    const full = path.join(baseDir, rel);
    if (fs.existsSync(full)) return rel;
  }
  return null;
}

function resolveReadme(baseDir, networkKey) {
  const sourceDir = resolveMediationSourceDir(networkKey);
  return firstExisting(baseDir, [
    `${sourceDir}.mdx`,
    `${sourceDir}/README.mdx`,
    `${sourceDir}/README.md`,
  ]);
}

function resolveInstallOrConfig(baseDir, networkKey, kind) {
  const sourceDir = resolveMediationSourceDir(networkKey);
  return firstExisting(baseDir, [
    `${sourceDir}/${kind}.mdx`,
    `${sourceDir}/${kind}.md`,
  ]);
}

function hasInstallation(baseDir, networkKey) {
  return Boolean(resolveInstallOrConfig(baseDir, networkKey, 'installation'));
}

function discoverMediations(androidDir, iosDir, fixedList) {
  if (fixedList) {
    return fixedList.filter(
      (key) => hasInstallation(androidDir, key) || hasInstallation(iosDir, key),
    );
  }
  return NETWORK_ORDER.filter(
    (key) => hasInstallation(androidDir, key) || hasInstallation(iosDir, key),
  );
}

function normalizeCompareText(body) {
  return body.replace(/\s+/g, ' ').trim();
}

function extractCocosParts(androidInstallBody) {
  const marker = /####\s+Install Extension/i;
  const match = androidInstallBody.match(marker);
  if (!match) {
    return { prereqSource: androidInstallBody, install: '' };
  }
  const idx = androidInstallBody.search(marker);
  return {
    prereqSource: androidInstallBody.slice(0, idx).trim(),
    install: androidInstallBody.slice(idx).trim(),
  };
}

function buildInstallationSection(wrapper, androidInstall, iosInstall) {
  const androidBody = stripPrerequisiteCallouts(androidInstall.body);
  const iosBody = stripPrerequisiteCallouts(iosInstall.body);

  if (wrapper === 'unity') {
    const shared =
      normalizeCompareText(androidBody) === normalizeCompareText(iosBody)
        ? androidBody
        : androidBody || iosBody;
    return shared;
  }

  if (wrapper === 'flutter' || wrapper === 'react-native') {
    const parts = [];
    if (androidBody) parts.push(`### Android\n\n${androidBody}`);
    if (iosBody) parts.push(`### iOS\n\n${iosBody}`);
    return parts.join('\n\n');
  }

  if (wrapper === 'cocos') {
    const { install } = extractCocosParts(androidBody);
    const iosShared = iosBody.includes('Install Extension')
      ? iosBody.slice(iosBody.search(/####\s+Install Extension/i)).trim()
      : iosBody;
    return install || iosShared;
  }

  return androidBody || iosBody;
}

function buildCocosPrerequisitesBlock(androidInstall) {
  const { prereqSource } = extractCocosParts(androidInstall.body);
  const bullets = extractPrerequisiteBullets(prereqSource);
  let block = buildMergedPrerequisitesCallout(bullets);
  const gradlePart = stripPrerequisiteCallouts(prereqSource)
    .replace(/^#{1,6}\s+Configuration Steps\s*\n?/im, '')
    .replace(/^#\s*$/gm, '')
    .trim();
  if (gradlePart) {
    block = block ? `${block}\n\n${gradlePart}` : gradlePart;
  }
  return block;
}

function collectPrerequisiteBullets(wrapper, readme, androidInstall, iosInstall) {
  const bullets = [...extractPrerequisiteBullets(readme.body)];

  if (wrapper === 'cocos') {
    const { prereqSource } = extractCocosParts(androidInstall.body);
    bullets.push(...extractPrerequisiteBullets(prereqSource));
  } else if (wrapper === 'unity') {
    bullets.push(
      ...extractPrerequisiteBullets(androidInstall.body),
      ...extractPrerequisiteBullets(iosInstall.body),
    );
  } else {
    bullets.push(
      ...extractPrerequisiteBullets(androidInstall.body),
      ...extractPrerequisiteBullets(iosInstall.body),
    );
  }

  return bullets;
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

function buildWrapperProduct(wrapper, productKey) {
  const product = PRODUCT_CONFIG[productKey];
  const androidDir = path.join(product.contentRoot, `${wrapper}-android-engine`);
  const iosDir = path.join(product.contentRoot, `${wrapper}-ios-engine`);
  const outDir = path.join(guidesDir, wrapper, productKey);

  if (!fs.existsSync(androidDir) && !fs.existsSync(iosDir)) return null;

  const mediations =
    WRAPPER_MEDIATIONS[wrapper] ||
    discoverMediations(androidDir, iosDir, product.mediations);
  if (!mediations.length) return null;

  const generated = [];

  for (const networkKey of mediations) {
    const title = NETWORK_TITLES[networkKey];
    const pageImports = new Set();

    const androidConfigRel = resolveInstallOrConfig(androidDir, networkKey, 'configuration');
    const iosConfigRel = resolveInstallOrConfig(iosDir, networkKey, 'configuration');
    const androidConfig = androidConfigRel
      ? readSection(androidDir, androidConfigRel, 1)
      : { imports: [], body: '' };
    const iosConfig = iosConfigRel
      ? readSection(iosDir, iosConfigRel, 1)
      : { imports: [], body: '' };

    let body;
    if (productKey === 'custom-adapter-gma-sdk') {
      const configSource = androidConfig.body || iosConfig.body;
      const assembled = assembleWrapperPage({
        wrapper,
        mediation: networkKey,
        gitbookConfig: configSource,
        mergeWrapperConfiguration,
      });
      assembled.imports.forEach((i) => pageImports.add(i));
      body = assembled.body;
    } else {
      const readmeRel =
        resolveReadme(androidDir, networkKey) || resolveReadme(iosDir, networkKey);
      const readmeBase = readmeRel && resolveReadme(androidDir, networkKey) ? androidDir : iosDir;
      const readme = readmeRel
        ? readSection(readmeBase, readmeRel, 0)
        : { imports: [], body: '' };
      readme.imports.forEach((i) => pageImports.add(i));

      const androidInstallRel = resolveInstallOrConfig(androidDir, networkKey, 'installation');
      const iosInstallRel = resolveInstallOrConfig(iosDir, networkKey, 'installation');
      const androidInstall = androidInstallRel
        ? readSection(androidDir, androidInstallRel, 1)
        : { imports: [], body: '' };
      const iosInstall = iosInstallRel
        ? readSection(iosDir, iosInstallRel, 1)
        : { imports: [], body: '' };
      androidInstall.imports.forEach((i) => pageImports.add(i));
      iosInstall.imports.forEach((i) => pageImports.add(i));
      androidConfig.imports.forEach((i) => pageImports.add(i));
      iosConfig.imports.forEach((i) => pageImports.add(i));
      const prereqBullets = collectPrerequisiteBullets(
        wrapper,
        readme,
        androidInstall,
        iosInstall,
      );
      const prerequisitesBlock =
        wrapper === 'cocos'
          ? buildCocosPrerequisitesBlock(androidInstall)
          : buildMergedPrerequisitesCallout(prereqBullets);
      const readmeBody = stripPrerequisiteCallouts(readme.body);
      const installationBody = buildInstallationSection(wrapper, androidInstall, iosInstall);
      const { body: configurationBodyRaw } = mergeWrapperConfiguration(
        androidConfig.body,
        iosConfig.body,
        networkKey,
      );
      const configurationBody = normalizeBody(configurationBodyRaw);
      body = `${prerequisitesBlock ? `${prerequisitesBlock}\n\n` : ''}${readmeBody ? `${readmeBody}\n\n` : ''}## Installation

${installationBody}

---

## Configuration

${configurationBody}
`;
    }

    const pagePath = path.join(outDir, `${networkKey}.mdx`);
    writeMdx(
      pagePath,
      {
        title,
        description: `${title} ${wrapper} guide for ${product.label}.`,
      },
      pageImports,
      body,
    );
    generated.push(path.relative(rootDir, pagePath).replace(/\\/g, '/'));
  }

  return { wrapper, productKey, mediations, generated };
}

function removeLegacyMergedGuides() {
  const removed = [];
  for (const wrapper of WRAPPERS) {
    for (const productKey of Object.keys(PRODUCT_CONFIG)) {
      const legacy = path.join(guidesDir, wrapper, `${productKey}.mdx`);
      if (fs.existsSync(legacy)) {
        fs.unlinkSync(legacy);
        removed.push(path.relative(rootDir, legacy).replace(/\\/g, '/'));
      }
    }
  }
  return removed;
}

function removeStaleNextGenWrapperGuides() {
  const removed = [];
  for (const wrapper of WRAPPERS) {
    const nextGenDir = path.join(guidesDir, wrapper, 'next-gen');
    if (!fs.existsSync(nextGenDir)) continue;
    for (const entry of fs.readdirSync(nextGenDir)) {
      const full = path.join(nextGenDir, entry);
      fs.unlinkSync(full);
      removed.push(path.relative(rootDir, full).replace(/\\/g, '/'));
    }
    fs.rmdirSync(nextGenDir);
    removed.push(path.relative(rootDir, nextGenDir).replace(/\\/g, '/'));
  }
  return removed;
}

function removeStaleMediationPages() {
  const removed = [];
  for (const r of results) {
    if (!r.generated?.length) continue;
    const outDir = path.join(guidesDir, r.wrapper, r.productKey);
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
for (const wrapper of WRAPPERS) {
  for (const productKey of Object.keys(PRODUCT_CONFIG)) {
    const r = buildWrapperProduct(wrapper, productKey);
    if (r) results.push(r);
  }
}

const removedLegacy = removeLegacyMergedGuides();
if (removedLegacy.length) {
  console.log('Removed legacy merged wrapper guides:', removedLegacy.join(', '));
}

const removedNextGen = removeStaleNextGenWrapperGuides();
if (removedNextGen.length) {
  console.log('Removed stale wrapper Next-Gen guides:', removedNextGen.join(', '));
}

const removedStale = removeStaleMediationPages();
if (removedStale.length) {
  console.log('Removed stale mediation pages:', removedStale.join(', '));
}

fs.writeFileSync(
  path.join(__dirname, 'wrapper-mediation-build-manifest.json'),
  JSON.stringify(results, null, 2),
);

console.log('Built wrapper × mediation guides:');
for (const r of results) {
  console.log(`  ${r.wrapper}/${r.productKey}: ${r.generated.length} pages`);
}

module.exports = { buildWrapperProduct, results };
