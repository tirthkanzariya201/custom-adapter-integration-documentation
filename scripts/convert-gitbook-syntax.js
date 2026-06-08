const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const HINT_STYLE_MAP = {
  info: 'Info',
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Danger',
  success: 'Check',
};

const INCLUDE_MAP = {
  'doc-tag-admob-gam.md': {
    component: 'DocTagAdmobGam',
    path: '/snippets/doc-tag-admob-gam.mdx',
  },
  'doc-tag-ironsource.md': {
    component: 'DocTagIronsource',
    path: '/snippets/doc-tag-ironsource.mdx',
  },
  'doc-tag-applovin.md': {
    component: 'DocTagApplovin',
    path: '/snippets/doc-tag-applovin.mdx',
  },
};

const SNIPPET_SOURCES = [
  {
    source: '.gitbook/includes/doc-tag-admob-gam.md',
    target: 'snippets/doc-tag-admob-gam.mdx',
  },
  {
    source: '.gitbook/includes/doc-tag-ironsource.md',
    target: 'snippets/doc-tag-ironsource.mdx',
  },
  {
    source: '.gitbook/includes/doc-tag-applovin.md',
    target: 'snippets/doc-tag-applovin.mdx',
  },
];

const report = {
  filesModified: [],
  hints: 0,
  includes: 0,
  tabs: 0,
  hintByStyle: {},
  includeBySnippet: {},
  tabByFile: {},
  manualReview: [],
};

function stripFrontmatterBody(content) {
  if (!content.startsWith('---')) {
    return content;
  }
  const end = content.indexOf('---', 3);
  if (end === -1) {
    return content;
  }
  return content.slice(end + 3).replace(/^\s*/, '');
}

function toSnippetBody(content) {
  const body = stripFrontmatterBody(content).trim();
  return `${body}\n`;
}

function createSnippets() {
  for (const snippet of SNIPPET_SOURCES) {
    const sourcePath = path.join(rootDir, snippet.source);
    const targetPath = path.join(rootDir, snippet.target);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(targetPath, toSnippetBody(sourceContent));
  }
}

function convertHints(content) {
  return content.replace(
    /{%\s*hint\s+style="([^"]+)"\s*%}([\s\S]*?){%\s*endhint\s*%}/g,
    (_, style, body) => {
      const normalized = style.toLowerCase();
      const tag = HINT_STYLE_MAP[normalized] || 'Info';
      report.hints += 1;
      report.hintByStyle[normalized] = (report.hintByStyle[normalized] || 0) + 1;
      return `<${tag}>\n${body.trim()}\n</${tag}>`;
    }
  );
}

function convertTabsBlock(block) {
  const inner = block
    .replace(/{%\s*tabs\s*%}/, '')
    .replace(/{%\s*endtabs\s*%}/, '');
  const tabs = [];
  const tabRegex = /{%\s*tab\s+title="([^"]*)"\s*%}([\s\S]*?){%\s*endtab\s*%}/g;
  let match;

  while ((match = tabRegex.exec(inner)) !== null) {
    tabs.push({ title: match[1], body: match[2].trim() });
  }

  if (tabs.length === 0) {
    return block;
  }

  report.tabs += 1;
  const rendered = tabs
    .map((tab) => `  <Tab title="${tab.title}">\n${tab.body}\n  </Tab>`)
    .join('\n');
  return `<Tabs>\n${rendered}\n</Tabs>`;
}

function convertTabs(content, filePath) {
  let result = content;
  while (/{%\s*tabs\s*%}/.test(result)) {
    const start = result.search(/{%\s*tabs\s*%}/);
    const tail = result.slice(start);
    const endMatch = tail.match(/{%\s*endtabs\s*%}/);
    if (!endMatch) {
      report.manualReview.push({
        file: filePath,
        reason: 'Unclosed {% tabs %} block',
      });
      break;
    }
    const end = start + endMatch.index + endMatch[0].length;
    const block = result.slice(start, end);
    const converted = convertTabsBlock(block);
    if (converted === block) {
      report.manualReview.push({
        file: filePath,
        reason: 'Failed to parse {% tabs %} block',
      });
      break;
    }
    if (!report.tabByFile[filePath]) {
      report.tabByFile[filePath] = 0;
    }
    report.tabByFile[filePath] += 1;
    result = result.slice(0, start) + converted + result.slice(end);
  }
  return result;
}

function convertIncludes(content) {
  const imports = new Set();

  const converted = content.replace(
    /{%\s*include\s+"[^"]*\/([^"/]+)"\s*%}/g,
    (_, filename) => {
      const mapped = INCLUDE_MAP[filename];
      if (!mapped) {
        report.manualReview.push({
          file: 'unknown',
          reason: `Unknown include file: ${filename}`,
        });
        return _;
      }
      imports.add(`import ${mapped.component} from '${mapped.path}'`);
      report.includes += 1;
      report.includeBySnippet[filename] =
        (report.includeBySnippet[filename] || 0) + 1;
      return `<${mapped.component} />`;
    }
  );

  return { content: converted, imports: [...imports] };
}

function insertImports(content, importLines) {
  if (importLines.length === 0) {
    return content;
  }

  const imports = `${importLines.join('\n')}\n\n`;

  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) {
      const head = content.slice(0, end + 3);
      const tail = content.slice(end + 3).replace(/^\s*/, '');
      return `${head}\n\n${imports}${tail}`;
    }
  }

  return `${imports}${content}`;
}

function convertFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let content = original;
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');

  const hadGitbook =
    /{%\s*(hint|include|tabs|tab)\b/.test(content) ||
    /{%\s*end(hint|tab|tabs)\s*%}/.test(content);

  if (!hadGitbook) {
    return false;
  }

  content = convertHints(content);
  content = convertTabs(content, relPath);
  const includeResult = convertIncludes(content);
  content = insertImports(includeResult.content, includeResult.imports);

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    report.filesModified.push(relPath);
    return true;
  }

  return false;
}

function collectMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function detectManualReview() {
  const candidates = [
    'README.md',
    ...collectMarkdownFiles(
      path.join(rootDir, 'tapmind-custom-adapter-sdk-integration')
    ),
    ...collectMarkdownFiles(path.join(rootDir, 'gradle-setup')),
  ];

  for (const filePath of candidates) {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    if (/class="button/.test(content)) {
      report.manualReview.push({
        file: relPath,
        reason: 'GitBook HTML button links — requires Card/Button redesign',
      });
    }
    if (/\[<br>\]\(https:\/\/ca-docs\.adster\.tech/.test(content)) {
      report.manualReview.push({
        file: relPath,
        reason: 'Legacy GitBook image embed via ca-docs.adster.tech URL',
      });
    }
    if (/\.gitbook\/assets\//.test(content)) {
      report.manualReview.push({
        file: relPath,
        reason: 'Relative .gitbook/assets/ image path — move to /images/ in Phase 3',
      });
    }
    if (/<figure>|<div align=/.test(content)) {
      report.manualReview.push({
        file: relPath,
        reason: 'HTML figure/div image markup — verify rendering after preview',
      });
    }
    if (/^icon:/m.test(content)) {
      report.manualReview.push({
        file: relPath,
        reason: 'GitBook icon frontmatter field — not used by JamDesk',
      });
    }
    if (/{%\s*(hint|include|tabs|tab)\b/.test(content)) {
      report.manualReview.push({
        file: relPath,
        reason: 'Residual GitBook syntax after conversion',
      });
    }
  }
}

function writeReport() {
  const uniqueManual = [];
  const seen = new Set();
  for (const item of report.manualReview) {
    const key = `${item.file}::${item.reason}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueManual.push(item);
  }
  report.manualReview = uniqueManual;

  let md = '# Migration Phase 2 Report\n\n';
  md += 'GitBook syntax conversion to JamDesk components (hints, includes, tabs).\n\n';
  md += '## Summary\n\n';
  md += `| Metric | Count |\n|---|---|\n`;
  md += `| Files modified | ${report.filesModified.length} |\n`;
  md += `| Hint blocks converted | ${report.hints} |\n`;
  md += `| Include blocks converted | ${report.includes} |\n`;
  md += `| Tab groups converted | ${report.tabs} |\n`;
  md += `| Snippets created | ${SNIPPET_SOURCES.length} |\n`;
  md += `| Pages requiring manual review | ${report.manualReview.length} |\n\n`;

  md += '## Hint conversions by style\n\n';
  md += '| GitBook style | JamDesk component | Count |\n|---|---|---|\n';
  for (const [style, count] of Object.entries(report.hintByStyle).sort()) {
    const tag = HINT_STYLE_MAP[style] || 'Info';
    md += `| \`${style}\` | \`<${tag}>\` | ${count} |\n`;
  }

  md += '\n## Include conversions by snippet\n\n';
  md += '| GitBook include | JamDesk snippet | Count |\n|---|---|---|\n';
  for (const [file, count] of Object.entries(report.includeBySnippet).sort()) {
    const mapped = INCLUDE_MAP[file];
    md += `| \`${file}\` | \`${mapped.path}\` | ${count} |\n`;
  }

  md += '\n## Tab conversions by file\n\n';
  md += '| File | Tab groups converted |\n|---|---|\n';
  for (const [file, count] of Object.entries(report.tabByFile).sort()) {
    md += `| \`${file}\` | ${count} |\n`;
  }

  md += '\n## Files modified\n\n';
  for (const file of report.filesModified.sort()) {
    md += `- \`${file}\`\n`;
  }

  md += '\n## Snippets created\n\n';
  for (const snippet of SNIPPET_SOURCES) {
    md += `- \`${snippet.target}\` (from \`${snippet.source}\`)\n`;
  }

  md += '\n## Pages requiring manual review\n\n';
  md += '| File | Reason |\n|---|---|\n';
  for (const item of report.manualReview.sort((a, b) =>
    a.file.localeCompare(b.file)
  )) {
    md += `| \`${item.file}\` | ${item.reason} |\n`;
  }

  fs.writeFileSync(path.join(rootDir, 'migration-phase2-report.md'), md);
  fs.writeFileSync(
    path.join(rootDir, 'scripts', 'phase2-conversion-stats.json'),
    JSON.stringify(report, null, 2)
  );
}

function main() {
  createSnippets();

  const targets = [
    path.join(rootDir, 'README.md'),
    ...collectMarkdownFiles(
      path.join(rootDir, 'tapmind-custom-adapter-sdk-integration')
    ),
    ...collectMarkdownFiles(path.join(rootDir, 'gradle-setup')),
  ];

  for (const filePath of targets) {
    convertFile(filePath);
  }

  detectManualReview();
  writeReport();

  console.log(`Modified ${report.filesModified.length} files`);
  console.log(`Hints: ${report.hints}, Includes: ${report.includes}, Tabs: ${report.tabs}`);
}

main();
