# Documentation Review Report

**Date:** 2026-07-07  
**Mode:** Local review only — **not deployed** to production  
**Baseline compared:** `git HEAD` → local working tree

---

## Summary

Implemented the requested documentation updates locally for side-by-side review against [docs.tapmind.io](https://docs.tapmind.io). Changes span product renaming (GMA Next-Gen SDK), navigation/slug updates, introduction and prerequisites copy, theme behaviour, Gradle code-block spacing, and a redesigned Compatibility Matrix with copyable adapter class strings.

---

## Review build location

| Resource | Path / command |
|----------|----------------|
| **Highlighted diff viewer** | `review-build/index.html` (open in a browser) |
| **Per-file diffs** | `review-build/*.html` |
| **Highlight legend** | 🟢 Added · 🔴 Removed · 🟡 Modified (paired lines) |
| **Live local preview** | `npx jamdesk dev --port 3456` → http://localhost:3456 |
| **Production comparison** | https://docs.tapmind.io |

Regenerate highlights after further edits:

```bash
node scripts/generate-review-build.js
```

Highlights exist **only** in `review-build/` and are **not** part of published MDX.

---

## Files modified

| File | Change type |
|------|-------------|
| `docs.json` | Tab title, description, `appearance`, nav paths, slug redirects |
| `style.css` | Gradle compact code-block spacing |
| `getting-started/introduction.mdx` | Choose SDK line, GMA Next-Gen naming, docs flow |
| `getting-started/prerequisites.mdx` | Redesigned “What TapMind provides” section |
| `getting-started/choose-your-sdk.mdx` | GMA Next-Gen naming (redirect page) |
| `gradle-setup/for-gradle-version-7-plus.mdx` | Compact Gradle code wrapper |
| `reference/compatibility-matrix.mdx` | Package table, copyable classes, framework notes |
| `reference/class-network-key-registry.mdx` | Regenerated section title |
| `reference/troubleshooting.mdx` | GMA Next-Gen namespace wording |
| `overview.mdx` | GMA Next-Gen naming and links |
| `snippets/shared/gma-prerequisites-next-gen-android.mdx` | Product name |
| `guides/android/custom-adapter-gma-next-gen-sdk/admob.mdx` | Regenerated (renamed path) |
| `guides/android/custom-adapter-gma-next-gen-sdk/google-ad-manager.mdx` | Regenerated (renamed path) |
| `scripts/build-os-mediation-guides.js` | Product key + label |
| `scripts/generate-registry-page.js` | Section title |
| `scripts/generate-slug-redirects.js` | New slug destinations |
| `scripts/generate-review-build.js` | **New** — review diff generator |
| `scripts/llms-full.txt` | Regenerated export |
| `scripts/sitemap-pages.txt` | Regenerated sitemap |
| `review-build/index.html` | **New** — review index |
| `review-build/review-highlights.css` | **New** — review-only styles |

**Directory rename:** `guides/android/custom-adapter-next-gen-sdk/` → `guides/android/custom-adapter-gma-next-gen-sdk/`

---

## Pages affected (navigation)

| Page | URL slug (local) |
|------|------------------|
| Introduction | `/getting-started/introduction` |
| Prerequisites | `/getting-started/prerequisites` |
| Gradle Setup | `/gradle-setup/for-gradle-version-7-plus` |
| Compatibility Matrix | `/reference/compatibility-matrix` |
| Class & Network Key Registry | `/reference/class-network-key-registry` |
| Troubleshooting | `/reference/troubleshooting` |
| AdMob (GMA Next-Gen) | `/guides/android/custom-adapter-gma-next-gen-sdk/admob` |
| Google Ad Manager (GMA Next-Gen) | `/guides/android/custom-adapter-gma-next-gen-sdk/google-ad-manager` |
| Top tab | **Custom Adapter (GMA Next-Gen SDK)** |

**Redirects added** from old slug `/guides/android/custom-adapter-next-gen-sdk/*` → new paths.

---

## Content added

- `docs.json` → `appearance: { default: "system", strict: true }` (hides light/dark toggle; follows OS)
- Introduction → GMA Next-Gen SDK bullet label
- Prerequisites → **What TapMind provides** (static Registry values vs account-manager values), Info callouts
- Compatibility Matrix → **Custom adapter classes** section with fenced code blocks (JamDesk copy button)
- Compatibility Matrix → AdMob/GAM Adapter display names; GMA Next-Gen rows
- `style.css` → `.gradle-code-compact` tighter line-height for Gradle repository block
- `review-build/` → full diff review UI

---

## Content removed

- Introduction → word **“version”** from account-manager line (“suitable for your app”)
- Introduction → previous flow text (“Pick your SDK product, then your mediation partner, then your platform.”)
- Prerequisites → **Two kinds of values** table and combined Registry wording
- Compatibility Matrix → **Version** column
- Compatibility Matrix → **Required mediation SDK** column (merged into single **Required GMA SDK**)
- Compatibility Matrix → internal package IDs (`customadapter-admob`, etc.) from the public table
- Navbar → light/dark mode selector (via `appearance.strict`)

---

## Content modified

| Area | Before | After |
|------|--------|-------|
| Product name | Custom Adapter (Next-Gen SDK) | Custom Adapter (GMA Next-Gen SDK) |
| Slug | `custom-adapter-next-gen-sdk` | `custom-adapter-gma-next-gen-sdk` |
| How to use these docs | Product → mediation → platform | **Choose platform → choose mediation** |
| Framework notes | “native deps” | “native dependencies” |
| Package table labels | `customadapter-*` IDs | AdMob Adapter, GAM Adapter, etc. |
| Troubleshooting | “Next-Gen namespace” | “GMA Next-Gen namespace” |

---

## Assumptions made

1. **Slug rename:** `custom-adapter-next-gen-sdk` → `custom-adapter-gma-next-gen-sdk` (keeps “custom-adapter” prefix consistent with GMA SDK tab).
2. **Prerequisites redesign:** Converted HTML mockup to MDX using `<Info>` callouts; kept content above “What TapMind provides” unchanged.
3. **Copy behaviour:** Fenced code blocks on Compatibility Matrix (JamDesk native copy) rather than inline table backticks on the Registry page.
4. **Package table:** Removed version column; kept AppLovin / LevelPlay / Orchestration rows with descriptive adapter names.
5. **Theme:** `appearance.default: "system"` + `strict: true` per JamDesk docs (system preference, no manual toggle).
6. **Legacy source trees** (`next-gen-sdk-integration/`, `tapmind-custom-adapter-sdk-integration/`) left unchanged — not in navigation.

---

## Requires developer confirmation

| Item | Status | Notes |
|------|--------|-------|
| **Gradle two approaches** (`settings.gradle` vs `allprojects`) | **Requires Developer Confirmation** | Documented in `gradle-setup/for-gradle-version-7-plus.mdx` and mediation install pages. This repo contains documentation only — SDK/Gradle implementation not verifiable here. |
| **Required GMA SDK 25.0.0** (AdMob + GAM) | Partially verified | Matches `scripts/gma/install-blocks.js` (`play-services-ads:25.0.0`) and `scripts/gma/doc-constants.js`. Confirm minimum with account manager / release engineering before publish. |
| **GMA Next-Gen GMA version** | **Requires Developer Confirmation** | Next-Gen packages use the same `25.0.0` constant in build scripts; confirm next-gen API minimum independently. |
| **placementName / eCPM from account manager only** | **Requires Developer Confirmation** | Per `prerequisites-tapmind-provides-redesign.html` note — confirm these are never published in the shared Registry. |
| **Wrapper vs native GAM class behaviour** | Documented in Troubleshooting | Registry table still shows AdMob class for wrapper GAM rows (existing behaviour). |

---

## Validation results

| Check | Result |
|-------|--------|
| `npx jamdesk validate` | **PASS** — docs.json valid, MDX syntax valid |
| `npx jamdesk broken-links` | **PASS** — no broken links (39 nav pages) |
| Renamed slugs | Redirects from old `custom-adapter-next-gen-sdk` paths added |
| Pre-existing image warnings | 32 broken refs in legacy GitBook source trees (unchanged, not in nav) |
| Deploy | **Not run** (per review-mode instructions) |

---

## How to review side-by-side

1. Open **`review-build/index.html`** for highlighted line-by-line diffs.
2. Run **`npx jamdesk dev --port 3456`** for the full local site.
3. Open **https://docs.tapmind.io** in another window/tab for production comparison.
4. Key pages to compare:
   - Introduction → Choose your SDK / How to use these docs
   - Prerequisites → What TapMind provides
   - Gradle Setup → code block spacing
   - Compatibility Matrix → package table + copyable classes
   - Custom Adapter (GMA Next-Gen SDK) tab → title and URLs
   - Navbar → theme toggle removed (system theme only)

When approved, deploy with `npx jamdesk deploy` (not run in this pass).
