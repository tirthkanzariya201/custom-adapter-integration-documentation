const fs = require('fs');
const html = fs.readFileSync('scripts/android-page.html', 'utf8');
const re = /https:\/\/1655991543-files\.gitbook\.io[^"'\\]+/g;
const urls = [...new Set([...(html.match(re) || [])])];
console.log('Total unique gitbook file URLs:', urls.length);
urls.forEach((u) => console.log(u.replace(/\\u0026/g, '&')));
