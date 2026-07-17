const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const gamDir = path.join(rootDir, 'images', 'gam');
const sourceImage = path.join(rootDir, 'images', 'image.png');
const targetImage = path.join(gamDir, 'gam-company-configuration.png');
const localRef = '/images/gam/gam-company-configuration.png';
const legacyUrl = 'https://ca-docs.adster.tech/custom-adapter-integration/android';

const readmeFiles = [
  'tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/README.md',
  'tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/README.md',
  'tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/README.md',
  'tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/README.md',
  'tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/README.md',
  'tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/README.md',
  'tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/README.md',
  'tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/README.md',
];

const report = {
  legacyUrl,
  localRef,
  sourceCopiedFrom: 'images/image.png (GitBook asset uploaded with GAM documentation)',
  filesUpdated: [],
  validation: { ok: [], missing: [], legacyRemaining: [] },
};

function collectDocFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['_migration-analysis', 'node_modules', '.git', 'scripts'].includes(entry.name)) {
        collectDocFiles(full, results);
      }
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function migrateImage() {
  fs.mkdirSync(gamDir, { recursive: true });
  if (!fs.existsSync(sourceImage)) {
    throw new Error(`Source image missing: ${sourceImage}`);
  }
  fs.copyFileSync(sourceImage, targetImage);
}

function updateReferences() {
  for (const rel of readmeFiles) {
    const filePath = path.join(rootDir, rel);
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;
    content = content.replace(
      `![](${legacyUrl})`,
      `![](${localRef})`
    );
    if (content !== before) {
      fs.writeFileSync(filePath, content);
      report.filesUpdated.push(rel);
    }
  }
}

function validate() {
  if (!fs.existsSync(targetImage)) {
    report.validation.missing.push({ src: localRef, reason: 'target file missing' });
  } else {
    report.validation.ok.push({ src: localRef, bytes: fs.statSync(targetImage).size });
  }

  const docFiles = [
    ...collectDocFiles(path.join(rootDir, 'tapmind-custom-adapter-sdk-integration')),
    path.join(rootDir, 'README.md'),
    path.join(rootDir, 'gradle-setup'),
  ].flatMap((entry) => {
    if (!fs.existsSync(entry)) return [];
    return fs.statSync(entry).isDirectory() ? collectDocFiles(entry) : [entry];
  });

  const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  for (const filePath of docFiles) {
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    if (/ca-docs\.adster\.tech/i.test(content)) {
      report.validation.legacyRemaining.push(rel);
    }
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      const src = match[1].trim();
      if (src.startsWith('/images/')) {
        const disk = path.join(rootDir, src.slice(1));
        if (fs.existsSync(disk)) report.validation.ok.push({ file: rel, src });
        else report.validation.missing.push({ file: rel, src });
      }
    }
  }
}

function writeReport() {
  let md = '# GAM Image Migration Report\n\n';
  md += '**Date:** 2026-06-08\n\n';
  md += 'Migrated legacy `ca-docs.adster.tech` image references on Google Ad Manager README pages to local `/images/gam/` assets.\n\n';

  md += '## Summary\n\n';
  md += '| Metric | Value |\n|---|---|\n';
  md += `| Legacy URL references resolved | ${report.filesUpdated.length} |\n`;
  md += `| Local image path | \`${localRef}\` |\n`;
  md += `| Image file size | ${fs.existsSync(targetImage) ? fs.statSync(targetImage).size : 0} bytes |\n`;
  md += `| Remaining ca-docs.adster.tech references in docs | ${report.validation.legacyRemaining.length} |\n`;
  md += `| Broken local image links | ${report.validation.missing.length} |\n\n`;

  md += '## Original URL resolution\n\n';
  md += `The legacy reference \`${legacyUrl}\` was a **GitBook page URL**, not a direct image endpoint. `;
  md += 'It could not be downloaded as image bytes. The screenshot was recovered from the co-located GitBook asset ';
  md += '`images/image.png` (originally `.gitbook/assets/image.png`), uploaded in the same commit as the GAM README pages.\n\n';

  md += '## Migration mapping\n\n';
  md += '| Original URL | New local path | Source |\n|---|---|---|\n';
  md += `| \`${legacyUrl}\` | \`${localRef}\` | Copied from \`${report.sourceCopiedFrom}\` |\n\n`;

  md += '## Files updated\n\n';
  for (const file of report.filesUpdated) md += `- \`${file}\`\n`;

  md += '\n## Validation\n\n';
  md += '### Local image file\n\n';
  md += `- \`${localRef}\` — ${fs.existsSync(targetImage) ? 'exists' : 'MISSING'}\n\n`;

  md += '### Legacy domain scan\n\n';
  if (report.validation.legacyRemaining.length === 0) {
    md += 'No `ca-docs.adster.tech` references remain in documentation content.\n\n';
  } else {
    for (const file of report.validation.legacyRemaining) md += `- \`${file}\`\n`;
    md += '\n';
  }

  if (report.validation.missing.length) {
    md += '### Missing links\n\n';
    for (const item of report.validation.missing) {
      md += `- \`${item.file || 'file?'}\` → \`${item.src}\`\n`;
    }
  } else {
    md += '### Image link check\n\nAll local `/images/` references resolve to files on disk.\n';
  }

  fs.writeFileSync(path.join(rootDir, 'gam-image-migration-report.md'), md);
}

migrateImage();
updateReferences();
validate();
writeReport();

console.log(`Updated ${report.filesUpdated.length} files`);
console.log(`Legacy remaining: ${report.validation.legacyRemaining.length}`);
console.log(`Missing links: ${report.validation.missing.length}`);

if (report.validation.legacyRemaining.length || report.validation.missing.length) {
  process.exitCode = 1;
}
