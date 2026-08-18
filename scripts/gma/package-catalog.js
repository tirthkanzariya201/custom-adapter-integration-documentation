/**
 * Package names and file paths. Versions live in sdk-versions.json.
 */

const ANDROID_ARTIFACT = {
  'custom-adapter-gma-sdk': {
    admob: 'customadapter-admob',
    'google-ad-manager': 'customadapter-gam',
    'applovin-max': 'customadapter-applovin',
    levelplay: 'customadapter-ironsource',
  },
  'custom-adapter-gma-next-gen-sdk': {
    admob: 'customadapter-admob-nextgen',
    'google-ad-manager': 'customadapter-gam-nextgen',
    levelplay: 'customadapter-ironsource-nextgen',
  },
};

const IOS_POD = {
  admob: 'TapMindAdapter',
  'google-ad-manager': 'TapMindAdapter',
  'applovin-max': 'TapMindALAdapter',
  levelplay: 'TapMindISAdapter',
};

const FLUTTER_PUBSPEC = {
  admob: 'tapmind_ads_admob_flutter',
  'google-ad-manager': 'tapmind_ads_admob_flutter',
  'applovin-max': 'tapmind_ads_applovin_flutter',
  levelplay: 'tapmind_ads_ironsource_flutter',
};

const RN_PACKAGE = {
  admob: 'tapmind_ads_admob',
  'google-ad-manager': 'tapmind_ads_gam',
  'applovin-max': 'tapmind_ads_applovin',
  levelplay: 'tapmind_ads_ironsource',
};

const WRAPPER_FOLDER = {
  'native-android': 'android',
  'native-ios': 'ios',
  flutter: 'flutter',
  'react-native': 'react-native',
};

function mavenCoordinate(product, mediation, version) {
  const artifact = ANDROID_ARTIFACT[product][mediation];
  return `io.github.tapmind-tech:${artifact}:${version}`;
}

function iosPodLine(mediation, version) {
  const pod = IOS_POD[mediation];
  return version ? `pod '${pod}', '${version}'` : `pod '${pod}'`;
}

module.exports = {
  ANDROID_ARTIFACT,
  IOS_POD,
  FLUTTER_PUBSPEC,
  RN_PACKAGE,
  WRAPPER_FOLDER,
  mavenCoordinate,
  iosPodLine,
};
