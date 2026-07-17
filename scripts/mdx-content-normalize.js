function stripCr(line) {
  return line.replace(/\r$/, '');
}

const CALLOUT_BLOCK_RE = /<(?:Callout|Info)(?:\s[^>]*)?>([\s\S]*?)<\/(?:Callout|Info)>/gi;

function isPrerequisiteCallout(inner) {
  return /\*\*(?:App\s+)?Prerequisites?\*\*/i.test(inner) || /\*\*PREREQUISITES\*\*/i.test(inner);
}

function extractBulletsFromCallout(inner) {
  const bullets = [];
  for (const line of inner.split('\n')) {
    const trimmed = stripCr(line).trim();
    if (!trimmed) continue;
    if (/^\*\*(?:App\s+)?Prerequisites?\*\*$/i.test(trimmed)) continue;
    if (/^\*\*PREREQUISITES\*\*$/i.test(trimmed)) continue;
    if (/^[\*\-]\s+/.test(trimmed)) bullets.push(trimmed);
  }
  return bullets;
}

function extractPrerequisiteBullets(body) {
  if (!body) return [];
  const bullets = [];
  const re = new RegExp(CALLOUT_BLOCK_RE.source, 'gi');
  let match;
  while ((match = re.exec(body)) !== null) {
    if (isPrerequisiteCallout(match[1])) {
      bullets.push(...extractBulletsFromCallout(match[1]));
    }
  }
  return bullets;
}

function stripPrerequisiteCallouts(body) {
  if (!body) return '';
  return body
    .replace(new RegExp(CALLOUT_BLOCK_RE.source, 'gi'), (full, inner) =>
      isPrerequisiteCallout(inner) ? '' : full,
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeBulletKey(line) {
  return line
    .replace(/^[\*\-]\s+/, '')
    .replace(/\bof\b/gi, '')
    .replace(/\s+or higher/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function dedupeBullets(bullets) {
  const seen = new Set();
  const out = [];
  for (const bullet of bullets) {
    const key = normalizeBulletKey(bullet);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(/^[\*\-]\s+/.test(bullet) ? bullet : `* ${bullet}`);
  }
  return out;
}

function buildMergedPrerequisitesCallout(bullets) {
  const unique = dedupeBullets(bullets);
  if (!unique.length) return '';
  return `<Callout type="info">
**App Prerequisites**

${unique.join('\n')}
</Callout>`;
}

/** Remove extra blank lines after callout titles and inside callouts. */
function tightenCalloutBlocks(body) {
  let out = body.replace(/(<Callout[^>]*>\n)([^\n<]+)\n\n+/g, '$1$2\n');
  out = out.replace(/<Callout[\s\S]*?<\/Callout>/g, (block) =>
    block.replace(/\n{3,}/g, '\n\n'),
  );
  return out;
}

function flattenArrowCallouts(body) {
  return body.replace(
    /<Callout([^>]*)>\s*((?:\*\*[^*]+\*\*\s*→\s*)+\*\*[^*]+\*\*)\s*<\/Callout>/gi,
    (_match, attrs, inner) => {
      const flat = inner
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\s*→\s*/g, ' → ')
        .replace(/\s+/g, ' ')
        .trim();
      return `<Callout${attrs}>\n**${flat}**\n</Callout>`;
    },
  );
}

function fixAutolinkUrls(body) {
  return body
    .replace(/:\s*<(https?:\/\/[^>]+)>/g, ': [$1]($1)')
    .replace(/^<(https?:\/\/[^>]+)>$/gm, '[$1]($1)');
}

const FILE_IMAGE_MAP = {
  '/files/8xxSv5U6bj0SWRtd8lo6': '/images/ironsource-configuration.jpeg',
  '/files/jKtODWofmjkPX4RjN9pl': '/images/cocos-extension-guide.png',
  '../../../.gitbook/assets/image (9).jpeg': '/images/ironsource-configuration.jpeg',
  '.gitbook/assets/image (9).jpeg': '/images/ironsource-configuration.jpeg',
  '../../../.gitbook/assets/cocos-extension-guide (1).png': '/images/cocos-extension-guide.png',
};

function convertFigureImages(body) {
  return body
    .replace(
      /<figure>\s*<img\s+src="([^"]+)"[^>]*>\s*(?:<figcaption>[\s\S]*?<\/figcaption>)?\s*<\/figure>/gi,
      (_, src) => {
        const mapped = FILE_IMAGE_MAP[src] || src;
        return `![](${mapped})`;
      },
    )
    .replace(/!\[\]\(([^)]+)\)/g, (_, src) => {
      const mapped = FILE_IMAGE_MAP[src] || src;
      return mapped === src ? `![](${src})` : `![](${mapped})`;
    });
}

function stripBrokenGitbookLinks(body) {
  return body.replace(/^\[<br>\]\([^)]+\)\s*$/gm, '').replace(/\n{3,}/g, '\n\n');
}

function stripGitbookNavLinks(body) {
  return body.replace(
    /^-\s+\[(?:Installation|Configuration)\]\(https:\/\/tapminds\.gitbook\.io\/[^\)]+\)[^\n]*\n?/gim,
    '',
  );
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&#x3C;/gi, '<')
    .replace(/&#x3E;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"');
}

function convertPreCodeBlocks(body) {
  return body.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (_, inner) => {
    const code = decodeHtmlEntities(inner).replace(/<\/?strong>/gi, '').trim();
    return `\n\`\`\`\n${code}\n\`\`\`\n`;
  });
}

function convertDivImages(body) {
  return body.replace(
    /<div[^>]*>\s*<img\s+src="([^"]+)"[^>]*>\s*<\/div>/gi,
    (_, src) => `![](${src})`,
  );
}

function stripGitbookHeadingAnchors(body) {
  return body.replace(/\s*<a\s+href="#[^"]*"\s+id="[^"]*"><\/a>/gi, '');
}

function convertMarkTags(body) {
  return body.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, (_, inner) => {
    const text = inner.replace(/<\/?strong>/gi, '').trim();
    if (/^\*\*[^*]+\*\*$/.test(text)) return text;
    if (/^[a-zA-Z0-9._-]+$/.test(text)) return `\`${text}\``;
    return text;
  });
}

function decodeInlineHtmlEntities(body) {
  return body.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

function stripTrailingHorizontalRules(body) {
  return body.replace(/\n---+\s*$/g, '').trim();
}

/** Language-tagged fences break naive agent markdown parsers (```xml + HTML tags). */
function stripFenceLanguageTags(body) {
  return body.replace(/```(xml|gradle|kotlin|json|javascript|typescript|text)\n/g, '```\n');
}

/** `${expr}` inside code fences is parsed as MDX/expression in some agent exports. */
function neutralizeTemplateStringsInFences(body) {
  return body.replace(/```[\s\S]*?```/g, (block) =>
    block.replace(/\$\{([^}]+)\}/g, '" + $1 + "'),
  );
}

function normalizeAgentSafeMarkdown(body) {
  let out = body;
  out = neutralizeTemplateStringsInFences(out);
  out = stripFenceLanguageTags(out);
  out = stripTrailingHorizontalRules(out);
  return out;
}

function normalizeBody(body) {
  let out = body;
  out = stripBrokenGitbookLinks(out);
  out = stripGitbookNavLinks(out);
  out = stripGitbookHeadingAnchors(out);
  out = convertMarkTags(out);
  out = decodeInlineHtmlEntities(out);
  out = fixAutolinkUrls(out);
  out = convertFigureImages(out);
  out = convertDivImages(out);
  out = convertPreCodeBlocks(out);
  out = out.replace(/<Info>/g, '<Callout type="info">');
  out = out.replace(/<\/Info>/g, '</Callout>');
  out = out
    .split('\n')
    .filter((line) => stripCr(line).trim() !== '###')
    .join('\n');
  out = flattenArrowCallouts(out);
  out = tightenCalloutBlocks(out);
  out = out.replace(/\n{3,}/g, '\n\n').trim();
  out = normalizeAgentSafeMarkdown(out);
  return out;
}

module.exports = {
  normalizeBody,
  normalizeAgentSafeMarkdown,
  tightenCalloutBlocks,
  flattenArrowCallouts,
  extractPrerequisiteBullets,
  stripPrerequisiteCallouts,
  buildMergedPrerequisitesCallout,
};
