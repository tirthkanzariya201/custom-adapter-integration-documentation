# Part 3 — Custom Adapter Next-Gen (Android) — Report

**Date:** 2026-06-22  
**Scope:** Next-Gen AdMob + GAM pages on Android only (Part 3 of `tapmind-doc-page-content.md.pdf`)

---

## Summary

Both **Custom Adapter Next-Gen** mediation pages now use the same **6-step recipe** as GMA (Part 2), with Next-Gen-specific prerequisites, install deps, and class strings.

| Page | URL path |
|------|----------|
| AdMob | `/guides/android/next-gen/admob` |
| Google Ad Manager | `/guides/android/next-gen/google-ad-manager` |

---

## Changes

### New snippet
- `snippets/gma-prerequisites-next-gen-android.mdx` — Next-Gen Android prerequisites + scope callout (AdMob/GAM, Android only)

### Extended modules
- `scripts/gma/class-registry.js` — `next-gen-android` entries:
  - AdMob: `com.tapmind.mediation.ng.TapMindAdmobAdapter`
  - GAM: `com.tapmind.mediation.ng.TapMindGamAdapter`
- `scripts/gma/install-blocks.js` — Next-Gen packages (`2.0.1`) for `customadapter-admob-nextgen` / `customadapter-gam-nextgen`
- `scripts/gma/assemble-page.js` — `assembleNextGenPage()`
- `scripts/build-os-mediation-guides.js` — routes `next-gen` product through assembler

### Reused from Part 2
- Gradle repositories, verify integration, troubleshoot snippets
- Dashboard config templates (§2.7) with Next-Gen class strings

### Preserved
- Package versions: `2.0.1` (unchanged)
- GMA SDK: `play-services-ads:25.0.0`
- No Configure your app step (no manifest block on these pages)

---

## Page structure

1. Prerequisites  
2. Install the SDK  
3. Configure AdMob / Google Ad Manager  
4. Verify integration  
5. Troubleshooting  

*(Configure your app omitted — not required for Next-Gen AdMob/GAM on Android.)*

---

## Unchanged

- Custom Adapter GMA pages (Part 2)
- Getting Started (Part 1)
- Orchestration SDK
- `docs.json` navigation
