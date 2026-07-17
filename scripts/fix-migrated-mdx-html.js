const fs = require('fs');
const path = require('path');

const roots = [
  path.join(__dirname, '..', 'next-gen-sdk-integration'),
  path.join(__dirname, '..', 'orchestration-sdk-integration'),
];

function collectMdxFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectMdxFiles(full));
    else if (entry.name.endsWith('.mdx')) results.push(full);
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

function wrapXmlLikeBlocks(text) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;

  function fenceCount() {
    return (out.join('\n').match(/```/g) || []).length;
  }

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const inFence = fenceCount() % 2 === 1;

    if (
      !inFence &&
      (/^<(key|plist|manifest|application|meta-data)/.test(trimmed) ||
        (trimmed === '<array>' && lines[i - 1]?.trim().startsWith('<key>')))
    ) {
      const block = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (
          block.length > 0 &&
          t !== '' &&
          !t.startsWith('<') &&
          !t.startsWith('<!--') &&
          !t.startsWith('</')
        ) {
          break;
        }
        block.push(lines[i]);
        i++;
        if (t === '</manifest>' || t === '</plist>') break;
        if (t === '</array>' && block.filter((l) => l.includes('<dict>')).length >= 1) {
          if (block.filter((l) => l.includes('<dict>')).length > 5 || !lines[i]?.trim().startsWith('<dict>')) {
            break;
          }
        }
      }
      out.push('```');
      out.push(...block);
      out.push('```');
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  return out.join('\n');
}

function fixContent(content) {
  let result = content;

  result = result.replace(/<https?:\/\/[^>\s]+>/g, (m) => m.slice(1, -1));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  result = result.replace(/<br\s*\/?>/gi, '\n');
  result = result.replace(/\*\*\*\*([^*]+)\*\*\*\*/g, '**$1**');

  result = result.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '**$1**');
  result = result.replace(
    /<figure><img src="([^"]*)" alt=""><figcaption><\/figcaption><\/figure>/g,
    '![]($1)',
  );
  result = result.replace(
    /<div align="left"><img src="([^"]*)" alt=""><\/div>/g,
    '![]($1)',
  );
  result = result.replace(/\[<br>\]\(([^)]+)\)/g, '![]($1)');

  result = result.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (_, inner) => {
    const text = decodeEntities(inner).replace(/<\/?strong>/g, '').trim();
    const lang = text.includes('<manifest') || text.includes('</application>') ? 'xml' : '';
    return `\`\`\`${lang}\n${text}\n\`\`\``;
  });

  result = result.replace(/\*\*([^*]+)\*\*<br>/g, '**$1**\n');

  result = wrapXmlLikeBlocks(result);

  return result;
}

let changed = 0;
for (const file of roots.flatMap(collectMdxFiles)) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = fixContent(original);
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changed++;
  }
}

console.log(`Fixed HTML/MDX syntax in ${changed} files`);
