const https = require('https');
const fs = require('fs');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}

const slugs = [
  'tapmind-orchestration-sdk-integration',
  'native-android-engine',
  'requirements-and-setup',
  'initialize-the-sdk',
  'load-and-show-ads',
  'privacy-and-consent',
  'error-reference',
  'support',
  'next-gen-integration-sdk',
  'for-gradle-version-7+',
];

(async () => {
  for (const slug of slugs) {
    const orch = await fetch(`https://tapminds.gitbook.io/orchestration-sdk-integration/${slug}.md`);
    const next = await fetch(`https://tapminds.gitbook.io/next-gen-sdk-integration/${slug}.md`);
    if (orch.status === 200) console.log('ORCH', slug, orch.body.length);
    if (next.status === 200) console.log('NEXT', slug, next.body.length);
  }
  for (const u of [
    'https://tapminds.gitbook.io/orchestration-sdk-integration/sitemap.xml',
    'https://tapminds.gitbook.io/orchestration-sdk-integration/sitemap-pages.xml',
  ]) {
    const r = await fetch(u);
    console.log('sitemap', u, r.status, r.body.slice(0, 200));
  }
})();
