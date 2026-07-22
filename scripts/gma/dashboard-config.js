/**
 * Per-mediation dashboard configuration blocks (Part 2.7).
 */

const { getClassEntry, getRegistryEntry, NETWORK_KEY } = require('./class-registry');

const PLACEMENT_CALLOUT = `> The **placementName** value is case-sensitive and must exactly match the Placement Name configured in the TapMind Dashboard.`;

const PLACEMENT_PARAM_ADMOB = 'Parameter    : {"placementName": "provided by your account manager"}';
const PLACEMENT_PARAM_GAM = 'Parameter   : {"placementName": "provided by your account manager"}';
const PLACEMENT_PARAM_APPLOVIN = 'Custom Parameters  : {"placementName": "provided by your account manager"}';

function platformLabel(os, wrapper) {
  if (wrapper) return 'Android or iOS';
  return os === 'android' ? 'Android' : 'iOS';
}

function admobDashboard({ frameworkKey, os, wrapper }) {
  const registryEntry = getRegistryEntry(frameworkKey, 'admob');
  const platform = platformLabel(os, wrapper);
  const className = getClassEntry(frameworkKey, 'admob', os)?.className
    || `«CLASS:admob-${os || 'platform'}»`;

  let classBlock;
  if (wrapper && registryEntry?.android) {
    classBlock = `### Android

\`\`\`
Mapping name : provided by your account manager
eCPM         : provided by your account manager
Class        : ${registryEntry.android}
${PLACEMENT_PARAM_ADMOB}
\`\`\`

### iOS

\`\`\`
Mapping name : provided by your account manager
eCPM         : provided by your account manager
Class        : ${registryEntry.ios}
${PLACEMENT_PARAM_ADMOB}
\`\`\``;
  } else {
    classBlock = `\`\`\`
Mapping name : provided by your account manager
eCPM         : provided by your account manager
Class        : ${className}
${PLACEMENT_PARAM_ADMOB}
\`\`\``;
  }

  return `**Create the custom event (waterfall):** Mediation → Create mediation group → select **${platform}** and ad format → name it (provided by your account manager) → Add ad units → select your app and ad units.

**Add the ad source:** Waterfall source → Set up ad source → Custom event → select your app/platform → select the ad unit, then enter:

${classBlock}

${PLACEMENT_CALLOUT}

**Note:** Official Google documentation: [Create a custom event](https://support.google.com/admob/answer/13407144)`;
}

function applovinDashboard({ frameworkKey, os, wrapper }) {
  const registryEntry = getRegistryEntry(frameworkKey, 'applovin');
  const className = getClassEntry(frameworkKey, 'applovin', os)?.className
    || `«CLASS:applovin-${os || 'platform'}»`;

  let classBlock;
  if (wrapper && registryEntry?.android) {
    classBlock = `\`\`\`
Custom Network : TapMind Market Place
Android Class  : ${registryEntry.android}
iOS Class      : ${registryEntry.ios}
\`\`\``;
  } else if (os === 'android') {
    classBlock = `\`\`\`
Custom Network : TapMind Market Place
Android Class  : ${className}
\`\`\``;
  } else {
    classBlock = `\`\`\`
Custom Network : TapMind Market Place
iOS Class      : ${className}
\`\`\``;
  }

  return `**Create the custom network:** MAX → Mediation → Manage → Networks → **Add a Custom Network** → Network type SDK →

${classBlock}

**Add the yield partner:** MAX → Mediation → Manage → Ad Units → select your ad unit → enable TapMind → enter:

\`\`\`
App ID             : leave blank (optional)
Placement ID       : provided by your account manager
eCPM               : provided by your account manager
${PLACEMENT_PARAM_APPLOVIN}
\`\`\`

${PLACEMENT_CALLOUT}`;
}

function gamDashboard({ frameworkKey, os, wrapper }) {
  const registryEntry = getRegistryEntry(frameworkKey, 'google-ad-manager');
  const platform = platformLabel(os, wrapper);
  const className = getClassEntry(frameworkKey, 'google-ad-manager', os)?.className
    || `«CLASS:gam-${os || 'platform'}»`;

  let classBlock;
  if (wrapper && registryEntry?.android) {
    classBlock = `### Android

\`\`\`
Default CPM : provided by your account manager
Label       : provided by your account manager
Class Name  : ${registryEntry.android}
${PLACEMENT_PARAM_GAM}
\`\`\`

### iOS

\`\`\`
Default CPM : provided by your account manager
Label       : provided by your account manager
Class Name  : ${registryEntry.ios}
${PLACEMENT_PARAM_GAM}
\`\`\``;
  } else {
    classBlock = `\`\`\`
Default CPM : provided by your account manager
Label       : provided by your account manager
Class Name  : ${className}
${PLACEMENT_PARAM_GAM}
\`\`\``;
  }

  return `**Create the TapMind company:** Admin → Companies → New company → type Ad Network → name **TapMind** → Ad Network **Other Company** → toggle Mediation on → Save.

**Create/open a yield group:** Delivery → Yield groups → New yield group → name (from your account manager) → set ad format → inventory type **Mobile** → target your ad units.

**Add the yield partner:** Add yield partner → select TapMind → Integration type **Custom Event** → Status **Active** → platform **${platform}** →

${classBlock}

${PLACEMENT_CALLOUT}

**Note:** Official Google documentation: [Create a yield group](https://support.google.com/admanager/answer/7390828)`;
}

function levelplayDashboard() {
  return `**Create the TapMind network:** Monetize → Setup → SDK Networks → Available Networks → Manage Networks → select **Custom Adapter** → enter network key **${NETWORK_KEY}** → Enter → Save. The network appears as **TapMind**.

![](/images/ironsource-configuration.jpeg)

**Set up instances:** Setup → Instances → select TapMind Marketplace → Add ad instance → select ad type →

\`\`\`
Instance name : provided by your account manager
placementCODE : provided by your account manager
Mediation Group: Select your target mediation group
Rate : provided by your account manager
\`\`\`

**Note:** Enter the rate for each placement - it determines waterfall order. Add one instance per ad format to start.`;
}

const RENDERERS = {
  admob: admobDashboard,
  applovin: applovinDashboard,
  'google-ad-manager': gamDashboard,
  levelplay: levelplayDashboard,
};

function renderDashboard({ mediation, frameworkKey, os, wrapper }) {
  const fn = RENDERERS[mediation];
  if (!fn) return '';
  if (mediation === 'levelplay') return fn();
  return fn({ frameworkKey, os, wrapper });
}

function renderWrapperDashboard(androidFramework, iosFramework, mediation, mergeFn) {
  const androidBody = renderDashboard({
    mediation,
    frameworkKey: androidFramework,
    os: 'android',
    wrapper: 'wrapper',
  });
  const iosBody = renderDashboard({
    mediation,
    frameworkKey: iosFramework,
    os: 'ios',
    wrapper: 'wrapper',
  });
  const { body } = mergeFn(androidBody, iosBody, mediation);
  return body;
}

module.exports = { renderDashboard, renderWrapperDashboard };
