const fs = require('fs');
const path = require('path');
const https = require('https');

const org = 'j85gaJGhOenXaXQbMJRn';
const site = 'site_ykozM';
const fileId = 'wKzAvWWdTnA6M7b2BytH';

const objectPaths = [
  `organizations/${org}/sites/${site}/images/${fileId}`,
  `organizations/${org}/sites/${site}/images/files/${fileId}`,
  `organizations/${org}/sites/${site}/files/${fileId}`,
  `organizations/${org}/sites/${site}/images/${fileId}.png`,
  `organizations/${org}/images/${fileId}`,
];

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
          resolve({ status: res.statusCode, type: res.headers['content-type'], body: Buffer.concat(chunks) })
        );
      })
      .on('error', reject);
  });
}

async function main() {
  for (const objectPath of objectPaths) {
    const fileUrl = `https://1655991543-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/${encodeURIComponent(objectPath)}?alt=media`;
    const proxy = `https://ca-docs.adster.tech/~gitbook/image?url=${encodeURIComponent(fileUrl)}&width=1600&quality=100`;
    const res = await download(proxy);
    const magic = res.body.slice(0, 4).toString('hex');
    console.log(objectPath, res.status, res.type, res.body.length, magic);
    if (res.status === 200 && res.body.length > 1000 && magic !== '3c21444f') {
      fs.writeFileSync(path.join(__dirname, 'gam-test.png'), res.body);
      console.log('SUCCESS');
      break;
    }
  }
}

main().catch(console.error);
