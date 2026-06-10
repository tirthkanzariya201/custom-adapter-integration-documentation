const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const docsPath = path.join(rootDir, 'docs.json');
const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));

const PLATFORM_TABS = [
  { tab: 'Native-Android Engine', icon: 'mobile-screen', key: 'native-android-engine', title: 'Native Android' },
  { tab: 'Native-iOS Engine', icon: 'mobile-screen', key: 'native-ios-engine', title: 'Native iOS' },
  { tab: 'Unity-Android Engine', icon: 'mobile-screen', key: 'unity-android-engine', title: 'Unity Android' },
  { tab: 'Unity-iOS Engine', icon: 'mobile-screen', key: 'unity-ios-engine', title: 'Unity iOS' },
  { tab: 'Flutter-Android Engine', icon: 'mobile-screen', key: 'flutter-android-engine', title: 'Flutter Android' },
  { tab: 'Flutter-iOS Engine', icon: 'mobile-screen', key: 'flutter-ios-engine', title: 'Flutter iOS' },
  { tab: 'Cocos-Android Engine', icon: 'mobile-screen', key: 'cocos-android-engine', title: 'Cocos Android' },
  { tab: 'Cocos-iOS Engine', icon: 'mobile-screen', key: 'cocos-ios-engine', title: 'Cocos iOS' },
];

function extractNavPages(nav) {
  const pages = [];
  function walk(c) {
    if (!c || typeof c !== 'object') return;
    if (c.page) pages.push(c.page);
    for (const key of ['pages', 'groups', 'tabs']) {
      if (!Array.isArray(c[key])) continue;
      for (const item of c[key]) {
        if (typeof item === 'string') pages.push(item);
        else walk(item);
      }
    }
  }
  walk(nav);
  return pages;
}

const oldPages = extractNavPages(docs.navigation);

docs.navigation = {
  tabs: [
    {
      tab: 'Overview',
      icon: 'book-open',
      groups: [{ group: 'Getting Started', pages: ['README'] }],
    },
    ...PLATFORM_TABS.map((p) => ({
      tab: p.tab,
      icon: p.icon,
      groups: [
        {
          group: 'Documentation',
          pages: [
            {
              page: `tapmind-custom-adapter-sdk-integration/${p.key}/integration-guide`,
              title: p.title,
            },
          ],
        },
      ],
    })),
    {
      tab: 'Gradle Setup',
      icon: 'wrench',
      groups: [{ group: 'Gradle Setup', pages: ['gradle-setup/for-gradle-version-7+'] }],
    },
  ],
};

const newPages = extractNavPages(docs.navigation);
const removed = oldPages.filter((p) => !newPages.includes(p));

fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  path.join(__dirname, 'navigation-diff.json'),
  JSON.stringify({ oldCount: oldPages.length, newCount: newPages.length, removed, newPages }, null, 2)
);

console.log(`Navigation updated: ${oldPages.length} → ${newPages.length} pages`);
console.log(`Removed from sidebar: ${removed.length}`);
