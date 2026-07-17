# Pre-Launch Fixes Report

**Date:** 2026-06-08  
**Branch context:** JamDesk migration — pre-production cleanup

## Summary

All requested pre-launch fixes from the production audit have been applied. Navigation reduced from 105 to **94 entries** after removing JamDesk starter template pages.

---

## Files modified

| File | Change |
|---|---|
| `docs.json` | Removed **Legacy Starter Pages** tab; removed unused `api.openapi` starter config |
| `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/admob/configuration.md` | Corrected AdMob/GAM snippet import and placement |
| `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration.md` | Replaced `<mark>` styling with markdown emphasis |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration.md` | Replaced `<mark>` styling with markdown emphasis |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration.md` | Replaced `<mark>` styling with markdown emphasis |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration.md` | Replaced `<mark>` styling with markdown emphasis |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration.md` | Replaced `<mark>` styling with markdown emphasis |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration.md` | Replaced `<mark>` styling with markdown emphasis |

**Total modified:** 8 files

---

## Files deleted

| File | Reason |
|---|---|
| `introduction.mdx` | JamDesk starter — no longer in navigation |
| `quickstart.mdx` | JamDesk starter — no longer in navigation |
| `writing/pages.mdx` | JamDesk starter — no longer in navigation |
| `writing/components.mdx` | JamDesk starter — no longer in navigation |
| `writing/code-blocks.mdx` | JamDesk starter — no longer in navigation |
| `api-reference/openapi-example.mdx` | JamDesk starter — no longer in navigation |
| `api-reference/request-response-examples.mdx` | JamDesk starter — no longer in navigation |
| `components/cards.mdx` | JamDesk starter — no longer in navigation |
| `components/callouts.mdx` | JamDesk starter — no longer in navigation |
| `components/tabs-and-accordions.mdx` | JamDesk starter — no longer in navigation |
| `components/steps.mdx` | JamDesk starter — no longer in navigation |
| `openapi/example-api.yaml` | JamDesk starter OpenAPI spec — removed with `api` config |

**Total deleted:** 12 files

---

## Navigation changes

### Removed tab

- **Legacy Starter Pages** (11 entries removed)

### Removed groups and pages

| Group | Pages removed |
|---|---|
| Get Started | `introduction`, `quickstart` |
| Writing Content | `writing/pages`, `writing/components`, `writing/code-blocks` |
| API Pages | `api-reference/openapi-example`, `api-reference/request-response-examples` |
| Built-In Components | `components/cards`, `components/callouts`, `components/tabs-and-accordions`, `components/steps` |

### Resulting navigation

| Tab | Groups |
|---|---|
| Overview | Getting Started (1 page) |
| Native-Android Engine | Overview + 4 networks (13 pages) |
| Native-iOS Engine | Overview + 4 networks (13 pages) |
| Unity-Android Engine | Overview + 4 networks (13 pages) |
| Unity-iOS Engine | Overview + 4 networks (13 pages) |
| Flutter-Android Engine | Overview + 4 networks (13 pages) |
| Flutter-iOS Engine | Overview + 4 networks (13 pages) |
| Cocos-Android Engine | Overview + 2 networks (7 pages) |
| Cocos-iOS Engine | Overview + 2 networks (7 pages) |
| Gradle Setup | 1 page |

**Total navigation entries:** 94 (was 105)

---

## Snippet corrections

### `cocos-ios-engine/admob/configuration.md`

| Before | After |
|---|---|
| `import DocTagApplovin from '/snippets/doc-tag-applovin.mdx'` | `import DocTagAdmobGam from '/snippets/doc-tag-admob-gam.mdx'` |
| `<DocTagApplovin />` | `<DocTagAdmobGam />` |

Snippet placement aligned with `cocos-android-engine/admob/configuration.md` (tag block before completion paragraph).

---

## Styling corrections

Replaced GitBook `<mark style="background-color:$primary;">` tags in 6 IronSource LevelPlay configuration pages:

**Before:**
```markdown
input <mark style="background-color:$primary;">**Network Key**</mark> <mark style="background-color:$primary;">15c101ba1</mark>,then click
```

**After:**
```markdown
input **Network Key** `15c101ba1`, then click
```

| File | Lines changed |
|---|---|
| `native-android-engine/ironsource-levelplay/configuration.md` | Step 3 |
| `native-ios-engine/ironsource-levelplay/configuration.md` | Step 3 |
| `flutter-android-engine/ironsource-levelplay/configuration.md` | Step 3 |
| `flutter-ios-engine/ironsource-levelplay/configuration.md` | Step 3 |
| `unity-android-engine/ironsource-levelplay/configuration.md` | Step 3 |
| `unity-ios-engine/ironsource-levelplay/configuration.md` | Step 3 |

---

## Validation results

```
✓ docs.json is valid
✓ MDX syntax valid
✓ No deprecated components found
```

- Navigation file resolution: **94/94** pages exist
- Residual `<mark>` tags in documentation content: **0**
- Incorrect AdMob snippet on Cocos iOS: **fixed**

---

## Remaining items (not in this fix scope)

These were identified in the original production audit but were not part of this pre-launch fix task:

- **8 Google Ad Manager README pages** still reference screenshots on `ca-docs.adster.tech` (re-host before GitBook decommission)
- **7 unused images** in `/images/` directory
- **Duplicate page titles** across platforms (search disambiguation — optional frontmatter improvement)
