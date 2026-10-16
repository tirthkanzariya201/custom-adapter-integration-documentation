/**
 * Enable Search + Ask AI in local `jamdesk dev`.
 * Jamdesk CLI disables both by default (no search-data.json, DevOnlyNotice gates).
 * Run before `jamdesk dev`. Safe to re-run (idempotent).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', 'jamdesk');
const vendored = path.join(root, 'vendored');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
  console.log('patched', path.relative(root, file));
}

function replaceOnce(file, find, replace) {
  const full = path.isAbsolute(file) ? file : path.join(root, file);
  if (!fs.existsSync(full)) {
    console.warn('skip missing', full);
    return;
  }
  let src = read(full);
  if (src.includes(find) === false && src.includes(replace)) {
    console.log('already patched', path.relative(root, full));
    return;
  }
  if (!src.includes(find)) {
    // Prefer replace-target check: prior partial patches may already contain MARK elsewhere
    if (replace.includes('tapmind-local-ai') && src.includes(replace.trim())) {
      console.log('already patched', path.relative(root, full));
      return;
    }
    console.warn('pattern not found in', path.relative(root, full));
    return;
  }
  write(full, src.replace(find, replace));
}

// Mark so re-runs are no-ops when already applied
const MARK = '/* tapmind-local-ai */';

// 1) Allow Search modal open in local dev
replaceOnce(
  path.join(vendored, 'hooks', 'useSearchOpenHandler.tsx'),
  `  const isDevMode = process.env.NODE_ENV !== 'production';

  const onSearchOpen = useCallback(() => {
    if (isDevMode) {
      showNotice(DEV_FEATURE.SEARCH);
      return;
    }
    setIsSearchOpen(true);
  }, [isDevMode, showNotice, setIsSearchOpen]);`,
  `  const isDevMode = false; ${MARK}

  const onSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, [setIsSearchOpen]);`,
);

// 2) Allow Ask AI panel + shortcuts in local dev
replaceOnce(
  path.join(vendored, 'hooks', 'useChatPanel.tsx'),
  `  const isDevMode = process.env.NODE_ENV !== 'production';
  useEffect(() => {
    if (!chatEnabled || isDevMode) return;`,
  `  const isDevMode = false; ${MARK}
  useEffect(() => {
    if (!chatEnabled || isDevMode) return;`,
);

replaceOnce(
  path.join(vendored, 'hooks', 'useChatPanel.tsx'),
  `  const isDevMode = process.env.NODE_ENV !== 'production';

  // Stable identity prevents Header/Sidebar keydown effects from
  // re-binding their listener on every render.
  const openChat = useCallback(() => {
    if (isDevMode) { showNotice(DEV_FEATURE.AI_CHAT); return; }
    setIsChatOpen(true);
  }, [isDevMode, showNotice, setIsChatOpen]);`,
  `  const isDevMode = false; ${MARK}

  // Stable identity prevents Header/Sidebar keydown effects from
  // re-binding their listener on every render.
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, [setIsChatOpen]);`,
);

// 3) Mount SearchModal in local chrome
for (const rel of [
  path.join('components', 'navigation', 'Header.tsx'),
  path.join('components', 'navigation', 'Sidebar.tsx'),
  path.join('components', 'errors', 'NotFoundContent.tsx'),
]) {
  const full = path.join(vendored, rel);
  if (!fs.existsSync(full)) continue;
  let src = read(full);
  if (src.includes(MARK)) {
    console.log('already patched', path.relative(root, full));
    continue;
  }
  if (!src.includes('{!isDevMode && (')) {
    console.warn('SearchModal gate not found in', rel);
    continue;
  }
  write(full, src.replace('{!isDevMode && (', `{true && ( ${MARK}`));
}

// 4) Local Ask AI → same-origin proxy → production chat
replaceOnce(
  path.join(vendored, 'components', 'layout', 'LayoutWrapper.tsx'),
  `  // In local dev (no ISR_MODE), middleware doesn't rewrite /_chat, so use the direct API path
  const chatEndpoint = process.env.NEXT_PUBLIC_PROJECT_SLUG
    ? \`/api/chat/\${process.env.NEXT_PUBLIC_PROJECT_SLUG}\`
    : \`\${linkPrefix}/_chat\`;`,
  `  // Local CLI: proxy Ask AI through /api/local-chat (avoids CORS to production).
  const chatEndpoint = process.env.NODE_ENV !== 'production'
    ? '/api/local-chat'
    : process.env.NEXT_PUBLIC_PROJECT_SLUG
      ? \`/api/chat/\${process.env.NEXT_PUBLIC_PROJECT_SLUG}\`
      : \`\${linkPrefix}/_chat\`; ${MARK}`,
);

// 5) Proxy route (synced into jamdesk workspace on next `jamdesk dev`)
const proxyDir = path.join(vendored, 'app', 'api', 'local-chat');
const proxyFile = path.join(proxyDir, 'route.ts');
fs.mkdirSync(proxyDir, { recursive: true });
if (!fs.existsSync(proxyFile) || !read(proxyFile).includes(MARK)) {
  write(
    proxyFile,
    `${MARK}
import { NextRequest } from 'next/server';

const PROD_CHAT = process.env.TAPMIND_PROD_CHAT_URL
  || 'https://custom-adapter-integration.jamdesk.app/_chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.text();
  const upstream = await fetch(PROD_CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
`,
  );
}

// 6) Build search-data.json during local jamdesk startup
const devJs = path.join(root, 'dist', 'commands', 'dev.js');
if (fs.existsSync(devJs)) {
  let src = read(devJs);
  if (!src.includes(MARK)) {
    const find =
      "const result = await runBuildScripts(['enhance-navigation.cjs', 'compile-snippets.cjs'], scriptOpts);";
    const replace =
      `const result = await runBuildScripts(['enhance-navigation.cjs', 'compile-snippets.cjs', 'build-search-index.cjs'], scriptOpts); ${MARK}`;
    if (src.includes(find)) {
      write(devJs, src.replace(find, replace));
    } else {
      console.warn('dev.js build-scripts pattern not found — search index may need a manual build');
    }
  } else {
    console.log('already patched', path.relative(root, devJs));
  }
}

// 7) Apply docs.json redirects in local jamdesk dev
const nextConfigPath = path.join(vendored, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  let src = read(nextConfigPath);
  if (!src.includes('function docsRedirects')) {
    const find = '/** @type {import(\'next\').NextConfig} */\nconst nextConfig = {';
    const replace = `import fs from 'node:fs';
import path from 'node:path';

function docsRedirects() {
  try {
    const docsPath = path.join(process.cwd(), 'public', 'docs.json');
    const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));
    const seen = new Set();
    const rules = [];
    for (const rule of docs.redirects || []) {
      if (!rule || typeof rule.source !== 'string' || typeof rule.destination !== 'string') continue;
      let source = rule.source.startsWith('/') ? rule.source : \`/\${rule.source}\`;
      let destination = rule.destination.startsWith('/') ? rule.destination : \`/\${rule.destination}\`;
      destination = destination.split('#')[0];
      if (!destination || destination === source) continue;
      if (source.endsWith('/*')) source = \`\${source.slice(0, -2)}/:path*\`;
      else if (source.endsWith('*')) source = \`\${source.slice(0, -1)}:path*\`;
      if (destination.endsWith('/*')) destination = \`\${destination.slice(0, -2)}/:path*\`;
      else if (destination.endsWith('*')) destination = \`\${destination.slice(0, -1)}:path*\`;
      if (/[+()?]/.test(source) || /[+()?]/.test(destination)) continue;
      if (seen.has(source)) continue;
      seen.add(source);
      rules.push({ source, destination, permanent: rule.permanent !== false });
    }
    return rules;
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return docsRedirects();
  },`;
    if (src.includes(find)) write(nextConfigPath, src.replace(find, replace));
    else console.warn('next.config.js pattern not found — local redirects not patched');
  } else {
    console.log('already patched', path.relative(root, nextConfigPath));
  }
}

console.log('Local Search + Ask AI patches applied.');
