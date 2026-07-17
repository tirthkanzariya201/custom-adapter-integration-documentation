/**
 * Converts MDX component markup into plain markdown for agent-readable pages.
 * Jamdesk markdown exports do not resolve imports or render Tabs/Callouts.
 */

const fs = require('fs');
const path = require('path');

const SNIPPETS_DIRS = [
  path.resolve(__dirname, '../../snippets/shared'),
  path.resolve(__dirname, '../../snippets'),
];

const CALLOUT_LABELS = {
  warning: '**Warning:**',
  info: '**Note:**',
  error: '**Error:**',
};

function unwrapCallouts(text) {
  return text.replace(
    /<Callout\s+type="([^"]+)">\s*([\s\S]*?)\s*<\/Callout>/g,
    (_, type, inner) => {
      const label = CALLOUT_LABELS[type] || '**Note:**';
      const body = inner.trim().replace(/\n{3,}/g, '\n\n');
      return `${label}\n\n${body}\n`;
    },
  );
}

function unwrapTabs(text) {
  let result = text;
  const tabBlock = /<Tabs>\s*([\s\S]*?)\s*<\/Tabs>/g;
  result = result.replace(tabBlock, (_, inner) => {
    const tabs = [...inner.matchAll(/<Tab\s+title="([^"]+)">\s*([\s\S]*?)\s*<\/Tab>/g)];
    if (!tabs.length) return inner.trim();
    return tabs
      .map(([, title, content]) => `### ${title}\n\n${content.trim()}`)
      .join('\n\n');
  });
  return result;
}

function flattenMdx(text) {
  if (!text) return '';
  let out = text;
  out = unwrapTabs(out);
  out = unwrapCallouts(out);
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

/** 4-space indented code block (no ``` fences - safe for XML/HTML-like samples). */
function toIndentedCodeBlock(content) {
  return content
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : `    ${line}`))
    .join('\n');
}

/** @deprecated Use normalizeAgentSafeMarkdown from mdx-content-normalize.js */
function prepareForAgentMarkdown(text) {
  const { normalizeAgentSafeMarkdown } = require('../mdx-content-normalize');
  return normalizeAgentSafeMarkdown(text || '');
}

function loadSnippet(slug) {
  for (const dir of SNIPPETS_DIRS) {
    const file = path.join(dir, `gma-${slug}.mdx`);
    if (fs.existsSync(file)) {
      return flattenMdx(fs.readFileSync(file, 'utf8'));
    }
  }
  throw new Error(`Snippet not found: gma-${slug}.mdx`);
}

module.exports = {
  flattenMdx,
  loadSnippet,
  unwrapCallouts,
  unwrapTabs,
  prepareForAgentMarkdown,
  toIndentedCodeBlock,
};
