/**
 * Emits redirect entries for custom-adapter → custom-adapter-gma-sdk
 * and next-gen → custom-adapter-gma-next-gen-sdk slug migration.
 */
const GMA_PLATFORMS = {
  android: ['admob', 'google-ad-manager', 'applovin', 'levelplay'],
  ios: ['admob', 'google-ad-manager', 'applovin', 'levelplay'],
  flutter: ['admob', 'google-ad-manager', 'applovin', 'levelplay'],
  'react-native': ['admob', 'google-ad-manager', 'applovin', 'levelplay'],
  unity: ['admob', 'google-ad-manager', 'applovin', 'levelplay'],
  cocos: ['admob', 'google-ad-manager'],
};

const NEXTGEN_MEDIATIONS = ['admob', 'google-ad-manager'];

const redirects = [];

for (const [platform, mediations] of Object.entries(GMA_PLATFORMS)) {
  redirects.push({
    source: `/guides/${platform}/custom-adapter`,
    destination: `/guides/${platform}/custom-adapter-gma-sdk/admob`,
    permanent: true,
  });
  redirects.push({
    source: `/guides/${platform}/custom-adapter-gma-sdk`,
    destination: `/guides/${platform}/custom-adapter-gma-sdk/admob`,
    permanent: false,
  });
  redirects.push({
    source: `/guides/${platform}/custom-adapter/overview`,
    destination: `/guides/${platform}/custom-adapter-gma-sdk/admob`,
    permanent: true,
  });
  for (const mediation of mediations) {
    redirects.push({
      source: `/guides/${platform}/custom-adapter/${mediation}`,
      destination: `/guides/${platform}/custom-adapter-gma-sdk/${mediation}`,
      permanent: true,
    });
  }
  redirects.push({
    source: `/guides/${platform}/custom-adapter/ironsource-levelplay`,
    destination: `/guides/${platform}/custom-adapter-gma-sdk/levelplay`,
    permanent: true,
  });
}

redirects.push({
  source: '/guides/native/custom-adapter',
  destination: '/guides/android/custom-adapter-gma-sdk/admob',
  permanent: true,
});

redirects.push({
  source: '/guides/android/next-gen',
  destination: '/guides/android/custom-adapter-gma-next-gen-sdk/admob',
  permanent: true,
});
redirects.push({
  source: '/guides/android/custom-adapter-gma-next-gen-sdk',
  destination: '/guides/android/custom-adapter-gma-next-gen-sdk/admob',
  permanent: false,
});
redirects.push({
  source: '/guides/android/next-gen/overview',
  destination: '/guides/android/custom-adapter-gma-next-gen-sdk/admob',
  permanent: true,
});
for (const mediation of NEXTGEN_MEDIATIONS) {
  redirects.push({
    source: `/guides/android/next-gen/${mediation}`,
    destination: `/guides/android/custom-adapter-gma-next-gen-sdk/${mediation}`,
    permanent: true,
  });
}

for (const platform of ['unity', 'flutter', 'cocos', 'react-native']) {
  redirects.push({
    source: `/guides/${platform}/next-gen`,
    destination: '/guides/android/custom-adapter-gma-next-gen-sdk/admob',
    permanent: true,
  });
}

redirects.push({
  source: '/guides/cocos/custom-adapter/applovin',
  destination: '/guides/cocos/custom-adapter-gma-sdk/admob',
  permanent: true,
});
redirects.push({
  source: '/guides/react-native/overview',
  destination: '/guides/react-native/custom-adapter-gma-sdk/admob',
  permanent: true,
});
redirects.push({
  source: '/guides/react-native/custom-adapter',
  destination: '/guides/react-native/custom-adapter-gma-sdk/admob',
  permanent: true,
});

console.log(JSON.stringify(redirects, null, 2));
