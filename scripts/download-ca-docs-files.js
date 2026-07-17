const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'images', 'gam');

const fileIds = [
  'wKzAvWWdTnA6M7b2BytH',
  'Es6UqwUuvxJM5SfBrM27',
  'RFF3MkB7MZgmEWnQhkJo',
  'bw0dGqvgEJGBIZ8gpx54',
];

const urlPatterns = (id) => [
  `https://ca-docs.adster.tech/files/${id}`,
  `https://ca-docs.adster.tech/files/${id.toLowerCase()}`,
  `https://ca-docs.adster.tech/files/${id}.png`,
  `https://ca-docs.adster.tech/files/${id}.jpeg`,
  `https://ca-docs.adster.tech/files/${id}/download`,
  `https://ca-docs.adster.tech/~gitbook/image?url=${encodeURIComponent(`https://ca-docs.adster.tech/files/${id}`)}&width=1600&quality=100`,
];

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: '*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : `https://ca-docs.adster.tech${res.headers.location}`;
          download(next).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            url,
            status: res.statusCode,
            type: res.headers['content-type'] || '',
            body: Buffer.concat(chunks),
          })
        );
      })
      .on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const id of fileIds) {
    for (const url of urlPatterns(id)) {
      try {
        const res = await download(url);
        const magic = res.body.slice(0, 4).toString('hex');
        const isImage =
          res.type.startsWith('image/') ||
          magic.startsWith('89504e47') ||
          magic.startsWith('ffd8ff') ||
          magic.startsWith('474946');
        console.log(id, res.status, res.type, res.body.length, isImage ? 'IMAGE' : magic);
        if (isImage && res.body.length > 1000) {
          const ext = res.type.includes('jpeg') ? 'jpeg' : 'png';
          fs.writeFileSync(path.join(outDir, `${id}.${ext}`), res.body);
          break;
        }
      } catch (err) {
        console.log(id, url, err.message);
      }
    }
  }
}

main().catch(console.error);
