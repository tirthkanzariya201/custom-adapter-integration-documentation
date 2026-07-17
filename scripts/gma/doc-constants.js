/**
 * Published doc constants.
 */

const GMA_VERSION = '25.0.0';
const LOG_TAG = 'TapMindAdapter';
const NETWORK_KEY = '15c11cb1d';

const MEDIATION_ORDER = ['admob', 'google-ad-manager', 'applovin', 'levelplay'];

/** GitBook source folder names when they differ from published mediation slug. */
const MEDIATION_SOURCE_DIR = {
  levelplay: 'ironsource-levelplay',
};

const MEDIATION_DISPLAY_TITLES = {
  admob: 'AdMob',
  'google-ad-manager': 'Google Ad Manager',
  applovin: 'AppLovin',
  levelplay: 'Unity LevelPlay',
};

function resolveMediationSourceDir(mediation) {
  return MEDIATION_SOURCE_DIR[mediation] || mediation;
}

const PACKAGE_VERSIONS = {
  admob: '2.1.13',
  gam: '2.1.14',
  applovin: '2.1.16',
  levelplay: '2.1.16',
  'nextgen-admob': '2.0.1',
  'nextgen-gam': '2.0.1',
  orchestration: '1.0.2',
  ump: '4.0.0',
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
