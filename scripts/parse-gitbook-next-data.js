const fs = require('fs');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      })
      .on('error', reject);
  });
}

async function main() {
  const html = await fetch('https://ca-docs.adster.tech/custom-adapter-integration/android');
  const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!nextMatch) {
    console.log('No __NEXT_DATA__');
    return;
  }
  const data = JSON.parse(nextMatch[1]);
  fs.writeFileSync('scripts/gam-next-data.json', JSON.stringify(data, null, 2));
  const str = JSON.stringify(data);
  const hits = [];
  for (const term of ['google-ad-manager', 'Companies', 'image.png', 'TapMind', 'files.gitbook.io', 'New Company']) {
    if (str.includes(term)) hits.push(term);
  }
  console.log('Terms found:', hits);

  const fileUrls = [...new Set(str.match(/https:\/\/1655991543-files\.gitbook\.io[^"\\]+/g) || [])];
  console.log('File URLs:', fileUrls.length);
  fileUrls.filter((u) => !u.includes('favicon') && !u.includes('icon')).forEach((u) => console.log(u));
}

main().catch(console.error);
