# Route Fix Report

**Date:** 2026-06-09

## Root cause

JamDesk uses **slug-based routing** where each navigation entry maps to `{slug}.mdx` at the project root.

- `docs.json` navigation slugs were **correct** (they matched GitBook file paths).
- Documentation files were **`.md`**, but JamDesk production ISR and the dev content-loader only read **`.mdx`**.
- Result: sidebar rendered from `docs.json`, but every page request returned **404** because no `.mdx` file existed at the expected path.

JamDesk CLI `validate` checks both `.mdx` and `.md`, which masked the issue during migration QA.

## Fix applied

Renamed **94** navigation-referenced files from `.md` to `.mdx` (content unchanged).

No `docs.json` route changes were required — slugs already matched file paths.

No frontmatter slug changes were required — JamDesk resolves routes from file path, not frontmatter.

## Files modified

| Category | Count | Notes |
|---|---|---|
| Content files renamed `.md` → `.mdx` | 94 | `README.mdx`, `gradle-setup/for-gradle-version-7+.mdx`, 92 pages under `tapmind-custom-adapter-sdk-integration/` |
| `docs.json` | 0 | Navigation slugs were already correct |
| Frontmatter added | 0 | Not required for routing |
| Tooling | 2 | `scripts/fix-jamdesk-routes.js`, `scripts/route-fix-stats.json` |

## Summary

| Metric | Count |
|---|---|
| Navigation entries | 94 |
| Files renamed .md → .mdx | 94 |
| Routes passing after fix | 94 |
| Routes still failing | 0 |

## Validation

| Check | Result |
|---|---|
| `jamdesk validate` | PASS |
| Local dev routes (sample of 4) | HTTP 200 |
| Production routes (sample of 4) | HTTP 200 |
| `jamdesk deploy --full-rebuild` | PASS — 166 files uploaded |
| Live site | https://custom-adapter-integration.jamdesk.app |

## Route mapping

| Current docs.json route | Actual file | Expected JamDesk route | Status |
|---|---|---|---|
| `README` | `README.mdx` | `/README` | **PASS** |
| `gradle-setup/for-gradle-version-7+` | `gradle-setup/for-gradle-version-7+.mdx` | `/gradle-setup/for-gradle-version-7+` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/README` | `tapmind-custom-adapter-sdk-integration/cocos-android-engine/README.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-android-engine/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/README` | `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/README.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/configuration` | `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/installation` | `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/README` | `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/README.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/configuration` | `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/installation` | `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/README` | `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/README.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-ios-engine/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/README` | `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/README.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/configuration` | `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/installation` | `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/README` | `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/README.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/configuration` | `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/installation` | `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/README` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/README` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/configuration` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/installation` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/README` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/configuration` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/installation` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/README` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/configuration` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/installation` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/README` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/installation` | `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/README` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/README` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/configuration` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/installation` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/README` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/configuration` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/installation` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/README` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/configuration` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/installation` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/README` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/README.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/installation` | `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/README` | `tapmind-custom-adapter-sdk-integration/native-android-engine/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/README` | `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/admob/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/configuration` | `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/admob/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/installation` | `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/admob/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/README` | `tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/configuration` | `tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/installation` | `tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/README` | `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/configuration` | `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/installation` | `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/README` | `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration` | `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/installation` | `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/README` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/README` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/configuration` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/installation` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/README` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/configuration` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/installation` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/README` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/configuration` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/installation` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/README` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/README.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/installation` | `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/README` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/README` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/configuration` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/installation` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/README` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/configuration` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/installation` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/README` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/configuration` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/installation` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/README` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/installation` | `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/README` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/README` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/configuration` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/installation` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/README` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/configuration` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/installation` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/README` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/configuration` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/installation` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/installation` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/README` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/README.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/README` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration` | **PASS** |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/installation` | `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/installation.mdx` | `/tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/installation` | **PASS** |

## JamDesk routing reference

| Mechanism | Behavior |
|---|---|
| File-based routing | `{slug}.mdx` at project root (nested paths supported) |
| Slug-based routing | Navigation slug = URL path without leading `/` |
| Frontmatter slug | Optional `title` / `description`; no custom URL slug required |
| README pages | Use slug `.../README` → file `.../README.mdx` |

## Remaining issues

None.
