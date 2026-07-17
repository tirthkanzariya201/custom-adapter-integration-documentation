const https = require('https');
const fs = require('fs');
const path = require('path');

const baseUrl = process.argv[2]?.replace(/\/$/, '');
const outDir = path.resolve(process.argv[3]);

if (!baseUrl || !outDir) {
  console.error('Usage: node migrate-from-sitemap.js <baseUrl> <outDir>');
  process.exit(1);
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        fetch(next).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () =>
        resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }),
      );
    }).on('error', reject);
  });
}

function stripPreamble(md) {
  let content = md.trim();
  if (content.startsWith('> For the complete documentation')) {
    const idx = content.indexOf('\n\n');
    if (idx !== -1) content = content.slice(idx + 2).trim();
  }
  return content;
}

function convertGitbookToMdx(raw, title) {
  let text = raw;
  text = text.replace(/\{%\s*hint\s+style="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/gi, (_, style, inner) => {
    const map = { info: 'info', warning: 'warning', danger: 'danger', success: 'check', note: 'info', tip: 'info' };
    const type = map[style.toLowerCase()] || 'info';
    return `<Callout type="${type}">\n${inner.trim()}\n</Callout>`;
  });
  text = text.replace(/\{%\s*tabs\s*%\}([\s\S]*?)\{%\s*endtabs\s*%\}/gi, '$1');
  text = text.replace(/\{%\s*tab\s+title="([^"]+)"\s*%\}/gi, '\n### $1\n\n');
  text = text.replace(/\{%\s*endtab\s*%\}/gi, '\n');
  text = text.replace(/\{%\s*embed\s+url="([^"]+)"\s*%\}/gi, '![]($1)');
  text = text.replace(/\{%\s*include\s+"([^"]+)"\s*%\}/gi, '');
  text = text.replace(/<a href="#[^"]*" id="[^"]*"><\/a>/g, '');
  text = text.replace(/<a href="\/pages\/[^"]+"[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  text = text.replace(/\*\*\*\\?\n?/g, '---\n\n');
  text = text.replace(/\\$/gm, '');
  text = text.replace(/!\[([^\]]*)\]\(\.\.\/\.\.\/\.\.\/\.gitbook\/assets\/([^)]+)\)/g, '![$1](/images/gitbook/$2)');
  text = text.replace(/!\[([^\]]*)\]\(\/\.gitbook\/assets\/([^)]+)\)/g, '![$1](/images/gitbook/$2)');

  const h1 = text.match(/^# (.+)$/m);
  const pageTitle = title || (h1 ? h1[1] : 'Untitled');
  if (h1) text = text.replace(/^# .+\n?/, '');

  return `---
title: ${pageTitle.replace(/"/g, '\\"')}
description: ${pageTitle.replace(/"/g, '\\"')}
---

# ${pageTitle}

${text.trim()}
`;
}

function urlToRelativePath(loc) {
  const u = new URL(loc);
  let p = u.pathname.replace(new URL(baseUrl).pathname.replace(/\/$/, ''), '');
  p = p.replace(/^\//, '').replace(/\/$/, '');
  if (!p) return 'overview';
  return p;
}

async function main() {
  const sitemap = (await fetch(`${baseUrl}/sitemap-pages.xml`)).body;
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`Found ${locs.length} URLs in sitemap`);

  fs.mkdirSync(outDir, { recursive: true });
  const manifest = [];

  for (const loc of locs) {
    const rel = urlToRelativePath(loc);
    const mdUrl = loc.endsWith('/') ? `${loc.slice(0, -1)}.md` : `${loc}.md`;
    const res = await fetch(mdUrl);
    if (res.status !== 200) {
      manifest.push({ loc, rel, ok: false, status: res.status });
      console.warn('FAIL', rel, res.status);
      continue;
    }
    const raw = stripPreamble(res.body);
    const titleMatch = raw.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : rel.split('/').pop();
    const mdx = convertGitbookToMdx(raw, title);
    const filePath = path.join(outDir, `${rel}.mdx`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, mdx, 'utf8');
    manifest.push({ loc, rel, file: path.relative(process.cwd(), filePath), ok: true, title });
    console.log('OK', rel);
  }

  fs.writeFileSync(path.join(outDir, '_migration-manifest.json'), JSON.stringify({ baseUrl, pages: manifest }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
