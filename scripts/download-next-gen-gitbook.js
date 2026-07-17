/**
 * Download Next-Gen SDK docs from GitBook into next-gen-sdk-integration/next-gen-integration-sdk.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');
const contentRoot = path.join(rootDir, 'next-gen-sdk-integration', 'next-gen-integration-sdk');
const baseUrl = 'https://tapminds.gitbook.io/next-gen-sdk-integration/next-gen-integration-sdk';

const FULL_NETWORKS = ['admob', 'applovin', 'google-ad-manager', 'ironsource-levelplay'];
const COCOS_NETWORKS = ['admob', 'google-ad-manager'];
const ENGINES = [
  'native-android-engine',
  'native-ios-engine',
  'unity-android-engine',
  'unity-ios-engine',
  'flutter-android-engine',
  'flutter-ios-engine',
  'cocos-android-engine',
  'cocos-ios-engine',
];
const KINDS = ['installation', 'configuration'];

const ENGINE_TITLES = {
  'native-android-engine': 'Native Android Engine',
  'native-ios-engine': 'Native iOS Engine',
  'unity-android-engine': 'Unity Android Engine',
  'unity-ios-engine': 'Unity iOS Engine',
  'flutter-android-engine': 'Flutter Android Engine',
  'flutter-ios-engine': 'Flutter iOS Engine',
  'cocos-android-engine': 'Cocos Android Engine',
  'cocos-ios-engine': 'Cocos iOS Engine',
};

function networksForEngine(engine) {
  return engine.startsWith('cocos-') ? COCOS_NETWORKS : FULL_NETWORKS;
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: '*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          fetch(next).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }),
        );
      })
      .on('error', reject);
  });
}

function stripGitbookPreamble(md) {
  let content = md;
  if (content.startsWith('> For the complete documentation')) {
    const idx = content.indexOf('\n\n');
    if (idx !== -1) content = content.slice(idx + 2);
  }
  const agentIdx = content.indexOf('\n# Agent Instructions');
  if (agentIdx !== -1) content = content.slice(0, agentIdx);
  if (content.includes('# Page Not Found')) return null;
  return content.trim();
}

function convertGitbookToMdx(body, title) {
  let text = body;
  text = text.replace(
    /\{%\s*hint\s+style="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/gi,
    (_, style, inner) => {
      const type =
        { info: 'info', warning: 'warning', danger: 'danger', success: 'check' }[
          style.toLowerCase()
        ] || 'info';
      return `<Info>\n${inner.trim()}\n</Info>`;
    },
  );
  text = text.replace(/\{%\s*include\s+"([^"]+)"\s*%\}/gi, (_, inc) => {
    const name = path.basename(inc, path.extname(inc));
    if (name.includes('doc-tag-admob-gam')) return '<DocTagAdmobGam />';
    if (name.includes('doc-tag-applovin')) return '<DocTagApplovin />';
    if (name.includes('doc-tag-ironsource')) return '<DocTagIronsource />';
    return '';
  });
  text = text.replace(/\*\*\*\\?\n?/g, '---\n\n');
  text = text.replace(/\\$/gm, '');
  text = text.replace(/^# .+\n+/m, '');
  return `---
title: ${title}
---

# ${title}

${text.trim()}
`;
}

function inferDocTagImports(body) {
  const imports = new Set();
  if (body.includes('<DocTagAdmobGam')) {
    imports.add("import DocTagAdmobGam from '/snippets/doc-tag-admob-gam.mdx'");
  }
  if (body.includes('<DocTagApplovin')) {
    imports.add("import DocTagApplovin from '/snippets/doc-tag-applovin.mdx'");
  }
  if (body.includes('<DocTagIronsource')) {
    imports.add("import DocTagIronsource from '/snippets/doc-tag-ironsource.mdx'");
  }
  return [...imports];
}

function writeMdx(filePath, body, title) {
  let mdx = convertGitbookToMdx(body, title);
  const imports = inferDocTagImports(mdx);
  if (imports.length) {
    mdx = mdx.replace(
      /^---\n[\s\S]*?---\n\n/,
      `---\ntitle: ${title}\n---\n\n${imports.join('\n')}\n\n`,
    );
    mdx = mdx.replace(/^# .+\n\n/, '');
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, mdx.replace(/\r\n/g, '\n'), 'utf8');
}

function networkTitle(network) {
  if (network === 'google-ad-manager') return 'Google Ad Manager';
  if (network === 'ironsource-levelplay') return 'IronSource LevelPlay';
  return network.charAt(0).toUpperCase() + network.slice(1);
}

async function downloadEngineOverview(engine) {
  const url = `${baseUrl}/${engine}.md`;
  const res = await fetch(url);
  const body = stripGitbookPreamble(res.body);
  if (!body || res.status !== 200) {
    console.warn('Skip overview', engine, res.status);
    return null;
  }
  const filePath = path.join(contentRoot, `${engine}.mdx`);
  writeMdx(filePath, body, ENGINE_TITLES[engine] || engine);
  return filePath;
}

async function main() {
  const manifest = [];

  const rootUrl = `${baseUrl}.md`;
  const rootRes = await fetch(rootUrl);
  const rootBody = stripGitbookPreamble(rootRes.body);
  if (rootBody && rootRes.status === 200) {
    const rootPath = path.join(contentRoot, '..', 'next-gen-integration-sdk.mdx');
    writeMdx(rootPath, rootBody, 'Next-Gen Integration SDK');
    manifest.push(path.relative(rootDir, rootPath).replace(/\\/g, '/'));
    console.log('OK', path.relative(rootDir, rootPath));
  }

  for (const engine of ENGINES) {
    const overview = await downloadEngineOverview(engine);
    if (overview) manifest.push(path.relative(rootDir, overview).replace(/\\/g, '/'));

    for (const network of networksForEngine(engine)) {
      for (const kind of KINDS) {
        const rel = `${engine}/${network}/${kind}`;
        const url = `${baseUrl}/${rel}.md`;
        const res = await fetch(url);
        const body = stripGitbookPreamble(res.body);
        if (!body || res.status !== 200) {
          console.warn('Missing', rel, res.status);
          continue;
        }
        const title = kind === 'installation' ? 'Installation' : 'Configuration';
        const filePath = path.join(contentRoot, engine, network, `${kind}.mdx`);
        writeMdx(filePath, body, title);
        const relFile = path.relative(rootDir, filePath).replace(/\\/g, '/');
        manifest.push(relFile);
        console.log('OK', relFile);
      }

      const readmeUrl = `${baseUrl}/${engine}/${network}.md`;
      const readmeRes = await fetch(readmeUrl);
      const readmeBody = stripGitbookPreamble(readmeRes.body);
      if (readmeBody && readmeRes.status === 200) {
        const readmePath = path.join(contentRoot, engine, `${network}.mdx`);
        writeMdx(readmePath, readmeBody, networkTitle(network));
        const relReadme = path.relative(rootDir, readmePath).replace(/\\/g, '/');
        manifest.push(relReadme);
        console.log('OK', relReadme);
      }
    }
  }

  fs.writeFileSync(
    path.join(__dirname, 'next-gen-gitbook-manifest.json'),
    JSON.stringify({ downloaded: manifest }, null, 2),
  );
  console.log(`Downloaded ${manifest.length} Next-Gen source files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
