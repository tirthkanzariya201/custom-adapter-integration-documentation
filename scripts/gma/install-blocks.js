/**
 * Per-cell install blocks (Part 2.8). Versions match current published guides.
 */

const ANDROID_PACKAGES = {
  admob: 'io.github.tapmind-tech:customadapter-admob:2.1.14',
  applovin: 'io.github.tapmind-tech:customadapter-applovin:2.1.16',
  'google-ad-manager': 'io.github.tapmind-tech:customadapter-gam:2.1.14',
  levelplay: 'io.github.tapmind-tech:customadapter-ironsource:2.1.16',
};

const GMA_ANDROID = 'com.google.android.gms:play-services-ads:25.0.0';

const NEXTGEN_ANDROID_PACKAGES = {
  admob: 'io.github.tapmind-tech:customadapter-admob-nextgen:2.0.1',
  'google-ad-manager': 'io.github.tapmind-tech:customadapter-gam-nextgen:2.0.1',
};

const IOS_PODS = {
  admob: 'TapMindAdapter',
  applovin: 'TapMindALAdapter',
  'google-ad-manager': 'TapMindAdapter',
  levelplay: 'TapMindISAdapter',
};

const IOS_SPM_REPOS = {
  admob: 'https://github.com/tapmind-tech/TapMind-Custom-Adapter-iOS.git',
  applovin: 'https://github.com/tapmind-tech/TapMind-CA-Applovin-iOS.git',
  'google-ad-manager': 'https://github.com/tapmind-tech/TapMind-Custom-Adapter-iOS.git',
  levelplay: 'https://github.com/tapmind-tech/TapMind-CA-Unity-Levelplay-iOS.git',
};

const FLUTTER_DEPS = {
  admob: 'tapmind_ads_admob_flutter: ^1.0.2',
  applovin: 'tapmind_ads_applovin_flutter: ^1.0.2',
  'google-ad-manager': 'tapmind_ads_admob_flutter: ^1.0.2',
  levelplay: 'tapmind_ads_ironsource_flutter: ^1.0.2',
};

const IOS_POD_VERSIONS = {
  admob: '2.1.13',
  applovin: '2.1.13',
  'google-ad-manager': '2.1.13',
  levelplay: '2.1.12',
};

function reactNativePostInstallBlock() {
  return `Add the following \`post_install\` hook to your app's **Podfile** (alongside \`use_native_modules!\` and \`react_native_post_install\`):

\`\`\`ruby
post_install do |installer|
  react_native_post_install(
    installer,
    config[:reactNativePath],
    :mac_catalyst_enabled => false,
  )
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      config.build_settings['CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS'] = 'NO'
      config.build_settings['GCC_WARN_PEDANTIC'] = 'NO'
      if target.name == 'fmt'
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
  end
end
\`\`\``;
}

const RN_PACKAGES = {
  admob: 'tapmind_ads_admob: "2.1.4"',
  applovin: 'tapmind_ads_applovin: "2.1.4"',
  'google-ad-manager': 'tapmind_ads_gam: "2.1.4"',
  levelplay: 'tapmind_ads_ironsource: "2.1.4"',
};

const UNITY_GIT = {
  admob: 'https://github.com/tapmind-tech/TapMind-CA-Admob-Unity.git',
  applovin: 'https://github.com/tapmind-tech/TapMind-CA-Applovin-Unity.git',
  'google-ad-manager': 'https://github.com/tapmind-tech/TapMind-CA-Admob-Unity.git',
  levelplay: 'https://github.com/tapmind-tech/TapMind-CA-Ironsource-Unity.git',
};

function nextGenAndroidInstall(mediation) {
  const pkg = NEXTGEN_ANDROID_PACKAGES[mediation];
  if (!pkg) return '';
  return `Open the \`build.gradle\` (Module: app) file and add:

\`\`\`
dependencies {
    implementation("${pkg}")
    implementation("${GMA_ANDROID}")
}
\`\`\``;
}

function androidNativeInstall(mediation) {
  const pkg = ANDROID_PACKAGES[mediation];
  if (!pkg) return '';
  return `Open the \`build.gradle\` (Module: app) file and add:

\`\`\`
dependencies {
    implementation("${pkg}")
    implementation("${GMA_ANDROID}")
}
\`\`\``;
}

function iosNativeInstall(mediation) {
  const pod = IOS_PODS[mediation];
  const version = IOS_POD_VERSIONS[mediation];
  const spm = IOS_SPM_REPOS[mediation];
  if (!pod) return '';
  return `### CocoaPods

1. Open your project's Podfile and add:

\`\`\`
pod '${pod}', '${version}'
\`\`\`

2. Run \`pod install\` and open the \`.xcworkspace\` file.

### Swift Package Manager (SPM)

1. In Xcode: **File → Add Package Dependencies**
2. Add: \`${spm}\`
3. Add **\`-ObjC\`** to **Targets → Build Settings → Other Linker Flags**`;
}

function flutterInstall(mediation, os) {
  const dep = FLUTTER_DEPS[mediation];
  if (!dep) return '';
  const gmaNote =
    mediation === 'admob' || mediation === 'google-ad-manager'
      ? ''
      : '\n\n**Note:** AdMob and GAM adapters pin `play-services-ads:25.0.0` on Android. AppLovin and Unity LevelPlay adapters use compatible GMA version resolution so Gradle can align with your app.';
  if (os === 'android') {
    return `Open \`pubspec.yaml\` and add:

\`\`\`
dependencies:
  ${dep}
  google_mobile_ads: ^5.0.0
\`\`\`${gmaNote}`;
  }
  return `Update your \`ios/Podfile\` Runner target, then add to \`pubspec.yaml\`:

\`\`\`
dependencies:
  ${dep}
  google_mobile_ads: ^5.0.0
\`\`\``;
}

function reactNativeInstall(mediation, os) {
  const pkg = RN_PACKAGES[mediation];
  if (!pkg) return '';
  if (os === 'ios') {
    return `Add to \`package.json\` and install via npm/yarn:

\`\`\`
${pkg}
\`\`\`

Also require \`react-native-google-mobile-ads\`.

${reactNativePostInstallBlock()}`;
  }
  const gmaNote =
    mediation === 'admob' || mediation === 'google-ad-manager'
      ? ''
      : '\n\n**Note:** AdMob and GAM adapters pin `play-services-ads:25.0.0` on Android. AppLovin and Unity LevelPlay adapters use compatible GMA version resolution.';
  return `Add to \`package.json\` and install via npm/yarn:

\`\`\`
${pkg}
\`\`\`

Also require \`react-native-google-mobile-ads\`.${gmaNote}`;
}

function unityInstall(mediation) {
  const url = UNITY_GIT[mediation];
  if (!url) return '';
  return `In Unity **Package Manager → Add package from git URL**:

\`\`\`
${url}
\`\`\`

TapMind's Unity package uses a **post-processing script** that automatically adds the native Android and iOS dependencies during the Unity build. Git tag-based pinning is not used - add the package from the repository URL above.

Import the GMA Unity plugin and set AdMob app IDs under **Assets → Google Mobile Ads → Settings**.`;
}

const COCOS_EXTENSION_ZIP =
  'https://github.com/tapmind-tech/TapMind-CA-Admob-Cocos/archive/refs/heads/main.zip';

function cocosInstall(mediation) {
  const labels = {
    admob: 'AdMob',
    'google-ad-manager': 'GAM',
    applovin: 'AppLovin',
    levelplay: 'Unity LevelPlay',
  };
  const label = labels[mediation] || 'TapMind';
  return `Install the TapMind ${label} extension:

1. **Extension → Extension Manager → Install from File**
2. Download the TapMind extension ZIP: [TapMind-CA-Admob-Cocos (main)](${COCOS_EXTENSION_ZIP})
3. Select the downloaded ZIP, install, then **Enable** the extension in the **Installed** tab.`;
}

function getInstallBlock({ mode, os, wrapper, mediation, product }) {
  if (product === 'next-gen' && os === 'android') {
    return nextGenAndroidInstall(mediation);
  }
  if (mode === 'native-os') {
    return os === 'android' ? androidNativeInstall(mediation) : iosNativeInstall(mediation);
  }
  if (wrapper === 'flutter') {
    return flutterInstall(mediation, os);
  }
  if (wrapper === 'react-native') {
    return reactNativeInstall(mediation, os);
  }
  if (wrapper === 'unity') {
    return unityInstall(mediation);
  }
  if (wrapper === 'cocos') {
    return cocosInstall(mediation);
  }
  return '';
}

function needsGradleSnippet({ mode, os, wrapper, product }) {
  if (product === 'next-gen') return true;
  if (mode === 'native-os' && os === 'android') return true;
  if (wrapper === 'flutter' || wrapper === 'react-native') return true;
  return false;
}

function needsAppIdAndroid({ mode, os, wrapper, product }) {
  if (product === 'next-gen') return true;
  if (mode === 'native-os' && os === 'android') return true;
  if (wrapper === 'flutter' || wrapper === 'react-native' || wrapper === 'unity' || wrapper === 'cocos') {
    return true;
  }
  return false;
}

function needsAppIdIos({ mode, os, wrapper, product }) {
  if (product === 'next-gen') return false;
  if (mode === 'native-os' && os === 'ios') return true;
  if (wrapper === 'flutter' || wrapper === 'react-native' || wrapper === 'unity' || wrapper === 'cocos') {
    return true;
  }
  return false;
}

module.exports = {
  getInstallBlock,
  needsGradleSnippet,
  needsAppIdAndroid,
  needsAppIdIos,
  NEXTGEN_ANDROID_PACKAGES,
};
