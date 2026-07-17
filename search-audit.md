# Searchability Audit

**Status:** PASS (informational — duplicate titles expected for parallel platform docs)

## Summary

| Metric | Count |
|---|---|
| Duplicate page titles | 6 |
| Duplicate H1 headings | 1 |
| Ambiguous nav labels | 50 |

## Duplicate titles (top examples)

| Title | Occurrences | Files |
|---|---|---|
| configuration | 28 | tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/configuration.md, tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/configuration.md, tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/configuration.md... |
| installation | 28 | tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/installation.md, tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/installation.md, tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/installation.md... |
| admob | 8 | tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/README.md, tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/README.md, tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/README.md... |
| google ad manager | 8 | tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/README.md, tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/README.md, tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/README.md... |
| applovin | 6 | tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/README.md, tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/README.md, tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/README.md... |
| ironsource - levelplay | 6 | tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/README.md, tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/README.md, tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/README.md... |

## Duplicate H1 headings

- **configuration** (8 pages)

## Search performance concerns

1. **"Installation"** and **"Configuration"** titles repeat across 30+ pages — users should navigate by platform tab, not search alone.
2. **"AdMob"**, **"Applovin"**, **"Google Ad Manager"** network READMEs share titles across 8 engines.
3. JamDesk AI search uses full page path context — platform tabs mitigate ambiguity.

## Recommendations

- Add platform-specific `title` in frontmatter (e.g., "AdMob — Native Android")
- Keep tab-based navigation as primary discovery path
- Consider search keywords via `description` frontmatter
