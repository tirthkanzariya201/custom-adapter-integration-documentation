/**
 * Published doc constants.
 */

const { loadSdkVersions } = require('./load-sdk-versions');

const sdkVersions = loadSdkVersions();
const GMA_VERSION = sdkVersions.google.gma;
const LOG_TAG = 'TapMindAdapter';
const NETWORK_KEY = '15c11cb1d';

const MEDIATION_ORDER = ['admob', 'google-ad-manager', 'applovin-max', 'levelplay'];

/** GitBook source folder names when they differ from published mediation slug. */
const MEDIATION_SOURCE_DIR = {
  levelplay: 'ironsource-levelplay',
  'applovin-max': 'applovin',
};

const MEDIATION_DISPLAY_TITLES = {
  admob: 'AdMob',
  'google-ad-manager': 'Google Ad Manager',
  'applovin-max': 'AppLovin MAX',
  levelplay: 'Unity LevelPlay',
};

function resolveMediationSourceDir(mediation) {
  return MEDIATION_SOURCE_DIR[mediation] || mediation;
}

const PACKAGE_VERSIONS = {
  admob: sdkVersions['custom-adapter-gma-sdk']['native-android'].admob,
  gam: sdkVersions['custom-adapter-gma-sdk']['native-android']['google-ad-manager'],
  'applovin-max': sdkVersions['custom-adapter-gma-sdk']['native-android']['applovin-max'],
  levelplay: sdkVersions['custom-adapter-gma-sdk']['native-android'].levelplay,
  'nextgen-admob': sdkVersions['custom-adapter-gma-next-gen-sdk']['native-android'].admob,
  'nextgen-gam': sdkVersions['custom-adapter-gma-next-gen-sdk']['native-android']['google-ad-manager'],
  orchestration: sdkVersions['orchestration-sdk']['native-android'],
};

const MIN_ANDROID = {
  native: 23,
  flutter: 24,
  unity: 23,
  'react-native': 24,
  cocos: 25,
  orchestration: 24,
};

const MIN_IOS = {
  native: 12.0,
  flutter: 15.0,
  unity: 12.0,
  'react-native': 15.0,
  cocos: 18.0,
};

module.exports = {
  GMA_VERSION,
  LOG_TAG,
  NETWORK_KEY,
  MEDIATION_ORDER,
  MEDIATION_SOURCE_DIR,
  resolveMediationSourceDir,
  MEDIATION_DISPLAY_TITLES,
  PACKAGE_VERSIONS,
  MIN_ANDROID,
  MIN_IOS,
};
