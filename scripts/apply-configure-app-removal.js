const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const skan = `---
title: SKAdNetwork IDs
description: The SKAdNetworkItems array required in Info.plist for iOS attribution across TapMind integrations.
---

> **For AI agents:** the complete documentation index is at [llms.txt](/llms.txt). Append \`.md\` to any page URL for its markdown version.

Add the \`SKAdNetworkItems\` array below to your app's \`Info.plist\`. These identifiers let the ad networks serving through TapMind receive Apple's install-attribution (SKAdNetwork) postbacks. This page is the single source of truth for the list - each iOS integration page links here so it never drifts between pages.

If your app already serves Google demand, most of these IDs are likely already present. Add any you are missing - a publisher not already running Google-sourced demand may not have the full list.

Keep this list complete and current against the list [published by Google](https://developers.google.com/admob/ios/3p-skadnetworks).

\`\`\`
<key>SKAdNetworkItems</key>
<array>
  <dict><key>SKAdNetworkIdentifier</key><string>cstr6suwn9.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>4fzdc2evr5.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>2fnua5tdw4.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>ydx93a7ass.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>p78axxw29g.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>v72qych5uu.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>ludvb6z3bs.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>cp8zw746q7.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>3sh42y64q3.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>c6k4g5qg8m.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>s39g8k73mm.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>wg4vff78zm.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>3qy4746246.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>f38h382jlk.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>hs6bdukanm.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>mlmmfzh3r3.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>v4nxqhlyqp.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>wzmmz9fp6w.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>su67r6k2v3.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>yclnxrl5pm.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>t38b2kh725.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>7ug5zh24hu.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>gta9lk7p23.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>vutu7akeur.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>y5ghdn5j9k.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>v9wttpbfk9.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>n38lu8286q.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>47vhws6wlr.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>kbd757ywx3.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>9t245vhmpl.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>a2p9lx4jpn.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>22mmun2rn5.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>44jx6755aq.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>k674qkevps.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>4468km3ulz.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>2u9pt9hc89.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>8s468mfl3y.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>klf5c3l5u5.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>ppxm28t8ap.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>kbmxgpxpgc.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>uw77j35x4d.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>578prtvx9j.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>4dzt52r2t5.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>tl55sbb4fm.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>c3frkrj4fj.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>e5fvkxwrpn.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>8c4e2ghe7u.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>3rd42ekr43.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>97r2b46745.skadnetwork</string></dict>
  <dict><key>SKAdNetworkIdentifier</key><string>3qcr597p9d.skadnetwork</string></dict>
</array>
\`\`\`
`;

fs.writeFileSync(path.join(root, 'reference/skadnetwork-ids.mdx'), skan);
console.log('A: created reference/skadnetwork-ids.mdx');

const androidPages = [
  'guides/android/custom-adapter-gma-sdk/admob.mdx',
  'guides/android/custom-adapter-gma-sdk/google-ad-manager.mdx',
  'guides/android/custom-adapter-gma-sdk/applovin.mdx',
  'guides/android/custom-adapter-gma-sdk/levelplay.mdx',
];

const androidPrereqOld = `* minSdkVersion of **23** or higher
* compileSdkVersion of 36 or higher
* The Google Mobile Ads (GMA) SDK must be integrated in your app
* An ad unit must already be in place which will be used for targeting`;

const androidPrereqNew = `* See the [Compatibility Matrix](/reference/compatibility-matrix) for the minimum Android and compile SDK versions for this package.
* The Google Mobile Ads (GMA) SDK integrated in your app, with its app-ID meta-data (\`com.google.android.gms.ads.APPLICATION_ID\`) set in \`AndroidManifest.xml\`. Any app already serving Google ads has this set - if it's missing, the app crashes on launch (see [App crashes on launch](/reference/troubleshooting#app-crashes-on-launch)).
* An ad unit must already be in place which will be used for targeting`;

const androidConfigureRe =
  /\n## Configure your app\n\n\*Performed by: Developer\*\n\nAdd your AdMob app ID to `AndroidManifest\.xml`\. Omitting this crashes the app on launch with `Missing application ID`\.[\s\S]*?While testing, you may use Google's sample app ID shown above\.\n/;

for (const p of androidPages) {
  let t = fs.readFileSync(path.join(root, p), 'utf8');
  if (!t.includes(androidPrereqOld)) throw new Error('Android prereq not found: ' + p);
  t = t.replace(androidPrereqOld, androidPrereqNew);
  if (!androidConfigureRe.test(t)) throw new Error('Android configure not found: ' + p);
  t = t.replace(androidConfigureRe, '\n');
  fs.writeFileSync(path.join(root, p), t);
  console.log('B:', p);
}

const iosPages = [
  'guides/ios/custom-adapter-gma-sdk/admob.mdx',
  'guides/ios/custom-adapter-gma-sdk/google-ad-manager.mdx',
  'guides/ios/custom-adapter-gma-sdk/applovin.mdx',
  'guides/ios/custom-adapter-gma-sdk/levelplay.mdx',
];

const iosPrereqOld = `* iOS **12.0** or higher
* The Google Mobile Ads (GMA) SDK must be integrated in your app
* An ad unit must already be in place which will be used for targeting`;

const iosPrereqNew = `* See the [Compatibility Matrix](/reference/compatibility-matrix) for the minimum iOS version for this package.
* The Google Mobile Ads (GMA) SDK integrated in your app, with \`GADApplicationIdentifier\` set in \`Info.plist\`. Any app already serving Google ads has this set - if it's missing, the app crashes on launch (see [App crashes on launch](/reference/troubleshooting#app-crashes-on-launch)).
* Your \`Info.plist\` includes the \`SKAdNetworkItems\` array for attribution - see [SKAdNetwork IDs](/reference/skadnetwork-ids). Add any IDs you don't already have; a publisher not already running Google demand may be missing them.
* An ad unit must already be in place which will be used for targeting`;

const iosConfigureRe =
  /\n## Configure your app\n\n\*Performed by: Developer\*\n\nAdd `GADApplicationIdentifier` to your app's `Info\.plist`, plus the `SKAdNetworkItems` array for attribution\.[\s\S]*?Include the complete `SKAdNetworkItems` list as \[published by Google\]\(https:\/\/developers\.google\.com\/admob\/ios\/3p-skadnetworks\) - keep this snippet as your single source of truth so it never drifts between pages\.\n/;

for (const p of iosPages) {
  let t = fs.readFileSync(path.join(root, p), 'utf8');
  if (!t.includes(iosPrereqOld)) throw new Error('iOS prereq not found: ' + p);
  t = t.replace(iosPrereqOld, iosPrereqNew);
  if (!iosConfigureRe.test(t)) throw new Error('iOS configure not found: ' + p);
  t = t.replace(iosConfigureRe, '\n');
  fs.writeFileSync(path.join(root, p), t);
  console.log('C:', p);
}

const nonLp = [
  'guides/android/custom-adapter-gma-sdk/admob.mdx',
  'guides/android/custom-adapter-gma-sdk/google-ad-manager.mdx',
  'guides/android/custom-adapter-gma-sdk/applovin.mdx',
  'guides/ios/custom-adapter-gma-sdk/admob.mdx',
  'guides/ios/custom-adapter-gma-sdk/google-ad-manager.mdx',
  'guides/ios/custom-adapter-gma-sdk/applovin.mdx',
];
const lp = [
  'guides/android/custom-adapter-gma-sdk/levelplay.mdx',
  'guides/ios/custom-adapter-gma-sdk/levelplay.mdx',
];
const bleedOld =
  'Before diving into logs, confirm adapter class names and the LevelPlay network key against the [Class & Network Key Registry](/reference/class-network-key-registry), and `placementName` and eCPM/rate with your account manager.';
const bleedNonLp =
  'Before diving into logs, confirm adapter class names against the [Class & Network Key Registry](/reference/class-network-key-registry), and `placementName` and eCPM/rate with your account manager.';
const bleedLp =
  'Before diving into logs, confirm the LevelPlay network key against the [Class & Network Key Registry](/reference/class-network-key-registry), and `placementName` and eCPM/rate with your account manager.';

for (const p of nonLp) {
  let t = fs.readFileSync(path.join(root, p), 'utf8');
  if (!t.includes(bleedOld)) throw new Error('Bleed line not found: ' + p);
  t = t.replace(bleedOld, bleedNonLp);
  fs.writeFileSync(path.join(root, p), t);
  console.log('D non-LP:', p);
}
for (const p of lp) {
  let t = fs.readFileSync(path.join(root, p), 'utf8');
  if (!t.includes(bleedOld)) throw new Error('Bleed line not found LP: ' + p);
  t = t.replace(bleedOld, bleedLp);
  fs.writeFileSync(path.join(root, p), t);
  console.log('D LP:', p);
}

let ts = fs.readFileSync(path.join(root, 'reference/troubleshooting.mdx'), 'utf8');
const e1old =
  '| App crashes on launch | Missing AdMob / Ad Manager app ID in the manifest (Android) or Info.plist (iOS) | Add your app ID exactly as shown on your integration page - see [App crashes on launch](#app-crashes-on-launch) |';
const e1new =
  '| App crashes on launch | Missing AdMob / Ad Manager app ID in the manifest (Android) or Info.plist (iOS) | Add your app ID to native config - see [App crashes on launch](#app-crashes-on-launch) |';
const e2old = "Use the exact snippet shown on your platform's integration page.";
const e2new = 'Use the exact snippet for your platform shown above.';
if (!ts.includes(e1old)) throw new Error('E1 not found');
if (!ts.includes(e2old)) throw new Error('E2 not found');
ts = ts.replace(e1old, e1new).replace(e2old, e2new);
fs.writeFileSync(path.join(root, 'reference/troubleshooting.mdx'), ts);
console.log('E: troubleshooting');

let pr = fs.readFileSync(path.join(root, 'getting-started/prerequisites.mdx'), 'utf8');
const fOld =
  "- The Google Mobile Ads (GMA) SDK integrated in your app (TapMind's adapters run on top of it).";
const fNew =
  "- The Google Mobile Ads (GMA) SDK integrated in your app, with its app-ID key set - `com.google.android.gms.ads.APPLICATION_ID` in `AndroidManifest.xml` (Android) or `GADApplicationIdentifier` in `Info.plist` (iOS). TapMind's adapters run on top of the GMA SDK, which crashes on launch without it. Any app already serving Google ads has this set - see [Troubleshooting](/reference/troubleshooting#app-crashes-on-launch) if the app crashes on init.";
if (!pr.includes(fOld)) throw new Error('F not found');
pr = pr.replace(fOld, fNew);
fs.writeFileSync(path.join(root, 'getting-started/prerequisites.mdx'), pr);
console.log('F: prerequisites');

let docs = fs.readFileSync(path.join(root, 'docs.json'), 'utf8');
if (docs.includes('reference/skadnetwork-ids')) {
  console.log('docs.json already has skadnetwork-ids');
} else {
  const needle = `{
            "page": "reference/compatibility-matrix",
            "title": "Compatibility Matrix"
          },`;
  const insert = `{
            "page": "reference/compatibility-matrix",
            "title": "Compatibility Matrix"
          },
          {
            "page": "reference/skadnetwork-ids",
            "title": "SKAdNetwork IDs"
          },`;
  if (!docs.includes(needle)) throw new Error('docs.json needle not found');
  docs = docs.replace(needle, insert);
  fs.writeFileSync(path.join(root, 'docs.json'), docs);
  console.log('docs.json: added skadnetwork-ids');
}

console.log('DONE');
