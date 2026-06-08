const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const summaryPath = path.join(rootDir, 'SUMMARY.md');
const lines = fs.readFileSync(summaryPath, 'utf8').split(/\r?\n/);

function toSlug(filePath) {
  return filePath.replace(/\.md$/i, '');
}

const entries = [];
let section = 'main';

for (const line of lines) {
  const h2 = line.match(/^##\s+(.+)/);
  if (h2) {
    section = h2[1].trim();
    continue;
  }

  const m = line.match(/^(\s*)\*\s+\[([^\]]+)\]\(([^)]+)\)/);
  if (!m) continue;

  const depth = m[1].length / 2;
  entries.push({
    depth,
    title: m[2],
    path: m[3],
    section,
    slug: toSlug(m[3]),
  });
}

const engines = [];
let currentEngine = null;
let currentNetwork = null;

for (const entry of entries) {
  if (entry.depth === 1) {
    currentEngine = { title: entry.title, slug: entry.slug, networks: [] };
    engines.push(currentEngine);
    currentNetwork = null;
  } else if (entry.depth === 2 && currentEngine) {
    currentNetwork = { title: entry.title, pages: [{ title: entry.title, slug: entry.slug }] };
    currentEngine.networks.push(currentNetwork);
  } else if (entry.depth === 3 && currentNetwork) {
    currentNetwork.pages.push({ title: entry.title, slug: entry.slug });
  }
}

const root = entries.find((e) => e.depth === 0);
const gradle = entries.filter((e) => e.section === 'GRADLE SETUP');

function networkPages(network) {
  return network.pages.map((page) => {
    if (page.title === 'Installation' || page.title === 'Configuration') {
      return page.slug;
    }
    return { page: page.slug, title: page.title };
  });
}

function engineTab(engine) {
  return {
    tab: engine.title,
    icon: 'mobile-screen',
    groups: [
      { group: 'Overview', pages: [engine.slug] },
      ...engine.networks.map((network) => ({
        group: network.title,
        pages: networkPages(network),
      })),
    ],
  };
}

const legacyStarter = {
  tab: 'Legacy Starter Pages',
  icon: 'box-archive',
  groups: [
    {
      group: 'Get Started',
      pages: ['introduction', 'quickstart'],
    },
    {
      group: 'Writing Content',
      pages: ['writing/pages', 'writing/components', 'writing/code-blocks'],
    },
    {
      group: 'API Pages',
      pages: [
        { page: 'api-reference/openapi-example', title: 'OpenAPI Example' },
        'api-reference/request-response-examples',
      ],
    },
    {
      group: 'Built-In Components',
      pages: [
        'components/cards',
        'components/callouts',
        'components/tabs-and-accordions',
        'components/steps',
      ],
    },
  ],
};

const docs = {
  $schema: 'https://jamdesk.com/docs.json',
  name: 'TapMind Custom Adapter SDK Integration',
  description:
    'Integration guide for TapMind Custom Adapter SDK across mobile platforms and game engines.',
  theme: 'jam',
  colors: {
    primary: '#635BFF',
    light: '#7C75FF',
    dark: '#4F46E5',
  },
  api: {
    openapi: ['/openapi/example-api.yaml'],
    examples: {
      languages: [
        'curl',
        'python',
        'javascript',
        'go',
        'ruby',
        'csharp',
        'java',
        'rust',
        'php',
      ],
    },
  },
  navbar: {
    primary: {
      type: 'button',
      label: 'Get Started',
      href: '/README',
    },
  },
  navigation: {
    tabs: [
      {
        tab: 'Overview',
        icon: 'book-open',
        groups: [{ group: 'Getting Started', pages: [root.slug] }],
      },
      ...engines.map(engineTab),
      {
        tab: 'Gradle Setup',
        icon: 'wrench',
        groups: [{ group: 'Gradle Setup', pages: gradle.map((g) => g.slug) }],
      },
      legacyStarter,
    ],
  },
};

fs.writeFileSync(path.join(rootDir, 'docs.json'), `${JSON.stringify(docs, null, 2)}\n`);

let mapping = '# Navigation Mapping\n\n';
mapping += 'GitBook path → JamDesk slug mapping generated from `SUMMARY.md`.\n\n';
mapping += '| GitBook Title | GitBook Path | JamDesk Slug | SUMMARY Depth | Section |\n';
mapping += '|---|---|---|---|---|\n';

for (const entry of entries) {
  mapping += `| ${entry.title} | \`${entry.path}\` | \`${entry.slug}\` | ${entry.depth} | ${entry.section} |\n`;
}

mapping += '\n## Legacy Starter Pages (JamDesk only)\n\n';
mapping += '| Page | JamDesk Slug |\n|---|---|\n';

const legacyPages = [
  ['Introduction', 'introduction'],
  ['Quickstart', 'quickstart'],
  ['Writing / Pages', 'writing/pages'],
  ['Writing / Components', 'writing/components'],
  ['Writing / Code Blocks', 'writing/code-blocks'],
  ['OpenAPI Example', 'api-reference/openapi-example'],
  ['Request Response Examples', 'api-reference/request-response-examples'],
  ['Components / Cards', 'components/cards'],
  ['Components / Callouts', 'components/callouts'],
  ['Components / Tabs and Accordions', 'components/tabs-and-accordions'],
  ['Components / Steps', 'components/steps'],
];

for (const [title, slug] of legacyPages) {
  mapping += `| ${title} | \`${slug}\` |\n`;
}

fs.writeFileSync(path.join(rootDir, 'navigation-mapping.md'), mapping);

console.log(`Parsed ${entries.length} SUMMARY entries`);
console.log(`Engines: ${engines.length}`);
console.log(`Gradle pages: ${gradle.length}`);
