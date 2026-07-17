/**
 * Generates a local HTML review build with diff highlights (not for production).
 * Compares working tree against git HEAD for listed documentation files.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'review-build');

const TRACKED_FILES = [
  'docs.json',
  'style.css',
  'getting-started/introduction.mdx',
  'getting-started/prerequisites.mdx',
  'getting-started/choose-your-sdk.mdx',
  'gradle-setup/for-gradle-version-7-plus.mdx',
  'reference/compatibility-matrix.mdx',
  'reference/class-network-key-registry.mdx',
  'reference/troubleshooting.mdx',
  'overview.mdx',
  'snippets/shared/gma-prerequisites-next-gen-android.mdx',
  'guides/android/custom-adapter-gma-next-gen-sdk/admob.mdx',
  'guides/android/custom-adapter-gma-next-gen-sdk/google-ad-manager.mdx',
  'scripts/build-os-mediation-guides.js',
  'scripts/generate-registry-page.js',
  'scripts/generate-slug-redirects.js',
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function readAtHead(relPath) {
  try {
    return execSync(`git show HEAD:${relPath.replace(/\\/g, '/')}`, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function readWorking(relPath) {
  const abs = path.join(rootDir, relPath);
  if (!fs.existsSync(abs)) return '';
  return fs.readFileSync(abs, 'utf8');
}

function lineDiffHtml(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  const max = Math.max(a.length, b.length);
  const lines = [];

  for (let i = 0; i < max; i++) {
    const left = a[i];
    const right = b[i];
    if (left === right) {
      if (left !== undefined) {
        lines.push(`<div class="line same"><span class="ln">${i + 1}</span><code>${escapeHtml(left)}</code></div>`);
      }
      continue;
    }
    if (left !== undefined && right === undefined) {
      lines.push(`<div class="line removed"><span class="ln">${i + 1}</span><code>${escapeHtml(left)}</code></div>`);
      continue;
    }
    if (right !== undefined && left === undefined) {
      lines.push(`<div class="line added"><span class="ln">${i + 1}</span><code>${escapeHtml(right)}</code></div>`);
      continue;
    }
    lines.push(`<div class="line removed"><span class="ln">${i + 1}</span><code>${escapeHtml(left)}</code></div>`);
    lines.push(`<div class="line added"><span class="ln">→</span><code>${escapeHtml(right)}</code></div>`);
  }

  return lines.join('\n');
}

function pageHtml(relPath, before, after) {
  const changed = before !== after;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Review: ${escapeHtml(relPath)}</title>
  <link rel="stylesheet" href="review-highlights.css">
</head>
<body>
  <header>
    <a href="index.html">← All changes</a>
    <h1>${escapeHtml(relPath)}</h1>
    <p class="legend">
      <span class="tag added">🟢 Added</span>
      <span class="tag removed">🔴 Removed</span>
      <span class="tag modified">🟡 Modified (paired remove + add)</span>
    </p>
  </header>
  <section>
    <h2>${changed ? 'Highlighted diff (HEAD → local)' : 'No changes detected vs git HEAD'}</h2>
    <div class="diff">${lineDiffHtml(before, after)}</div>
  </section>
  <section>
    <h2>Local file (current)</h2>
    <pre class="current">${escapeHtml(after)}</pre>
  </section>
</body>
</html>`;
}

fs.mkdirSync(outDir, { recursive: true });

const indexRows = [];
let changedCount = 0;

for (const relPath of TRACKED_FILES) {
  const before = readAtHead(relPath);
  const after = readWorking(relPath);
  const changed = before !== after;
  if (changed) changedCount++;

  const safeName = relPath.replace(/[\\/]/g, '__');
  const outFile = path.join(outDir, `${safeName}.html`);
  fs.writeFileSync(outFile, pageHtml(relPath, before, after), 'utf8');

  indexRows.push({
    relPath,
    changed,
    href: `${safeName}.html`,
  });
}

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TapMind Documentation Review Build</title>
  <link rel="stylesheet" href="review-highlights.css">
</head>
<body>
  <header>
    <h1>TapMind Documentation — Local Review Build</h1>
    <p>Highlighted diffs compare <strong>git HEAD</strong> to your <strong>local working tree</strong>. Highlights are for review only and are not published.</p>
    <p><strong>${changedCount}</strong> of ${TRACKED_FILES.length} tracked files changed.</p>
    <p class="legend">
      <span class="tag added">🟢 Added</span>
      <span class="tag removed">🔴 Removed</span>
      <span class="tag modified">🟡 Modified lines</span>
    </p>
    <p><strong>Live preview (local):</strong> run <code>npx jamdesk dev --port 3456</code> and open <a href="http://localhost:3456/getting-started/introduction">http://localhost:3456</a>. Compare with production at <a href="https://docs.tapmind.io/getting-started/introduction">docs.tapmind.io</a>.</p>
  </header>
  <table>
    <thead><tr><th>File</th><th>Status</th></tr></thead>
    <tbody>
      ${indexRows
        .map(
          (row) => `<tr><td><a href="${row.href}">${escapeHtml(row.relPath)}</a></td><td>${row.changed ? 'Changed' : 'Unchanged'}</td></tr>`
        )
        .join('\n')}
    </tbody>
  </table>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml, 'utf8');

fs.writeFileSync(
  path.join(outDir, 'review-highlights.css'),
  `:root {
  --bg: #f8fafc;
  --ink: #0f172a;
  --mut: #64748b;
  --line: #e2e8f0;
  --add: #dcfce7;
  --add-border: #16a34a;
  --rem: #fee2e2;
  --rem-border: #dc2626;
}
* { box-sizing: border-box; }
body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; background: var(--bg); color: var(--ink); line-height: 1.5; }
header { margin-bottom: 24px; }
a { color: #7c3aed; }
table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); font-size: 14px; }
.legend { display: flex; gap: 12px; flex-wrap: wrap; }
.tag { font-size: 13px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--line); background: #fff; }
.diff { background: #fff; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.line { display: grid; grid-template-columns: 48px 1fr; gap: 8px; padding: 2px 10px; border-bottom: 1px solid #f1f5f9; }
.line.same code { color: #334155; }
.line.added { background: var(--add); border-left: 3px solid var(--add-border); }
.line.removed { background: var(--rem); border-left: 3px solid var(--rem-border); }
.ln { color: var(--mut); text-align: right; user-select: none; }
pre.current { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 16px; overflow: auto; font-size: 12px; }
`,
  'utf8'
);

console.log(`Review build written to ${path.relative(rootDir, outDir)}/index.html (${changedCount} files changed)`);
