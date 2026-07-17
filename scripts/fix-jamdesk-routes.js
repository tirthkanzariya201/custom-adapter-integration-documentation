const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const docsJsonPath = path.join(rootDir, 'docs.json');
const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, 'utf8'));

function extractNavPages(nav) {
  const pages = new Set();
  function walkContainer(container) {
    if (!container || typeof container !== 'object') return;
    if (container.page) pages.add(container.page);
    for (const key of ['pages', 'groups', 'tabs', 'anchors', 'dropdowns', 'languages']) {
      if (!Array.isArray(container[key])) continue;
      for (const item of container[key]) {
        if (typeof item === 'string') pages.add(item);
        else walkContainer(item);
      }
    }
    if (container.global) walkContainer(container.global);
  }
  walkContainer(nav);
  return [...pages].sort();
}

function resolveFile(slug) {
  const mdx = path.join(rootDir, `${slug}.mdx`);
  const md = path.join(rootDir, `${slug}.md`);
  if (fs.existsSync(mdx)) return { slug, file: mdx, ext: '.mdx', status: 'ok-mdx' };
  if (fs.existsSync(md)) return { slug, file: md, ext: '.md', status: 'needs-mdx' };
  return { slug, file: null, ext: null, status: 'missing' };
}

const slugs = extractNavPages(docsJson.navigation);
const mapping = slugs.map(resolveFile);
const renamed = [];

for (const entry of mapping) {
  if (entry.status !== 'needs-mdx') continue;
  const target = entry.file.replace(/\.md$/, '.mdx');
  fs.renameSync(entry.file, target);
  renamed.push({ slug: entry.slug, from: path.relative(rootDir, entry.file), to: path.relative(rootDir, target) });
  entry.status = 'renamed';
  entry.file = target;
  entry.ext = '.mdx';
}

const after = slugs.map((slug) => {
  const r = resolveFile(slug);
  return {
    currentRoute: slug,
    actualFile: r.file ? path.relative(rootDir, r.file).replace(/\\/g, '/') : null,
    expectedRoute: `/${slug}`,
    status: r.status === 'ok-mdx' || r.status === 'renamed' ? 'PASS' : 'FAIL',
  };
});

const report = {
  rootCause:
    'JamDesk runtime (ISR + dev content-loader) resolves pages as {slug}.mdx only. GitBook migration left 94 navigation pages as .md files. Navigation slugs in docs.json were correct, but production could not load .md sources from R2.',
  renamedCount: renamed.length,
  mapping: after,
  renamed,
};

fs.writeFileSync(path.join(rootDir, 'scripts', 'route-fix-stats.json'), JSON.stringify(report, null, 2));

let md = '# Route Fix Report\n\n';
md += `**Date:** ${new Date().toISOString().slice(0, 10)}\n\n`;

md += '## Root cause\n\n';
md += 'JamDesk uses **slug-based routing** where each navigation entry maps to `{slug}.mdx` at the project root.\n\n';
md += '- `docs.json` navigation slugs were **correct** (they matched GitBook file paths).\n';
md += '- Documentation files were **`.md`**, but JamDesk production ISR and the dev content-loader only read **`.mdx`**.\n';
md += '- Result: sidebar rendered from `docs.json`, but every page request returned **404** because no `.mdx` file existed at the expected path.\n\n';
md += 'JamDesk CLI `validate` checks both `.mdx` and `.md`, which masked the issue during migration QA.\n\n';

md += '## Fix applied\n\n';
md += `Renamed **${renamed.length}** navigation-referenced files from .md to .mdx (content unchanged).\n\n`;
md += 'No `docs.json` route changes were required — slugs already matched file paths.\n\n';

md += '## Summary\n\n';
md += '| Metric | Count |\n|---|---|\n';
md += `| Navigation entries | ${slugs.length} |\n`;
md += `| Files renamed .md → .mdx | ${renamed.length} |\n`;
md += `| Routes passing after fix | ${after.filter((r) => r.status === 'PASS').length} |\n`;
md += `| Routes still failing | ${after.filter((r) => r.status === 'FAIL').length} |\n\n`;

md += '## Route mapping\n\n';
md += '| Current docs.json route | Actual file | Expected JamDesk route | Status |\n';
md += '|---|---|---|---|\n';
for (const row of after) {
  md += `| \`${row.currentRoute}\` | \`${row.actualFile || 'MISSING'}\` | \`${row.expectedRoute}\` | **${row.status}** |\n`;
}

if (renamed.length) {
  md += '\n## Files renamed\n\n';
  md += '| Slug | Before | After |\n|---|---|---|\n';
  for (const r of renamed) {
    md += `| \`${r.slug}\` | \`${r.from.replace(/\\/g, '/')}\` | \`${r.to.replace(/\\/g, '/')}\` |\n`;
  }
}

md += '\n## JamDesk routing reference\n\n';
md += '| Mechanism | Behavior |\n|---|---|\n';
md += '| File-based routing | `{slug}.mdx` at project root (nested paths supported) |\n';
md += '| Slug-based routing | Navigation slug = URL path without leading `/` |\n';
md += '| Frontmatter slug | Optional `title` / `description`; no custom URL slug required |\n';
md += '| README pages | Use slug `.../README` → file `.../README.mdx` |\n\n';

const fails = after.filter((r) => r.status === 'FAIL');
if (fails.length) {
  md += '## Remaining issues\n\n';
  for (const f of fails) md += `- \`${f.currentRoute}\` — no file found\n`;
} else {
  md += '## Remaining issues\n\nNone.\n';
}

fs.writeFileSync(path.join(rootDir, 'route-fix-report.md'), md);

console.log(`Renamed ${renamed.length} files`);
console.log(`Passing routes: ${after.filter((r) => r.status === 'PASS').length}/${slugs.length}`);
if (fails.length) process.exitCode = 1;
