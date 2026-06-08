# Migration Phase 2 Report

GitBook syntax conversion to JamDesk components (hints, includes, tabs).

## Validation

| Check | Result |
|---|---|
| `jamdesk validate` | **Passed** |
| `docs.json` schema | Valid |
| MDX syntax (all navigation pages) | Valid |
| OpenAPI spec | Valid |
| Missing navigation files | 0 |

### Supplemental MDX HTML syntax fixes (26 files)

To pass MDX validation without changing page meaning, invalid GitBook HTML was normalized to MDX-safe equivalents:

| Pattern | Replacement |
|---|---|
| `[<br>](url)` | `![](url)` |
| `<figure><img ...></figure>` | `![](src)` |
| `<div align="left"><img ...></div>` | `![](src)` |
| `<pre><code>...</code></pre>` | Fenced ` ```xml ` code block |
| `-ObjC<br>` | `-ObjC` + newline |

Applied by `scripts/fix-mdx-html-syntax.js`.

## Summary

| Metric | Count |
|---|---|
| Files modified (GitBook syntax) | 69 |
| Files modified (MDX HTML fixes) | 26 |
| Hint blocks converted | 158 |
| Include blocks converted | 28 |
| Tab groups converted | 5 |
| Snippets created | 3 |
| Pages requiring manual review | 34 |

## Hint conversions by style

| GitBook style | JamDesk component | Count |
|---|---|---|
| `info` | `<Info>` | 158 |

## Include conversions by snippet

| GitBook include | JamDesk snippet | Count |
|---|---|---|
| `doc-tag-admob-gam.md` | `/snippets/doc-tag-admob-gam.mdx` | 15 |
| `doc-tag-applovin.md` | `/snippets/doc-tag-applovin.mdx` | 7 |
| `doc-tag-ironsource.md` | `/snippets/doc-tag-ironsource.mdx` | 6 |

> Note: `doc-tag-applovin` appears 7 times because `cocos-ios-engine/admob/configuration.md` references the AppLovin snippet in the source GitBook content (pre-existing).

## Tab conversions by file

| File | Tab groups converted |
|---|---|
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/installation.md` | 2 |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/installation.md` | 2 |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/installation.md` | 1 |

## Files modified

- `tapmind-custom-adapter-sdk-integration/cocos-android-engine/README.md`
- `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/README.md`
- `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/configuration.md`
- `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/installation.md`
- `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/configuration.md`
- `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/installation.md`
- `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/README.md`
- `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/configuration.md`
- `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/installation.md`
- `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/configuration.md`
- `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/installation.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/README.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/README.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/configuration.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/admob/installation.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/configuration.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/applovin/installation.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/configuration.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/installation.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/installation.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/README.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/configuration.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/admob/installation.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/configuration.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/applovin/installation.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/configuration.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/installation.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/installation.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/README.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/README.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/configuration.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/admob/installation.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/configuration.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/installation.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/configuration.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/installation.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/installation.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/README.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/admob/configuration.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/configuration.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/applovin/installation.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/configuration.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/installation.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/README.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/admob/configuration.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/configuration.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/installation.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/configuration.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/installation.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/admob/configuration.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/configuration.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/installation.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/configuration.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/installation.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/installation.md`

## Snippets created

- `snippets/doc-tag-admob-gam.mdx` (from `.gitbook/includes/doc-tag-admob-gam.md`)
- `snippets/doc-tag-ironsource.mdx` (from `.gitbook/includes/doc-tag-ironsource.md`)
- `snippets/doc-tag-applovin.mdx` (from `.gitbook/includes/doc-tag-applovin.md`)

## Pages requiring manual review

| File | Reason |
|---|---|
| `README.md` | GitBook HTML button links — requires Card/Button redesign |
| `README.md` | GitBook icon frontmatter field — not used by JamDesk |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/installation.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/admob/installation.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/installation.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/installation.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/README.md` | Legacy GitBook image embed via ca-docs.adster.tech URL |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/installation.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/installation.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/installation.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/installation.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/README.md` | Legacy GitBook image embed via ca-docs.adster.tech URL |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/README.md` | Legacy GitBook image embed via ca-docs.adster.tech URL |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/README.md` | Legacy GitBook image embed via ca-docs.adster.tech URL |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/README.md` | Legacy GitBook image embed via ca-docs.adster.tech URL |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/README.md` | Legacy GitBook image embed via ca-docs.adster.tech URL |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/applovin/installation.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/README.md` | Legacy GitBook image embed via ca-docs.adster.tech URL |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/installation.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/applovin/installation.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/README.md` | Legacy GitBook image embed via ca-docs.adster.tech URL |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration.md` | Relative .gitbook/assets/ image path — move to /images/ in Phase 3 |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration.md` | HTML figure/div image markup — verify rendering after preview |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/installation.md` | HTML figure/div image markup — verify rendering after preview |
