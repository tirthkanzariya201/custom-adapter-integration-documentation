const fs = require('fs');
const html = fs.readFileSync('scripts/applovin-page.html', 'utf8');
const match = html.match(/https:\\\/\\\/35306369-files\.gitbook\.io[^\\"]+/);
if (!match) {
  console.log('no match');
  process.exit(1);
}
const url = match[0].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
console.log('URL length', url.length);
console.log(url.slice(0, 300));
fs.writeFileSync('scripts/applovin-image-url.txt', url);
