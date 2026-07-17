const https = require('https');
const fs = require('fs');
const path = require('path');

const targets = [
  {
    url: 'https://tapminds.gitbook.io/orchestration-sdk-integration/tapmind-orchestration-sdk-integration.md',
    out: path.join(__dirname, '..', 'orchestration-sdk-integration', 'overview.mdx'),
    title: 'TapMind Orchestration SDK Integration',
  },
  {
    url: 'https://tapminds.gitbook.io/next-gen-sdk-integration/next-gen-integration-sdk.md',
    out: path.join(__dirname, '..', 'next-gen-sdk-integration', 'overview.mdx'),
    title: 'Next-Gen Integration SDK',
  },
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function convert(raw, title) {
  let text = raw;
  if (text.startsWith('> For the complete documentation')) {
    const idx = text.indexOf('\n\n');
    if (idx !== -1) text = text.slice(idx + 2);
  }
  text = text.replace(/<a href="\/pages\/[^"]+"[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  const h1 = text.match(/^# (.+)$/m);
  const pageTitle = h1 ? h1[1] : title;
  if (h1) text = text.replace(/^# .+\n?/, '');
  return `---
title: ${pageTitle}
description: ${pageTitle}
---

# ${pageTitle}

${text.trim()}
`;
}

(async () => {
  for (const t of targets) {
    const raw = await fetch(t.url);
    fs.writeFileSync(t.out, convert(raw, t.title), 'utf8');
    console.log('Wrote', t.out);
  }
})();
