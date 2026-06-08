const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function collectMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
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

function decodeEntities(text) {
  return text
    .replace(/&#x3C;/g, '<')
    .replace(/&#x3E;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x20;/g, ' ');
}

function fixContent(content) {
  let result = content;

  result = result.replace(/\[<br>\]\(([^)]+)\)/g, '![]($1)');
  result = result.replace(
    /<figure><img src="([^"]*)" alt=""><figcaption><\/figcaption><\/figure>/g,
    '![]($1)'
  );
  result = result.replace(
    /<div align="left"><img src="([^"]*)" alt=""><\/div>/g,
    '![]($1)'
  );
  result = result.replace(/-ObjC<br>/g, '-ObjC\n');
  result = result.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (_, inner) => {
    const text = decodeEntities(inner)
      .replace(/<\/?strong>/g, '')
      .trim();
    return `\`\`\`xml\n${text}\n\`\`\``;
  });

  return result;
}

const targets = collectMarkdownFiles(
  path.join(rootDir, 'tapmind-custom-adapter-sdk-integration')
);

let changed = 0;
for (const filePath of targets) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = fixContent(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
    changed += 1;
  }
}

console.log(`MDX HTML syntax fixes applied to ${changed} files`);
