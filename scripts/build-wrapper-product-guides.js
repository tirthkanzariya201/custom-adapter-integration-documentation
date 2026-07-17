const fs = require('fs');
const path = require('path');
const {
  shouldMergeConfiguration,
  mergeConfiguration,
  getMergeStatus,
} = require('./merge-configuration');
const { normalizeBody } = require('./mdx-content-normalize');

const rootDir = path.resolve(__dirname, '..');
const guidesDir = path.join(rootDir, 'guides');

const WRAPPERS = ['native', 'unity', 'flutter', 'cocos'];

const PRODUCTS = {
  'custom-adapter': {
    label: 'Custom Adapter GMA SDK',
    contentRoot: path.join(rootDir, 'tapmind-custom-adapter-sdk-integration'),
    introSource: 'readme',
    wrappers: WRAPPERS,
  },
  'next-gen': {
    label: 'Custom Adapter Next-Gen SDK',
    contentRoot: path.join(rootDir, 'next-gen-sdk-integration', 'next-gen-integration-sdk'),
    introSource: 'platform-mdx',
    wrappers: ['native'],
    androidOnly: true,
    mediations: ['admob', 'google-ad-manager'],
  },
};

const NETWORK_ORDER = ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'];

const NETWORK_TITLES = {
  admob: 'AdMob',
  'google-ad-manager': 'Google Ad Manager',
  applovin: 'AppLovin',
  'ironsource-levelplay': 'IronSource LevelPlay',
};

const WRAPPER_LABELS = {
  native: 'Native',
  unity: 'Unity',
  flutter: 'Flutter',
  cocos: 'Cocos',
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

function readOptionalSection(baseDir, relPath, demoteBy) {
  if (!relPath) return { imports: [], body: '' };
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

function resolveReadme(baseDir, networkKey) {
  return firstExisting(baseDir, [
    `${networkKey}.mdx`,
    `${networkKey}/README.mdx`,
    `${networkKey}/README.md`,
  ]);
}

function resolveInstallOrConfig(baseDir, networkKey, kind) {
  return firstExisting(baseDir, [
    `${networkKey}/${kind}.mdx`,
    `${networkKey}/${kind}.md`,
  ]);
}

function hasInstallation(baseDir, networkKey) {
  return Boolean(resolveInstallOrConfig(baseDir, networkKey, 'installation'));
}

function discoverMediations(androidDir, iosDir) {
  return NETWORK_ORDER.filter(
    (key) => hasInstallation(androidDir, key) || hasInstallation(iosDir, key),
  );
}

function readIntro(product, wrapper, os) {
  const engineKey = `${wrapper}-${os}-engine`;
  const baseDir = path.join(product.contentRoot, engineKey);

  if (product.introSource === 'platform-mdx') {
    const platformMdx = path.join(product.contentRoot, `${engineKey}.mdx`);
    if (fs.existsSync(platformMdx)) {
      return readOptionalSection(product.contentRoot, `${engineKey}.mdx`, 0);
    }
  }

  return readOptionalSection(baseDir, 'README.mdx', 0);
}

function buildWrapperProduct(productKey, wrapper) {
  const product = PRODUCTS[productKey];
  if (product.wrappers && !product.wrappers.includes(wrapper)) {
    return null;
  }

  const androidDir = path.join(product.contentRoot, `${wrapper}-android-engine`);
  const iosDir = path.join(product.contentRoot, `${wrapper}-ios-engine`);
  const androidOnly = Boolean(product.androidOnly);

  if (!fs.existsSync(androidDir) && (!androidOnly && !fs.existsSync(iosDir))) {
    return null;
  }

  const mediations = product.mediations
    ? product.mediations.filter((key) => hasInstallation(androidDir, key))
    : discoverMediations(androidDir, iosDir);
  const allImports = new Set();
  const parts = [];
  const mergedSources = [];

  const androidIntro = readIntro(product, wrapper, 'android');
  androidIntro.imports.forEach((i) => allImports.add(i));

  const introBlocks = [];
  if (androidIntro.body) {
    introBlocks.push(`${androidOnly ? '' : '#### Android\n\n'}${androidIntro.body}`.trim());
    mergedSources.push(`${wrapper}-android-engine intro`);
  }
  if (!androidOnly) {
    const iosIntro = readIntro(product, wrapper, 'ios');
    iosIntro.imports.forEach((i) => allImports.add(i));
    if (iosIntro.body) {
      introBlocks.push(`#### iOS\n\n${iosIntro.body}`);
      mergedSources.push(`${wrapper}-ios-engine intro`);
    }
  }
  if (introBlocks.length) {
    parts.push(`${introBlocks.join('\n\n')}\n`);
  }

  for (const networkKey of mediations) {
    const title = NETWORK_TITLES[networkKey];
    const androidReadme = resolveReadme(androidDir, networkKey);
    const iosReadme = resolveReadme(iosDir, networkKey);
    const readmeRel = androidReadme || iosReadme;
    const readme = readOptionalSection(
      readmeRel ? (androidReadme ? androidDir : iosDir) : androidDir,
      readmeRel,
      0,
    );
    readme.imports.forEach((i) => allImports.add(i));
    if (readmeRel) mergedSources.push(readmeRel);

    const sections = [];

    const androidInstall = resolveInstallOrConfig(androidDir, networkKey, 'installation');
    const iosInstall = resolveInstallOrConfig(iosDir, networkKey, 'installation');
    const androidConfig = resolveInstallOrConfig(androidDir, networkKey, 'configuration');
    const iosConfig = resolveInstallOrConfig(iosDir, networkKey, 'configuration');

    if (androidInstall) {
      const section = readOptionalSection(androidDir, androidInstall, 1);
      section.imports.forEach((i) => allImports.add(i));
      sections.push(`#### Installation for Android\n\n${section.body}`);
      mergedSources.push(`${wrapper}-android-engine/${androidInstall}`);
    }
    if (!androidOnly && iosInstall) {
      const section = readOptionalSection(iosDir, iosInstall, 1);
      section.imports.forEach((i) => allImports.add(i));
      sections.push(`#### Installation for iOS\n\n${section.body}`);
      mergedSources.push(`${wrapper}-ios-engine/${iosInstall}`);
    }

    const configMergeId = shouldMergeConfiguration(productKey, networkKey);
    if (configMergeId && androidConfig && iosConfig && !androidOnly) {
      const androidSection = readOptionalSection(androidDir, androidConfig, 1);
      const iosSection = readOptionalSection(iosDir, iosConfig, 1);
      androidSection.imports.forEach((i) => allImports.add(i));
      iosSection.imports.forEach((i) => allImports.add(i));
      const mergedConfig = mergeConfiguration(
        configMergeId,
        androidSection.body,
        iosSection.body,
      );
      sections.push(`#### Configuration\n\n${mergedConfig}`);
      mergedSources.push(
        `${wrapper}-android-engine/${androidConfig}`,
        `${wrapper}-ios-engine/${iosConfig}`,
        `(merged-configuration:${configMergeId})`,
      );
    } else {
      if (androidConfig) {
        const section = readOptionalSection(androidDir, androidConfig, 1);
        section.imports.forEach((i) => allImports.add(i));
        sections.push(`#### Configuration for Android\n\n${section.body}`);
        mergedSources.push(`${wrapper}-android-engine/${androidConfig}`);
      }
      if (!androidOnly && iosConfig) {
        const section = readOptionalSection(iosDir, iosConfig, 1);
        section.imports.forEach((i) => allImports.add(i));
        sections.push(`#### Configuration for iOS\n\n${section.body}`);
        mergedSources.push(`${wrapper}-ios-engine/${iosConfig}`);
      }
    }

    parts.push(`## ${title}

${readme.body ? `${readme.body}\n\n` : ''}${sections.join('\n\n')}
`);
  }

  const wrapperLabel = WRAPPER_LABELS[wrapper];
  const networkList = mediations.map((k) => NETWORK_TITLES[k]).join(', ') || 'supported networks';
  const importBlock = [...allImports].sort().join('\n');

  const output = `---
title: ${product.label}
description: >-
  ${wrapperLabel} integration guide for TapMind ${product.label} across ${networkList}.
---

${importBlock ? `${importBlock}\n\n` : ''}${parts.join('\n')}
`;

  const outDir = path.join(guidesDir, wrapper);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${productKey}.mdx`);
  fs.writeFileSync(outFile, output.replace(/\r\n/g, '\n'), 'utf8');

  return {
    wrapper,
    product: productKey,
    slug: `guides/${wrapper}/${productKey}`,
    outFile: path.relative(rootDir, outFile).replace(/\\/g, '/'),
    mediations: mediations.map((k) => NETWORK_TITLES[k]),
    sizeKb: Math.round(output.length / 1024),
    mergedSources,
  };
}

const results = [];
const staleOutputs = [];
for (const productKey of Object.keys(PRODUCTS)) {
  for (const wrapper of WRAPPERS) {
    const outPath = path.join(guidesDir, wrapper, `${productKey}.mdx`);
    const result = buildWrapperProduct(productKey, wrapper);
    if (result) {
      results.push(result);
    } else if (fs.existsSync(outPath)) {
      staleOutputs.push(outPath);
    }
  }
}
for (const stale of staleOutputs) {
  fs.unlinkSync(stale);
  console.log('Removed stale guide:', path.relative(rootDir, stale).replace(/\\/g, '/'));
}

fs.writeFileSync(
  path.join(__dirname, 'wrapper-product-build-manifest.json'),
  JSON.stringify(results, null, 2),
);

console.log('Built', results.length, 'wrapper × product guides:');
const activeMerges = getMergeStatus();
if (activeMerges.length) {
  console.log('  Active configuration merges:', activeMerges.join(', '));
} else {
  console.log('  Configuration merges: disabled');
}
for (const r of results) {
  console.log(
    `  ${r.outFile} (${r.sizeKb} KB, ${r.mediations.length} mediations: ${r.mediations.join(', ')})`,
  );
}

module.exports = { buildWrapperProduct, discoverMediations, results };
