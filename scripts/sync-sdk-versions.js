/**
 * Apply sdk-versions.json to live guide pages.
 * Usage: npm run sync-versions
 */

const fs = require('fs');
const path = require('path');
const { loadSdkVersions, SDK_VERSIONS_PATH } = require('./gma/load-sdk-versions');
const {
  ANDROID_ARTIFACT,
  IOS_POD,
  FLUTTER_PUBSPEC,
  NEXTGEN_FLUTTER_PUBSPEC,
  RN_PACKAGE,
  WRAPPER_FOLDER,
} = require('./gma/package-catalog');

const rootDir = path.resolve(__dirname, '..');
const versions = loadSdkVersions();

function read(rel) {
  return fs.readFileSync(path.join(rootDir, rel), 'utf8');
}

function writeIfChanged(rel, next, prev) {
  if (next === prev) return false;
  fs.writeFileSync(path.join(rootDir, rel), next);
  return true;
}

function mustReplace(rel, content, re, replacement, label) {
  if (!re.test(content)) {
    throw new Error(`${rel}: did not find ${label}`);
  }
  re.lastIndex = 0;
  return content.replace(re, replacement);
}

function guidePath(product, wrapper, mediation) {
  const folder = WRAPPER_FOLDER[wrapper];
  return path.join(product, folder, `${mediation}.mdx`).replace(/\\/g, '/');
}

const changed = [];

function track(rel, did) {
  if (did) changed.push(rel);
}

function syncAndroid(product, wrapperKey) {
  const artifacts = ANDROID_ARTIFACT[product];
  const table = versions[product][wrapperKey];
  for (const [mediation, version] of Object.entries(table)) {
    const rel = guidePath(product, wrapperKey, mediation);
    const artifact = artifacts[mediation];
    let src = read(rel);
    src = mustReplace(
      rel,
      src,
      new RegExp(`(io\\.github\\.tapmind-tech:${artifact}:)[^"\\s]+`),
      `$1${version}`,
      `${artifact} version`,
    );
    track(rel, writeIfChanged(rel, src, read(rel)));
  }
}

function syncIos(product) {
  const table = versions[product]['native-ios'];
  for (const [mediation, version] of Object.entries(table)) {
    const rel = guidePath(product, 'native-ios', mediation);
    const pod = IOS_POD[mediation];
    const line = version ? `pod '${pod}', '${version}'` : `pod '${pod}'`;
    let src = read(rel);
    src = mustReplace(
      rel,
      src,
      new RegExp(`pod '${pod}'(?:,\\s*'[^']+')?`),
      line,
      `${pod} pod line`,
    );
    track(rel, writeIfChanged(rel, src, read(rel)));
  }
}

function syncFlutter(product, pubspecMap = FLUTTER_PUBSPEC) {
  const table = versions[product].flutter;
  if (!table) return;
  for (const [mediation, version] of Object.entries(table)) {
    const rel = guidePath(product, 'flutter', mediation);
    const name = pubspecMap[mediation];
    let src = read(rel);
    src = mustReplace(
      rel,
      src,
      new RegExp(`(${name}: \\^)[^\\s]+`, 'g'),
      `$1${version}`,
      `${name} version`,
    );
    track(rel, writeIfChanged(rel, src, read(rel)));
  }
}

function syncReactNative(product) {
  const table = versions[product]['react-native'];
  for (const [mediation, version] of Object.entries(table)) {
    const rel = guidePath(product, 'react-native', mediation);
    const name = RN_PACKAGE[mediation];
    let src = read(rel);
    src = mustReplace(
      rel,
      src,
      new RegExp(`(${name}: ")[^"]+(")`, 'g'),
      `$1${version}$2`,
      `${name} version`,
    );
    track(rel, writeIfChanged(rel, src, read(rel)));
  }
}

function syncOrchestration() {
  const rel = 'orchestration-sdk/android.mdx';
  const version = versions['orchestration-sdk']['native-android'];
  let src = read(rel);
  src = mustReplace(
    rel,
    src,
    /(io\.github\.tapmind-tech:orchestration:)[^"\s]+/,
    `$1${version}`,
    'orchestration version',
  );
  track(rel, writeIfChanged(rel, src, read(rel)));
}

function syncGoogleDeps() {
  const gma = versions.google.gma;
  const nextgen = versions.google['gma-next-gen'];

  function bumpGoogle(rel, re, replacement, label) {
    if (!fs.existsSync(path.join(rootDir, rel))) return;
    const prev = read(rel);
    if (!re.test(prev)) return;
    re.lastIndex = 0;
    const next = prev.replace(re, replacement);
    track(rel, writeIfChanged(rel, next, prev));
  }

  const gmaPages = [
    ...['admob', 'google-ad-manager', 'applovin-max', 'levelplay'].map(
      (m) => `custom-adapter-gma-sdk/android/${m}.mdx`,
    ),
    ...['applovin-max', 'levelplay'].flatMap((m) => [
      `custom-adapter-gma-sdk/flutter/${m}.mdx`,
      `custom-adapter-gma-sdk/react-native/${m}.mdx`,
    ]),
  ];

  for (const rel of gmaPages) {
    bumpGoogle(
      rel,
      /play-services-ads:[0-9.]+/g,
      `play-services-ads:${gma}`,
      'GMA Android',
    );
  }

  for (const m of ['admob', 'google-ad-manager', 'levelplay']) {
    bumpGoogle(
      `custom-adapter-gma-next-gen-sdk/android/${m}.mdx`,
      /ads-mobile-sdk:[0-9.]+/g,
      `ads-mobile-sdk:${nextgen}`,
      'GMA Next-Gen Android',
    );
  }

  const matrixRel = 'reference/compatibility-matrix.mdx';
  let matrix = read(matrixRel);
  const prevMatrix = matrix;
  matrix = matrix.replace(/(\| AdMob \| )[0-9.]+( \| GAM SDK)/, `$1${gma}$2`);
  matrix = matrix.replace(
    /(\| Google Ad Manager \| )[0-9.]+( \| GAM SDK)/,
    `$1${gma}$2`,
  );
  matrix = matrix.replace(
    /(\| AdMob \| )[0-9.]+( \| GMA Next-Gen SDK)/,
    `$1${nextgen}$2`,
  );
  matrix = matrix.replace(
    /(\| Google Ad Manager \| )[0-9.]+( \| GMA Next-Gen SDK)/,
    `$1${nextgen}$2`,
  );
  matrix = matrix.replace(
    /(\| Unity LevelPlay \| )[0-9.]+( \| Unity LevelPlay SDK \| 23 or higher)/,
    `$1${nextgen}$2`,
  );
  track(matrixRel, writeIfChanged(matrixRel, matrix, prevMatrix));
}

syncAndroid('custom-adapter-gma-sdk', 'native-android');
syncIos('custom-adapter-gma-sdk');
syncFlutter('custom-adapter-gma-sdk');
syncReactNative('custom-adapter-gma-sdk');
syncAndroid('custom-adapter-gma-next-gen-sdk', 'native-android');
syncFlutter('custom-adapter-gma-next-gen-sdk', NEXTGEN_FLUTTER_PUBSPEC);
syncOrchestration();
syncGoogleDeps();

const unique = [...new Set(changed)];
if (unique.length === 0) {
  console.log(`Already in sync with ${path.relative(rootDir, SDK_VERSIONS_PATH)}`);
} else {
  console.log(`Updated ${unique.length} file(s) from ${path.relative(rootDir, SDK_VERSIONS_PATH)}:`);
  for (const rel of unique) console.log(`  ${rel}`);
}
