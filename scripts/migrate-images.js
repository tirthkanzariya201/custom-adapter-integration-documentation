const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, '.gitbook', 'assets');
const targetDir = path.join(rootDir, 'images');

const FILE_MAP = [
  { from: 'image (9).jpeg', to: 'ironsource-configuration.jpeg' },
  { from: 'cocos-extension-guide (1).png', to: 'cocos-extension-guide.png' },
  { from: 'cocos-extension-guide.png', to: 'cocos-extension-guide-alt.png' },
  { from: 'image (1).png', to: 'image-1.png' },
  { from: 'image (2).png', to: 'image-2.png' },
  { from: 'image (3).png', to: 'image-3.png' },
  { from: 'image (4).png', to: 'image-4.png' },
  { from: 'image (5).png', to: 'image-5.png' },
  { from: 'image.png', to: 'image.png' },
];

const REFERENCE_MAP = [
  {
    from: '../../../.gitbook/assets/image (9).jpeg',
    to: '/images/ironsource-configuration.jpeg',
  },
  {
    from: '../../../.gitbook/assets/cocos-extension-guide (1).png',
    to: '/images/cocos-extension-guide.png',
  },
  {
    from: '.gitbook/assets/image (9).jpeg',
    to: '/images/ironsource-configuration.jpeg',
  },
  {
    from: '.gitbook/assets/cocos-extension-guide (1).png',
    to: '/images/cocos-extension-guide.png',
  },
];

const report = {
  moved: [],
  referencesUpdated: [],
  unusedAssets: [],
  validation: [],
};

function collectTextFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '_migration-analysis') {
        continue;
      }
      collectTextFiles(fullPath, results);
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function moveAssets() {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const item of FILE_MAP) {
    const sourcePath = path.join(sourceDir, item.from);
    const targetPath = path.join(targetDir, item.to);

    if (!fs.existsSync(sourcePath)) {
      report.validation.push({
        status: 'error',
        message: `Missing source asset: ${item.from}`,
      });
      continue;
    }

    fs.renameSync(sourcePath, targetPath);
    report.moved.push({
      from: `.gitbook/assets/${item.from}`,
      to: `images/${item.to}`,
    });
  }
}

function updateReferences() {
  const docRoots = [
    path.join(rootDir, 'tapmind-custom-adapter-sdk-integration'),
    path.join(rootDir, 'README.md'),
    path.join(rootDir, 'gradle-setup'),
  ];

  const files = docRoots.flatMap((entry) =>
    fs.statSync(entry).isDirectory() ? collectTextFiles(entry) : [entry]
  );

  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const mapping of REFERENCE_MAP) {
      if (content.includes(mapping.from)) {
        const count = content.split(mapping.from).length - 1;
        content = content.split(mapping.from).join(mapping.to);
        changed = true;
        report.referencesUpdated.push({
          file: path.relative(rootDir, filePath).replace(/\\/g, '/'),
          from: mapping.from,
          to: mapping.to,
          count,
        });
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
    }
  }
}

function markUnusedAssets() {
  const referencedTargets = new Set(
    report.referencesUpdated.map((entry) => entry.to.replace('/images/', ''))
  );

  for (const item of FILE_MAP) {
    if (!referencedTargets.has(item.to)) {
      report.unusedAssets.push(`images/${item.to}`);
    }
  }
}

function validateLocalImageRefs() {
  const docRoots = [
    path.join(rootDir, 'tapmind-custom-adapter-sdk-integration'),
    path.join(rootDir, 'README.md'),
    path.join(rootDir, 'gradle-setup'),
  ];
  const files = docRoots.flatMap((entry) =>
    fs.statSync(entry).isDirectory() ? collectTextFiles(entry) : [entry]
  );
  const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;

  for (const filePath of files) {
    const relFile = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const src = match[1].trim();
      if (/^https?:\/\//i.test(src) || src.startsWith('data:')) {
        report.validation.push({
          status: 'external',
          file: relFile,
          src,
        });
        continue;
      }

      const candidates = src.startsWith('/')
        ? [path.join(rootDir, src.slice(1))]
        : [path.resolve(path.dirname(filePath), src)];

      const exists = candidates.some((candidate) => fs.existsSync(candidate));
      report.validation.push({
        status: exists ? 'ok' : 'missing',
        file: relFile,
        src,
      });
    }
  }
}

function writeReport() {
  const ok = report.validation.filter((entry) => entry.status === 'ok').length;
  const missing = report.validation.filter((entry) => entry.status === 'missing');
  const external = report.validation.filter((entry) => entry.status === 'external').length;
  const errors = report.validation.filter((entry) => entry.status === 'error');

  let md = '# Image Migration Report\n\n';
  md += 'GitBook assets moved from `.gitbook/assets/` to `images/` with updated documentation references.\n\n';
  md += '## Summary\n\n';
  md += '| Metric | Count |\n|---|---|\n';
  md += `| Assets moved | ${report.moved.length} |\n`;
  md += `| Reference updates | ${report.referencesUpdated.reduce((sum, item) => sum + item.count, 0)} |\n`;
  md += `| Files updated | ${new Set(report.referencesUpdated.map((item) => item.file)).size} |\n`;
  md += `| Local image links validated (ok) | ${ok} |\n`;
  md += `| External image links | ${external} |\n`;
  md += `| Missing local image links | ${missing.length} |\n`;
  md += `| Unused moved assets | ${report.unusedAssets.length} |\n\n`;

  md += '## Assets moved\n\n';
  md += '| GitBook path | JamDesk path |\n|---|---|\n';
  for (const item of report.moved) {
    md += `| \`${item.from}\` | \`${item.to}\` |\n`;
  }

  md += '\n## Reference updates\n\n';
  md += '| File | Old path | New path | Count |\n|---|---|---|---|\n';
  for (const item of report.referencesUpdated) {
    md += `| \`${item.file}\` | \`${item.from}\` | \`${item.to}\` | ${item.count} |\n`;
  }

  if (report.unusedAssets.length > 0) {
    md += '\n## Unused assets (moved, not referenced)\n\n';
    for (const asset of report.unusedAssets) {
      md += `- \`${asset}\`\n`;
    }
  }

  md += '\n## Image link validation\n\n';
  md += '### Local links (ok)\n\n';
  for (const item of report.validation.filter((entry) => entry.status === 'ok')) {
    md += `- \`${item.file}\` → \`${item.src}\`\n`;
  }

  md += '\n### External links\n\n';
  for (const item of report.validation.filter((entry) => entry.status === 'external')) {
    md += `- \`${item.file}\` → \`${item.src}\`\n`;
  }

  if (missing.length > 0) {
    md += '\n### Missing local links\n\n';
    for (const item of missing) {
      md += `- \`${item.file}\` → \`${item.src}\`\n`;
    }
  }

  if (errors.length > 0) {
    md += '\n### Errors\n\n';
    for (const item of errors) {
      md += `- ${item.message}\n`;
    }
  }

  fs.writeFileSync(path.join(rootDir, 'image-migration-report.md'), md);
  fs.writeFileSync(
    path.join(rootDir, 'scripts', 'image-migration-stats.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`Moved ${report.moved.length} assets`);
  console.log(`Updated ${report.referencesUpdated.reduce((sum, item) => sum + item.count, 0)} references`);
  console.log(`Missing local links: ${missing.length}`);

  if (missing.length > 0 || errors.length > 0) {
    process.exitCode = 1;
  }
}

moveAssets();
updateReferences();
markUnusedAssets();
validateLocalImageRefs();
writeReport();
