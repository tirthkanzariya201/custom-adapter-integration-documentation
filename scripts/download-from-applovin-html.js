const fs = require('fs');
const https = require('https');
const path = require('path');

const html = fs.readFileSync('scripts/applovin-page.html', 'utf8');
const urls = [...new Set(html.match(/https:\/\/ca-docs\.adster\.tech\/~gitbook\/image\?url=[^"'\s\\]+/g) || [])];
const filtered = urls.filter((u) => !u.includes('favicon') && !u.includes('icon%2F'));
console.log('Non-icon proxy URLs:', filtered.length);

async function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url.replace(/\\u0026/g, '&'), { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, type: res.headers['content-type'], body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

(async () => {
  for (const url of filtered.slice(0, 10)) {
    const res = await download(url);
    console.log(res.status, res.type, res.body.length, url.slice(0, 120));
    if (res.body.length > 5000 && res.type.startsWith('image/')) {
      fs.writeFileSync(path.join('images/gam', 'applovin-sample.png'), res.body);
    }
  }
})();
