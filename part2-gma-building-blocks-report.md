# Part 2 — GMA Mediation Building Blocks — Report

**Date:** 2026-06-22  
**Scope:** Custom Adapter GMA mediation page building blocks (Part 2 of `tapmind-doc-page-content.md.pdf`)

---

## Summary

Part 2 introduces reusable **GMA building blocks** and rewires the build pipeline so all **Custom Adapter GMA** mediation pages (22 pages across 6 frameworks) are assembled from the **6-step recipe**:

1. Prerequisites  
2. Install the SDK  
3. Configure your app  
4. Configure {mediation}  
5. Verify integration  
6. Troubleshooting  

Next-Gen and Orchestration pages are **unchanged** (still built from GitBook source).

`jamdesk validate` passes (MDX valid, no snippet errors).

---

## Snippet files created (`snippets/gma-*.mdx`)

| Block | File | Source (PDF) |
|-------|------|----------------|
| 2.1 Prerequisites | `gma-prerequisites-native-android.mdx` … `gma-prerequisites-cocos.mdx` (6 files) | §2.1 |
| 2.2 Gradle repositories | `gma-gradle-repositories-android.mdx` | §2.2 |
| 2.3 App ID — Android | `gma-app-id-android.mdx` | §2.3 |
| 2.4 App ID — iOS | `gma-app-id-ios.mdx` | §2.4 |
| 2.5 Verify | `gma-verify-integration.mdx` | §2.5 |
| 2.6 Troubleshoot | `gma-troubleshoot.mdx` | §2.6 |

**Note:** JamDesk requires snippets at `snippets/` root (no subfolders). Imports use `/snippets/gma-{name}.mdx`.

---

## Build modules created (`scripts/gma/`)

| Module | Purpose |
|--------|---------|
| `class-registry.js` | Canonical class strings + LevelPlay network key per framework/OS (§2.7 values from live guides) |
| `install-blocks.js` | Per-cell install content (§2.8) with **current package versions** preserved |
| `dashboard-config.js` | Per-mediation dashboard steps (§2.7) — AdMob, AppLovin, GAM, LevelPlay |
| `assemble-page.js` | 6-step page assembler for native OS and wrapper frameworks |

---

## Build scripts updated

| Script | Change |
|--------|--------|
| `scripts/build-os-mediation-guides.js` | `custom-adapter` → `assembleNativeOsPage()` |
| `scripts/build-wrapper-mediation-guides.js` | `custom-adapter` → `assembleWrapperPage()` |

**Regenerate all GMA pages:**

```powershell
node scripts/build-os-mediation-guides.js
node scripts/build-wrapper-mediation-guides.js
```

---

## Pages rebuilt (22 Custom Adapter GMA)

| Framework | Pages |
|-----------|-------|
| Native Android | 4 mediations |
| Native iOS | 4 mediations |
| Unity | 4 mediations |
| Flutter | 4 mediations |
| React Native | 4 mediations |
| Cocos | 2 mediations (AdMob, GAM) |

---

## Intentionally unchanged

- `guides/android/next-gen/*` (2 pages)  
- `guides/android/orchestration-sdk/*` (7 pages)  
- Getting Started front-door pages (Part 1)  
- `docs.json` navigation  
- Legacy `snippets/doc-tag-*.mdx` (replaced on GMA pages by `gma-verify-integration.mdx`)

---

## Design decisions

- **Versions preserved** — Android deps (`2.1.13`, `2.1.16`, etc.) and wrapper package versions match pre–Part 2 live guides; not replaced with `«VERSION»` placeholders.
- **Class registry** — Uses live class strings (including Unity GAM Android `com.tapmimd.ads.mediation.adapter.TapMindAdapterAdmob` and LevelPlay key `15c101ba1`).
- **G-sheet → account manager** — Dashboard copy uses “provided by your account manager” per PDF branding appendix.
- **LevelPlay image** — `ironsource-configuration.jpeg` retained in dashboard block.
- **Page-specific testing** — IronSource “Testing instructions” appended under Troubleshooting from legacy config.

---

## Remaining work (Part 3+)

- **Part 3** — Custom Adapter Next-Gen (Android) 6-step assembly  
- **Part 4** — Orchestration SDK full content from PDF  
- **Part 5** — Reference pages (Class Registry, Compatibility Matrix) and link from troubleshoot/prerequisites  
- **Gradle stub** — Fill `gradle-setup/for-gradle-version-7-plus.mdx` from PDF Part 1 stub  
- **Deploy** — Run `jamdesk deploy` when ready to publish Part 2 to production  

---

## Validation

```
jamdesk validate
✓ docs.json is valid
✓ MDX syntax valid
✓ No snippet issues (after flattening snippet paths)
```
