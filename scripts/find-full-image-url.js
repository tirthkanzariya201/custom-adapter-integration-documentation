const fs = require('fs');
const html = fs.readFileSync('scripts/applovin-page.html', 'utf8');
const idx = html.indexOf('JqdWZ9wkiOzXFzd');
console.log('idx', idx);
if (idx >= 0) console.log(html.slice(idx - 100, idx + 400));
