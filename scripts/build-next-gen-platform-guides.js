const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const contentRoot = path.join(rootDir, 'next-gen-sdk-integration', 'next-gen-integration-sdk');

const NETWORK_DEFS = {
  admob: {
    title: 'AdMob',
    readme: 'admob.mdx',
    installation: 'admob/installation.mdx',
    configuration: 'admob/configuration.mdx',
  },
  'google-ad-manager': {
    title: 'Google Ad Manager',
    readme: 'google-ad-manager.mdx',
    installation: 'google-ad-manager/installation.mdx',
    configuration: 'google-ad-manager/configuration.mdx',
  },
  applovin: {
    title: 'AppLovin',
    readme: 'applovin.mdx',
    installation: 'applovin/installation.mdx',
    configuration: 'applovin/configuration.mdx',
  },
  'ironsource-levelplay': {
    title: 'IronSource LevelPlay',
    readme: 'ironsource-levelplay.mdx',
    installation: 'ironsource-levelplay/installation.mdx',
    configuration: 'ironsource-levelplay/configuration.mdx',
  },
};

const PLATFORMS = [
  {
    key: 'native-android-engine',
    pageTitle: 'Native Android Integration Guide',
    description:
      'Native Android integration guide for TapMind Next-Gen SDK across AdMob, Google Ad Manager, AppLovin, and IronSource LevelPlay.',
    networks: ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'],
  },
  {
    key: 'native-ios-engine',
    pageTitle: 'Native iOS Integration Guide',
    description:
      'Native iOS integration guide for TapMind Next-Gen SDK across AdMob, Google Ad Manager, AppLovin, and IronSource LevelPlay.',
    networks: ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'],
  },
  {
    key: 'unity-android-engine',
    pageTitle: 'Unity Android Integration Guide',
    description:
      'Unity Android integration guide for TapMind Next-Gen SDK across AdMob, Google Ad Manager, AppLovin, and IronSource LevelPlay.',
    networks: ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'],
  },
  {
    key: 'unity-ios-engine',
    pageTitle: 'Unity iOS Integration Guide',
    description:
      'Unity iOS integration guide for TapMind Next-Gen SDK across AdMob, Google Ad Manager, AppLovin, and IronSource LevelPlay.',
    networks: ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'],
  },
  {
    key: 'flutter-android-engine',
    pageTitle: 'Flutter Android Integration Guide',
    description:
      'Flutter Android integration guide for TapMind Next-Gen SDK across AdMob, Google Ad Manager, AppLovin, and IronSource LevelPlay.',
    networks: ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'],
  },
  {
    key: 'flutter-ios-engine',
    pageTitle: 'Flutter iOS Integration Guide',
    description:
      'Flutter iOS integration guide for TapMind Next-Gen SDK across AdMob, Google Ad Manager, AppLovin, and IronSource LevelPlay.',
    networks: ['admob', 'google-ad-manager', 'applovin', 'ironsource-levelplay'],
  },
  {
    key: 'cocos-android-engine',
    pageTitle: 'Cocos Android Integration Guide',
    description:
      'Cocos Android integration guide for TapMind Next-Gen SDK across AdMob and Google Ad Manager.',
    networks: ['admob', 'google-ad-manager'],
  },
  {
    key: 'cocos-ios-engine',
    pageTitle: 'Cocos iOS Integration Guide',
    description:
      'Cocos iOS integration guide for TapMind Next-Gen SDK across AdMob and Google Ad Manager.',
    networks: ['admob', 'google-ad-manager'],
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

function readSection(baseDir, relPath, demoteBy) {
  const full = path.join(baseDir, relPath);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing source file: ${relPath}`);
  }
  const raw = fs.readFileSync(full, 'utf8');
  const imports = extractImports(raw);
  let body = parseFrontmatter(raw).body;
  body = removeImportLines(body);
  body = stripLeadingH1(body);
  if (demoteBy > 0) body = demoteHeadings(body, demoteBy);
  return { imports, body };
}

function buildPlatform(platform) {
  const baseDir = path.join(contentRoot, platform.key);
  const outFile = path.join(baseDir, 'integration-guide.mdx');
  const mergedSources = [];
  const allImports = new Set();
  const parts = [];

  const platformIntro = readSection(contentRoot, `${platform.key}.mdx`, 0);
  platformIntro.imports.forEach((i) => allImports.add(i));
  mergedSources.push(`${platform.key}.mdx`);

  parts.push(`# ${platform.pageTitle}

${platformIntro.body}
`);

  for (const networkKey of platform.networks) {
    const network = NETWORK_DEFS[networkKey];
    const readme = readSection(baseDir, network.readme, 0);
    const installation = readSection(baseDir, network.installation, 1);
    const configuration = readSection(baseDir, network.configuration, 1);

    [readme, installation, configuration].forEach((s) => s.imports.forEach((i) => allImports.add(i)));
    mergedSources.push(
      `${platform.key}/${network.readme}`,
      `${platform.key}/${network.installation}`,
      `${platform.key}/${network.configuration}`,
    );

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
  ${platform.description}
---

${importBlock ? `${importBlock}\n\n` : ''}${parts.join('\n')}
`;

  fs.writeFileSync(outFile, output.replace(/\r\n/g, '\n'), 'utf8');

  return {
    key: platform.key,
    slug: `next-gen-sdk-integration/next-gen-integration-sdk/${platform.key}/integration-guide`,
    outFile: path.relative(rootDir, outFile).replace(/\\/g, '/'),
    sizeKb: Math.round(output.length / 1024),
  };
}

const results = PLATFORMS.map(buildPlatform);
fs.writeFileSync(path.join(__dirname, 'next-gen-platform-build-manifest.json'), JSON.stringify(results, null, 2));

console.log('Built', results.length, 'Next-Gen platform guides:');
for (const r of results) {
  console.log(`  ${r.outFile} (${r.sizeKb} KB)`);
}
