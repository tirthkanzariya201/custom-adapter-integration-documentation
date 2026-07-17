const fs = require('fs');
const html = fs.readFileSync('scripts/applovin-page.html', 'utf8');
const matches = [...html.matchAll(/https:\\\/\\\/ca-docs\.adster\.tech\\\/~gitbook\\\/image\?url=([^\\"]+)/g)];
console.log('escaped matches', matches.length);
const matches2 = [...html.matchAll(/https:\/\/ca-docs\.adster\.tech\/~gitbook\/image\?url=[^"'\s]+/g)];
console.log('direct matches', matches2.length);
matches2.slice(0, 3).forEach((m) => console.log(m[0].slice(0, 250)));
