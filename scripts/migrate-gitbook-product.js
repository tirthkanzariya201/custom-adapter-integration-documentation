/**
 * Download GitBook product docs as markdown and write MDX files.
 * Usage: node scripts/migrate-gitbook-product.js <baseUrl> <outDir>
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = process.argv[2]?.replace(/\/$/, '');
const outDir = process.argv[3] ? path.resolve(process.argv[3]) : null;

if (!baseUrl || !outDir) {
  console.error('Usage: node migrate-gitbook-product.js <baseUrl> <outDir>');
  process.exit(1);
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: '*/*' } }, (res) => {
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
      })
      .on('error', reject);
  });
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripGitbookPreamble(md) {
  let content = md;
  if (content.startsWith('> For the complete documentation')) {
    const idx = content.indexOf('\n\n');
    if (idx !== -1) content = content.slice(idx + 2);
  }
  return content.trim();
}

function convertToMdx(body, title) {
  let text = body;
  text = text.replace(/\{%\s*hint\s+style="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/gi, (_, style, inner) => {
    const type = { info: 'info', warning: 'warning', danger: 'danger', success: 'check' }[style.toLowerCase()] || 'info';
    return `<Callout type="${type}">\n${inner.trim()}\n</Callout>`;
  });
  text = text.replace(/\{%\s*embed\s+url="([^"]+)"\s*%\}/gi, '![]($1)');
  text = text.replace(/<a href="#[^"]*" id="[^"]*"><\/a>/g, '');
  text = text.replace(/\*\*\*\\?\n?/g, '---\n\n');
  text = text.replace(/\\$/gm, '');
  text = text.replace(/^# /m, ''); // remove duplicate H1 from body (frontmatter title used)

  const fm = `---
title: ${JSON.stringify(title).slice(1, -1)}
---

# ${title}

`;
  return fm + text.trim() + '\n';
}

function collectPages(node, pages = []) {
  if (!node || typeof node !== 'object') return pages;
  if (node.page && node.page.path) {
    pages.push({
      id: node.page.id,
      title: node.page.title || node.page.path,
      path: node.page.path,
    });
  }
  if (Array.isArray(node.pages)) {
    for (const child of node.pages) collectPages(child, pages);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectPages(child, pages);
  }
  return pages;
}

function walkSpace(space, pages = []) {
  if (!space) return pages;
  if (space.pages) {
    for (const p of space.pages) collectPages(p, pages);
  }
  if (space.sections) {
    for (const s of space.sections) walkSpace(s, pages);
  }
  return pages;
}

async function getPagesFromNextData() {
  const html = (await fetch(`${baseUrl}/`)).body;
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('No __NEXT_DATA__ found');
  const data = JSON.parse(m[1]);
  const str = JSON.stringify(data);

  const pageObjects = [];
  const re = /"page":\{"id":"([^"]+)","title":"([^"]*)","path":"([^"]+)"/g;
  let match;
  while ((match = re.exec(str)) !== null) {
    pageObjects.push({ id: match[1], title: match[2], path: match[3] });
  }

  const seen = new Set();
  return pageObjects.filter((p) => {
    if (seen.has(p.path)) return false;
    seen.add(p.path);
    return true;
  });
}

async function downloadPage(page) {
  const mdUrl = `${baseUrl}/${page.path}.md`;
  const res = await fetch(mdUrl);
  if (res.status !== 200) {
    return { page, ok: false, status: res.status };
  }
  const body = stripGitbookPreamble(res.body);
  return { page, ok: true, body };
}

function pathToFile(relPath) {
  const clean = relPath.replace(/^\//, '').replace(/\/$/, '');
  if (!clean) return path.join(outDir, 'overview.mdx');
  return path.join(outDir, `${clean}.mdx`);
}

async function main() {
  const pages = await getPagesFromNextData();
  console.log(`Found ${pages.length} pages at ${baseUrl}`);

  fs.mkdirSync(outDir, { recursive: true });
  const results = [];

  for (const page of pages) {
    const result = await downloadPage(page);
    if (!result.ok) {
      results.push({ path: page.path, status: result.status, title: page.title });
      continue;
    }
    const filePath = pathToFile(page.path);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const mdx = convertToMdx(result.body, page.title || page.path);
    fs.writeFileSync(filePath, mdx, 'utf8');
    results.push({ path: page.path, file: path.relative(process.cwd(), filePath), title: page.title, ok: true });
    console.log('OK', page.path, '->', path.relative(process.cwd(), filePath));
  }

  const manifestPath = path.join(outDir, '_migration-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ baseUrl, pages: results }, null, 2));
  console.log('Wrote manifest', manifestPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
