/**
 * Assembles Custom Adapter GMA mediation pages from Part 2 building blocks (6-step recipe).
 */

const { resolveFrameworkKey } = require('./class-registry');
const {
  getInstallBlock,
  needsGradleSnippet,
  needsAppIdAndroid,
  needsAppIdIos,
} = require('./install-blocks');
const { renderDashboard, renderWrapperDashboard } = require('./dashboard-config');
const { loadSnippet, flattenMdx } = require('./markdown-parity');
const { normalizeAgentSafeMarkdown } = require('../mdx-content-normalize');

const { MEDIATION_DISPLAY_TITLES } = require('./doc-constants');

const MEDIATION_TITLES = MEDIATION_DISPLAY_TITLES;

const PREREQ_SNIPPET = {
  'native-android': 'prerequisites-native-android',
  'native-ios': 'prerequisites-native-ios',
  'next-gen-android': 'prerequisites-next-gen-android',
  flutter: 'prerequisites-flutter',
  'react-native': 'prerequisites-react-native',
  unity: 'prerequisites-unity',
  cocos: 'prerequisites-cocos',
};

function extractTestingInstructions(configBody) {
  if (!configBody) return '';
  const match = configBody.match(/#{2,4}\s+\*?\*?Testing instructions\*?\*?[\s\S]*$/i);
  if (!match) return '';
  let block = match[0].trim();
  block = block.replace(/\n---+\s*$/g, '').trim();
  block = block.replace(
    /^#{2,4}\s+\*?\*?Testing instructions\*?\*?[^\n]*/i,
    '### Testing instructions',
  );
  return block;
}

const STEP_ROLES = {
  prerequisites: 'Developer',
  install: 'Developer',
  configureApp: 'Developer',
  configureMediation: 'Ad ops',
  verify: 'Developer',
  troubleshoot: 'Developer',
};

function sectionHeading(title, role) {
  return `## ${title}\n\n*Performed by: ${role}*`;
}

function buildPrerequisitesSection(ctx) {
  const slug = PREREQ_SNIPPET[ctx.frameworkKey];
  return `${sectionHeading('Prerequisites', STEP_ROLES.prerequisites)}\n\n${loadSnippet(slug)}`;
}

function buildInstallSection(ctx) {
  const parts = [sectionHeading('Install the SDK', STEP_ROLES.install), ''];

  if (needsGradleSnippet(ctx)) {
    parts.push(loadSnippet('gradle-repositories-android'), '');
  }

  if (ctx.mode === 'wrapper' && (ctx.wrapper === 'flutter' || ctx.wrapper === 'react-native')) {
    const android = getInstallBlock({ ...ctx, os: 'android' });
    const ios = getInstallBlock({ ...ctx, os: 'ios' });
    if (android) parts.push('### Android', '', android, '');
    if (ios) parts.push('### iOS', '', ios, '');
  } else if (ctx.mode === 'wrapper' && ctx.wrapper === 'cocos') {
    parts.push(getInstallBlock(ctx));
  } else {
    parts.push(getInstallBlock(ctx));
  }

  return parts.join('\n').trim();
}

function buildConfigureAppSection(ctx) {
  const blocks = [];
  if (needsAppIdAndroid(ctx)) blocks.push(loadSnippet('app-id-android'));
  if (needsAppIdIos(ctx)) blocks.push(loadSnippet('app-id-ios'));
  if (!blocks.length) return '';
  return `${sectionHeading('Configure your app', STEP_ROLES.configureApp)}\n\n${blocks.join('\n\n')}`;
}

function buildConfigureMediationSection(ctx, dashboardBody) {
  const title = MEDIATION_TITLES[ctx.mediation] || ctx.mediation;
  return `${sectionHeading(`Configure ${title}`, STEP_ROLES.configureMediation)}\n\n${flattenMdx(dashboardBody)}`;
}

function buildVerifySection() {
  return `${sectionHeading('Verify integration', STEP_ROLES.verify)}\n\n${loadSnippet('verify-integration')}`;
}

function buildTroubleshootSection() {
  return `${sectionHeading('Troubleshooting', STEP_ROLES.troubleshoot)}\n\n${loadSnippet('troubleshoot')}`;
}

function assembleNativeOsPage({ os, mediation, gitbookConfig }) {
  const mode = 'native-os';
  const frameworkKey = resolveFrameworkKey(mode, os);
  const ctx = { mode, os, mediation, frameworkKey };
  const dashboard = renderDashboard({ mediation, frameworkKey, os });

  const body = [
      buildPrerequisitesSection(ctx),
      buildInstallSection(ctx),
      buildConfigureAppSection(ctx),
      buildConfigureMediationSection(ctx, dashboard),
      buildVerifySection(),
      buildTroubleshootSection(),
    ]
      .filter(Boolean)
      .join('\n\n');

  return { imports: [], body: normalizeAgentSafeMarkdown(body) };
}

function assembleWrapperPage({ wrapper, mediation, gitbookConfig, mergeWrapperConfiguration }) {
  const frameworkKey = wrapper;
  const ctx = { mode: 'wrapper', wrapper, mediation, frameworkKey };
  const dashboard = renderWrapperDashboard(
    frameworkKey,
    frameworkKey,
    mediation,
    mergeWrapperConfiguration,
  );

  const body = [
      buildPrerequisitesSection(ctx),
      buildInstallSection(ctx),
      buildConfigureAppSection(ctx),
      buildConfigureMediationSection(ctx, dashboard),
      buildVerifySection(),
      buildTroubleshootSection(),
    ]
      .filter(Boolean)
      .join('\n\n');

  return { imports: [], body: normalizeAgentSafeMarkdown(body) };
}

function assembleNextGenPage({ mediation }) {
  const frameworkKey = 'next-gen-android';
  const ctx = {
    mode: 'native-os',
    os: 'android',
    mediation,
    frameworkKey,
    product: 'next-gen',
  };
  const dashboard = renderDashboard({ mediation, frameworkKey, os: 'android' });

  const body = [
      buildPrerequisitesSection(ctx),
      buildInstallSection(ctx),
      buildConfigureAppSection(ctx),
      buildConfigureMediationSection(ctx, dashboard),
      buildVerifySection(),
      buildTroubleshootSection(),
    ]
      .filter(Boolean)
      .join('\n\n');

  return { imports: [], body: normalizeAgentSafeMarkdown(body) };
}

module.exports = { assembleNativeOsPage, assembleWrapperPage, assembleNextGenPage };
