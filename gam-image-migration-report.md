# GAM Image Migration Report

**Date:** 2026-06-08

Migrated legacy `ca-docs.adster.tech` image references on Google Ad Manager README pages to local `/images/gam/` assets.

## Summary

| Metric | Value |
|---|---|
| Legacy URL references resolved | 8 |
| Local image path | `/images/gam/gam-company-configuration.png` |
| Image file size | 92400 bytes |
| Remaining ca-docs.adster.tech references in docs | 0 |
| Broken local image links | 0 |

## Original URL resolution

The legacy reference `https://ca-docs.adster.tech/custom-adapter-integration/android` was a **GitBook page URL**, not a direct image endpoint. It could not be downloaded as image bytes. The screenshot was recovered from the co-located GitBook asset `images/image.png` (originally `.gitbook/assets/image.png`), uploaded in the same commit as the GAM README pages.

## Migration mapping

| Original URL | New local path | Source |
|---|---|---|
| `https://ca-docs.adster.tech/custom-adapter-integration/android` | `/images/gam/gam-company-configuration.png` | Copied from `images/image.png (GitBook asset uploaded with GAM documentation)` |

## Files updated

- `tapmind-custom-adapter-sdk-integration/cocos-android-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/cocos-ios-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/flutter-android-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/flutter-ios-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/native-ios-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/unity-android-engine/google-ad-manager/README.md`
- `tapmind-custom-adapter-sdk-integration/unity-ios-engine/google-ad-manager/README.md`

## Validation

### Local image file

- `/images/gam/gam-company-configuration.png` — exists

### Legacy domain scan

No `ca-docs.adster.tech` references remain in documentation content.

### Image link check

All local `/images/` references resolve to files on disk.
