/**
 * Updates docs.json with new tab titles, nav paths, and slug redirects.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const docsPath = path.join(rootDir, 'docs.json');
const slugRedirectsPath = path.join(__dirname, 'slug-redirects.json');

const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));
const slugRedirects = JSON.parse(
  fs.readFileSync(slugRedirectsPath, 'utf8').replace(/^\uFEFF/, ''),
);

docs.description =
  'Integration guides for TapMind Custom Adapter (GMA SDK), Custom Adapter (Next-Gen SDK), and Orchestration SDKs.';

const staticRedirects = [
  { source: '/', destination: '/getting-started/introduction', permanent: false },
  { source: '/README', destination: '/getting-started/introduction', permanent: true },
  { source: '/overview', destination: '/getting-started/introduction', permanent: false },
  {
    source: '/gradle-setup/for-gradle-version-7+',
    destination: '/gradle-setup/for-gradle-version-7-plus',
    permanent: true,
  },
  {
    source: '/guides/android/orchestration-sdk',
    destination: '/guides/android/orchestration-sdk/overview',
    permanent: false,
  },
];

docs.redirects = [...staticRedirects, ...slugRedirects];

function updateNavPages(pages) {
  if (!pages) return pages;
  return pages.map((entry) => {
    if (entry.page) {
      let page = entry.page;
      page = page.replace(/\/custom-adapter\//g, '/custom-adapter-gma-sdk/');
      page = page.replace(/\/custom-adapter$/g, '/custom-adapter-gma-sdk/admob');
      page = page.replace(/\/next-gen\//g, '/custom-adapter-next-gen-sdk/');
      page = page.replace(/\/next-gen$/g, '/custom-adapter-next-gen-sdk/admob');
      return { ...entry, page };
    }
    if (entry.pages) {
      return { ...entry, pages: updateNavPages(entry.pages) };
    }
    return entry;
  });
}

for (const tab of docs.navigation.tabs) {
  if (tab.tab === 'Custom Adapter GMA SDK') {
    tab.tab = 'Custom Adapter (GMA SDK)';
  }
  if (tab.tab === 'Custom Adapter Next-Gen SDK') {
    tab.tab = 'Custom Adapter (Next-Gen SDK)';
  }
  if (tab.groups) {
    tab.groups = tab.groups.map((group) => ({
      ...group,
      pages: updateNavPages(group.pages),
    }));
  }
  if (tab.pages) {
    tab.pages = updateNavPages(tab.pages);
  }
}

fs.writeFileSync(docsPath, `${JSON.stringify(docs, null, 2)}\n`, 'utf8');
console.log('Updated docs.json');
