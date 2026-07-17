const fs = require('fs');
const https = require('https');

const urls = [
  'https://ca-docs.adster.tech/custom-adapter-integration/tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager',
  'https://ca-docs.adster.tech/custom-adapter-integration/tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/readme',
  'https://ca-docs.adster.tech/custom-adapter-integration/android',
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetch(res.headers.location).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
      })
      .on('error', reject);
  });
}

function extractImages(html) {
  const found = new Set();
  const patterns = [
    /https:\/\/ca-docs\.adster\.tech\/~gitbook\/image\?url=([^&"'\s\\]+)/g,
    /https:\/\/1655991543-files\.gitbook\.io[^"'\s\\]+/g,
    /organizations%2F[^%]+%2Fimages%2F[^"'\s\\]+/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      try {
        found.add(decodeURIComponent(m[0].replace(/\\u0026/g, '&')));
      } catch {
        found.add(m[0]);
      }
    }
  }
  return [...found].filter((u) => !u.includes('favicon') && !u.includes('icon%2F'));
}

async function main() {
  for (const url of urls) {
    const { status, body } = await fetch(url);
    const imgs = extractImages(body);
    console.log('\nURL:', url);
    console.log('Status:', status, 'Length:', body.length, 'Images:', imgs.length);
    imgs.slice(0, 15).forEach((u) => console.log(' ', u.slice(0, 200)));

    const nextMatch = body.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextMatch) {
      const data = JSON.parse(nextMatch[1]);
      const jsonStr = JSON.stringify(data);
      const assetMatches = jsonStr.match(/gitbook-x-prod[^"\\]+/g) || [];
      const unique = [...new Set(assetMatches)].filter((s) => !s.includes('favicon') && !s.includes('icon'));
      console.log('NEXT_DATA asset refs:', unique.length);
      unique.slice(0, 10).forEach((u) => console.log('  asset:', u.slice(0, 180)));
    }
  }
}

main().catch(console.error);
