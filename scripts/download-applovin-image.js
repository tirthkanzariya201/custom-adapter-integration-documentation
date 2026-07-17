const fs = require('fs');
const https = require('https');
const path = require('path');

const html = fs.readFileSync('scripts/applovin-page.html', 'utf8');
const matches = [...html.matchAll(/https:\/\/ca-docs\.adster\.tech\/~gitbook\/image\?url=([^"'\s]+)/g)];
const decoded = matches
  .map((m) => decodeURIComponent(m[0]))
  .filter((u) => !u.includes('favicon') && !u.includes('icon%2F') && !u.includes('icon/'));
console.log('candidates', decoded.length);
if (!decoded.length) process.exit(0);

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, type: res.headers['content-type'], body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

(async () => {
  for (const url of decoded.slice(0, 5)) {
    console.log('\nTrying', url.slice(0, 180));
    const inner = url.match(/url=([^&]+)/);
    if (inner) {
      const direct = decodeURIComponent(inner[1].split('&')[0]);
      console.log('Direct:', direct.slice(0, 180));
      const d = await download(direct);
      console.log('Direct result', d.status, d.type, d.body.length);
      if (d.status === 200 && d.body.length > 5000) {
        fs.writeFileSync(path.join('images/gam', 'direct.png'), d.body);
      }
    }
    const p = await download(url);
    console.log('Proxy result', p.status, p.type, p.body.length);
    if (p.status === 200 && p.type.startsWith('image/')) {
      fs.writeFileSync(path.join('images/gam', 'proxy.png'), p.body);
    }
  }
})();
