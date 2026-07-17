/**
 * Regenerate local export artifacts from docs.json navigation + MDX sources.
 * Outputs:
 *   scripts/llms-full.txt       — all navigation pages (JamDesk-style export)
 *   scripts/sitemap-pages.txt   — slug list for sitemap verification (levelplay slugs)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const docsJsonPath = path.join(rootDir, 'docs.json');
const siteBase = 'https://docs.tapmind.io';

function collectPages(node, pages = []) {
  if (!node) return pages;
  if (Array.isArray(node)) {
    for (const item of node) collectPages(item, pages);
    return pages;
  }
  if (typeof node === 'object') {
    if (node.page) {
      pages.push({ slug: node.page, title: node.title || node.page });
    }
    for (const key of ['pages', 'groups', 'tabs']) {
      if (node[key]) collectPages(node[key], pages);
    }
  }
  return pages;
}

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('---', 3);
  if (end === -1) return content;
  return content.slice(end + 3).replace(/^\s+/, '');
}

function mdxToText(raw) {
  let text = stripFrontmatter(raw);
  text = text
    .split('\n')
    .filter((line) => !/^\s*import\s+/.test(line))
    .join('\n');
  text = text.replace(/<Callout[^>]*>/gi, '\n> ');
  text = text.replace(/<\/Callout>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/\\_/g, '_');
  return text.trim();
}

function readPage(slug) {
  const mdxPath = path.join(rootDir, `${slug}.mdx`);
  const mdPath = path.join(rootDir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function extractTitle(raw, fallback) {
  const fm = raw.match(/^---\s*\n[\s\S]*?title:\s*['"]?([^'"\n]+)/);
  if (fm) return fm[1].trim();
  const h1 = raw.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return fallback;
}

function generateLlmsFull(pages, siteName) {
  const sections = [];
  sections.push(`# ${siteName} - Complete Documentation`);
  sections.push('');
  sections.push(`> This file contains the complete documentation for ${siteName}.`);
  sections.push(`> Total pages: ${pages.length}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  for (const { slug, title: navTitle } of pages) {
    const raw = readPage(slug);
    if (!raw) {
      console.warn(`  skip (missing): ${slug}`);
      continue;
    }
    const title = extractTitle(raw, navTitle);
    const body = mdxToText(raw);
    sections.push(`## ${title}`);
    sections.push('');
    sections.push(`*Source: /${slug}*`);
    sections.push('');
    sections.push(body);
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  return sections.join('\n');
}

function generateSitemapList(pages) {
  const lines = [`# Sitemap page list (${pages.length} URLs)`, '', `Base: ${siteBase}`, ''];
  pages.forEach(({ slug }, i) => {
    lines.push(`${i + 1}. ${siteBase}/${slug}`);
  });
  return lines.join('\n');
}

const docs = JSON.parse(fs.readFileSync(docsJsonPath, 'utf8'));
const pages = collectPages(docs.navigation.tabs || docs.navigation);
const siteName = docs.name || 'TapMind SDK Documentation';

const llmsFull = generateLlmsFull(pages, siteName);
const sitemapList = generateSitemapList(pages);

fs.writeFileSync(path.join(__dirname, 'llms-full.txt'), llmsFull, 'utf8');
fs.writeFileSync(path.join(__dirname, 'sitemap-pages.txt'), sitemapList, 'utf8');

const nextGenSlugs = pages.filter((p) => p.slug.includes('/next-gen/'));
if (nextGenSlugs.length) {
  fs.writeFileSync(
    path.join(__dirname, 'nextgen-llms-full.txt'),
    generateLlmsFull(nextGenSlugs, `${siteName} — Next-Gen`),
    'utf8',
  );
}

console.log(`Generated llms-full.txt (${pages.length} pages)`);
console.log(`Generated sitemap-pages.txt`);
if (nextGenSlugs.length) {
  console.log(`Generated nextgen-llms-full.txt (${nextGenSlugs.length} pages)`);
}

const staleSlug = pages.some((p) => p.slug.includes('ironsource-levelplay'));
const levelplaySlug = pages.filter((p) => p.slug.endsWith('/levelplay'));
console.log(`Navigation ironsource-levelplay slugs: ${staleSlug ? 'FOUND (fix docs.json)' : 'none'}`);
console.log(`Navigation levelplay slugs: ${levelplaySlug.length}`);
