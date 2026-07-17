const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'images', 'gam');
const org = 'j85gaJGhOenXaXQbMJRn';
const site = 'site_ykozM';

const assetNames = [
  'image.png',
  'image (1).png',
  'image (2).png',
  'image (3).png',
  'image (4).png',
  'image (5).png',
];

function gitbookFileUrl(name) {
  const objectPath = `organizations/${org}/sites/${site}/images/${encodeURIComponent(name)}`;
  return `https://1655991543-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/${encodeURIComponent(objectPath).replace(/%2F/g, '%2F')}?alt=media`;
}

function proxyUrl(name) {
  const fileUrl = gitbookFileUrl(name);
  return `https://ca-docs.adster.tech/~gitbook/image?url=${encodeURIComponent(fileUrl)}&width=1600&quality=100`;
}

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            type: res.headers['content-type'],
            body: Buffer.concat(chunks),
          })
        );
      })
      .on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const name of assetNames) {
    const url = proxyUrl(name);
    try {
      const { status, type, body } = await download(url);
      console.log(name, status, type, body.length);
      if (status === 200 && type && type.startsWith('image/')) {
        const out = path.join(outDir, name.replace(/\s+/g, '-').replace(/[()]/g, ''));
        fs.writeFileSync(out, body);
        console.log('  saved', out);
      }
    } catch (err) {
      console.log(name, 'error', err.message);
    }
  }
}

main().catch(console.error);
