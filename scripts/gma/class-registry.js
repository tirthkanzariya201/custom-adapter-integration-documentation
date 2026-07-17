/**
 * Canonical adapter class strings and LevelPlay network key per framework/OS/mediation.
 * Single source for dashboard config building blocks (Part 2.7).
 */

const { NETWORK_KEY } = require('./doc-constants');

const REGISTRY = {
  'native-android': {
    admob: { className: 'com.tapmind.tech.TapMindMediationAdapterAdmob' },
    'google-ad-manager': { className: 'com.tapmind.tech.TapMindMediationAdapterGAM' },
    applovin: { className: 'com.tapmind.tech.TapMindMediationAdapterApplovin' },
    levelplay: { networkKey: NETWORK_KEY },
  },
  'native-ios': {
    admob: { className: 'TapMindMediationAdapterAdmob' },
    'google-ad-manager': { className: 'TapMindMediationAdapterGAM' },
    applovin: { className: 'TapMindMediationAdapterApplovin' },
    levelplay: { networkKey: NETWORK_KEY },
  },
  flutter: {
    admob: {
      android: 'com.tapmind.tech.TapMindMediationAdapterAdmob',
      ios: 'TapMindMediationAdapterAdmob',
    },
    'google-ad-manager': {
      android: 'com.tapmind.tech.TapMindMediationAdapterAdmob',
      ios: 'TapMindMediationAdapterAdmob',
    },
    applovin: {
      android: 'com.tapmind.tech.TapMindMediationAdapterApplovin',
      ios: 'TapMindMediationAdapterApplovin',
    },
    levelplay: { networkKey: NETWORK_KEY },
  },
  'react-native': {
    admob: {
      android: 'com.tapmind.tech.TapMindMediationAdapterAdmob',
      ios: 'TapMindMediationAdapterAdmob',
    },
    'google-ad-manager': {
      android: 'com.tapmind.tech.TapMindMediationAdapterAdmob',
      ios: 'TapMindMediationAdapterAdmob',
    },
    applovin: {
      android: 'com.tapmind.tech.TapMindMediationAdapterApplovin',
      ios: 'TapMindMediationAdapterApplovin',
    },
    levelplay: { networkKey: NETWORK_KEY },
  },
  unity: {
    admob: {
      android: 'com.tapmind.tech.TapMindMediationAdapterAdmob',
      ios: 'TapMindMediationAdapterAdmob',
    },
    'google-ad-manager': {
      android: 'com.tapmind.tech.TapMindMediationAdapterAdmob',
      ios: 'TapMindMediationAdapterAdmob',
    },
    applovin: {
      android: 'com.tapmind.tech.TapMindMediationAdapterApplovin',
      ios: 'TapMindMediationAdapterApplovin',
    },
    levelplay: { networkKey: NETWORK_KEY },
  },
  cocos: {
    admob: {
      android: 'com.tapmind.tech.TapMindMediationAdapterAdmob',
      ios: 'TapMindMediationAdapterAdmob',
    },
    'google-ad-manager': {
      android: 'com.tapmind.tech.TapMindMediationAdapterAdmob',
      ios: 'TapMindMediationAdapterAdmob',
    },
    applovin: {
      android: 'com.tapmind.tech.TapMindMediationAdapterApplovin',
      ios: 'TapMindMediationAdapterApplovin',
    },
    levelplay: { networkKey: NETWORK_KEY },
  },
  'next-gen-android': {
    admob: { className: 'com.tapmind.mediation.ng.TapMindAdmobAdapter' },
    'google-ad-manager': { className: 'com.tapmind.mediation.ng.TapMindGamAdapter' },
  },
};

function resolveFrameworkKey(mode, os, wrapper) {
  if (mode === 'native-os') {
    return os === 'android' ? 'native-android' : 'native-ios';
  }
  return wrapper;
}

function getClassEntry(frameworkKey, mediation, os) {
  const entry = REGISTRY[frameworkKey]?.[mediation];
  if (!entry) return null;
  if (entry.className) return { className: entry.className };
  if (entry.networkKey) return { networkKey: entry.networkKey };
  if (entry.android || entry.ios) {
    return { className: entry[os] || entry.android || entry.ios };
  }
  return null;
}

function getRegistryEntry(frameworkKey, mediation) {
  return REGISTRY[frameworkKey]?.[mediation] || null;
}

module.exports = { REGISTRY, NETWORK_KEY, resolveFrameworkKey, getClassEntry, getRegistryEntry };
