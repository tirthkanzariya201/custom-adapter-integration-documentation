# Final Anchor Cleanup Report

**Date:** 2026-06-09

## Summary

All remaining GitBook fragment/anchor issues have been resolved. IronSource LevelPlay configuration pages now rely on JamDesk-generated `#testing-instructions` anchors, and the obsolete empty heading was removed from the native iOS installation page.

| Metric | Result |
|---|---|
| Category B fixes applied | 6 |
| Category C fixes applied | 1 |
| Remaining fragment warnings | **0** |
| Remaining broken links | **0** |

## Category B — IronSource LevelPlay configuration

**Issue:** GitBook manual anchor `#setup-instances-for-banner` on heading **Testing instructions**.

**JamDesk generated anchor:** `#testing-instructions`

**Fix:** Removed obsolete GitBook anchor tag from heading. JamDesk auto-assigns `#testing-instructions` from heading text.

| File | Old fragment | New anchor |
|---|---|---|
| `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration.mdx` | `#setup-instances-for-banner` | `#testing-instructions` |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration.mdx` | `#setup-instances-for-banner` | `#testing-instructions` |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration.mdx` | `#setup-instances-for-banner` | `#testing-instructions` |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration.mdx` | `#setup-instances-for-banner` | `#testing-instructions` |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration.mdx` | `#setup-instances-for-banner` | `#testing-instructions` |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration.mdx` | `#setup-instances-for-banner` | `#testing-instructions` |

## Category C — Native iOS IronSource installation

**File:** `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/installation.mdx`

**Issue:** Empty trailing heading with obsolete GitBook anchor:

```md
### &#x20;<a href="#import" id="import"></a>
```

**Fix:** Removed the empty heading block. Page now ends after the closing `</Tabs>` section.

## Files modified

| File | Change |
|---|---|
| `tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration.mdx` | Removed GitBook anchor on Testing instructions |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/configuration.mdx` | Removed GitBook anchor on Testing instructions |
| `tapmind-custom-adapter-sdk-integration/flutter-android-engine/ironsource-levelplay/configuration.mdx` | Removed GitBook anchor on Testing instructions |
| `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/ironsource-levelplay/configuration.mdx` | Removed GitBook anchor on Testing instructions |
| `tapmind-custom-adapter-sdk-integration/unity-android-engine/ironsource-levelplay/configuration.mdx` | Removed GitBook anchor on Testing instructions |
| `tapmind-custom-adapter-sdk-integration/unity-ios-engine/ironsource-levelplay/configuration.mdx` | Removed GitBook anchor on Testing instructions |
| `tapmind-custom-adapter-sdk-integration/native-ios-engine/ironsource-levelplay/installation.mdx` | Removed empty trailing heading |

**Total files modified:** 7

## Anchors updated

| Count | Detail |
|---|---|
| 6 | `#setup-instances-for-banner` → `#testing-instructions` (via heading cleanup) |
| 1 | `#import` empty heading removed |

## Validation results

| Check | Result |
|---|---|
| Custom fragment audit (`scripts/anchor-fix.js`) | **0 warnings** |
| Internal `href="#..."` in documentation MDX | **0 remaining** |
| `jamdesk validate` | **PASS** |
| `jamdesk broken-links` | **PASS** — no broken links (94 pages checked) |

## Confirmation

- **Remaining fragment warnings:** 0
- **Remaining broken links:** 0
