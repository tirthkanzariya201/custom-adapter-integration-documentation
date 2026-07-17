const fs = require('fs');
const https = require('https');
const path = require('path');

function extractUploadUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(/uploads%2F[A-Za-z0-9]+%2F[^"'&\s]+\.png[^"'&\s]*/g)) {
    urls.add(decodeURIComponent(match[0].replace(/&amp;/g, '&')));
  }
  for (const match of html.matchAll(/uploads\/[A-Za-z0-9]+\/[^"'\\]+\.png[^"'\\]*/g)) {
    urls.add(match[0]);
  }
  return [...urls];
}

function buildDirectUrl(uploadPath, token) {
  return `https://35306369-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces/Pe5s2iiW8knWj0Tius22/uploads/${uploadPath}?alt=media&token=${token}`;
}

function download(url, out) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode === 200 && body.length > 1000) fs.writeFileSync(out, body);
        resolve({ status: res.statusCode, length: body.length, type: res.headers['content-type'] });
      });
    }).on('error', reject);
  });
}

async function processPage(name, url) {
  const html = fs.readFileSync(path.join('scripts', name), 'utf8');
  const tokens = [...html.matchAll(/token%3D([a-f0-9-]+)/g)].map((m) => m[1]);
  const uploads = extractUploadUrls(html);
  console.log('\n', url, 'uploads', uploads.length, 'tokens', tokens.length);
  for (const upload of uploads) {
    console.log(' upload path fragment:', upload.slice(0, 120));
  }
  // Also search for Es6Uqw file id pattern
  const fileIds = [...html.matchAll(/\/files\/([A-Za-z0-9]+)/g)].map((m) => m[1]);
  console.log(' file ids', [...new Set(fileIds)].slice(0, 10));

  const idx = html.indexOf('uploads');
  if (idx > 0) {
    console.log('context:', html.slice(idx, idx + 250));
  }
}

(async () => {
  await processPage('gam-banner-page.html', 'gam-banner');
  await processPage('applovin-page.html', 'applovin');
})();
