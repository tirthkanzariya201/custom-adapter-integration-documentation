/**
 * MDX-aware code fence checker.
 * MDX treats `{` as expression start outside fences; some exports also break
 * when `{` appears inside fences if the opening fence was invalidated.
 * Flags pages where fence balance fails after stripping MDX expressions in prose.
 */
const fs = require('fs');
const path = require('path');

function stripFrontmatter(text) {
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('---', 3);
  if (end === -1) return text;
  return text.slice(end + 3);
}

function listMdx(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listMdx(full, files);
    else if (entry.name.endsWith('.mdx')) files.push(full);
  }
  return files;
}

/** Count fence toggles line-by-line (standard markdown). */
function fenceBalance(body) {
  const lines = body.split('\n');
  let open = false;
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      count += 1;
      open = !open;
    }
  }
  return { count, open, balanced: count % 2 === 0 && !open };
}

/** MDX export heuristic: `{` on its own in code may split fences when exporter is naive. */
function findSuspiciousBraceInFences(body) {
  const lines = body.split('\n');
  let inFence = false;
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence && /\{/.test(lines[i]) && !/^```/.test(trimmed)) {
      hits.push({ line: i + 1, text: lines[i].trim().slice(0, 80) });
    }
  }
  return hits;
}

const roots = [
  'getting-started',
  'gradle-setup',
  'reference',
  'guides/android',
  'guides/ios',
  'guides/unity',
  'guides/flutter',
  'guides/cocos',
  'guides/react-native',
];

const problems = [];
for (const root of roots) {
  for (const file of listMdx(root)) {
    const body = stripFrontmatter(fs.readFileSync(file, 'utf8'));
    const bal = fenceBalance(body);
    const braces = findSuspiciousBraceInFences(body);
    if (!bal.balanced || bal.open) {
      problems.push({
        file: path.relative(process.cwd(), file).replace(/\\/g, '/'),
        issue: 'unbalanced-fences',
        count: bal.count,
        open: bal.open,
      });
    } else if (braces.length) {
      problems.push({
        file: path.relative(process.cwd(), file).replace(/\\/g, '/'),
        issue: 'braces-in-fences',
        braceLines: braces.length,
        sample: braces[0],
      });
    }
  }
}

console.log(JSON.stringify(problems, null, 2));
