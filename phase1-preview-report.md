# Phase 1 Structural Preview — Report

**Date:** 2026-06-22  
**Scope:** Structural preview only — no full migration, no content rewrites, no snippet system.

---

## Summary

Phase 1 implements the proposed documentation architecture as a **preview**: new front-door pages, a reorganized sidebar, reference placeholders, and Native Android as the six-step pilot. All other platform pages remain unchanged in content; only their navigation position changed.

`jamdesk validate` completed successfully (docs.json valid, MDX syntax valid). Pre-existing broken image warnings in legacy `tapmind-custom-adapter-sdk-integration/` and `next-gen-sdk-integration/` source trees were not introduced by this work.

---

## Files Created

### Getting Started (front-door)

| File | Purpose |
|------|---------|
| `getting-started/introduction.mdx` | New site introduction (from Page Content doc) |
| `getting-started/how-custom-adapters-work.mdx` | Mental model / request flow / key terms |
| `getting-started/choose-your-sdk.mdx` | GMA vs Next-Gen vs Orchestration decision table |
| `getting-started/prerequisites.mdx` | Pre-integration checklist + links to Reference |

### Reference (placeholders)

| File | Purpose |
|------|---------|
| `reference/class-network-key-registry.mdx` | Purpose + placeholder registry table (`«CLASS:…»`, `«NETWORK-KEY»`) |
| `reference/compatibility-matrix.mdx` | Purpose + placeholder OS/version tables |
| `reference/troubleshooting.mdx` | Shared troubleshooting guidance |
| `reference/privacy-consent.mdx` | Privacy & consent placeholder with partner links |

### Deliverable

| File | Purpose |
|------|---------|
| `phase1-preview-report.md` | This report |

---

## Files Modified

| File | Change |
|------|--------|
| `docs.json` | Full sidebar restructure (Guides + Reference tabs); navbar → `/getting-started/introduction`; redirects for `/`, `/overview` |
| `guides/android/custom-adapter/admob.mdx` | Reorganized into 6-step headings (Prerequisites → Install → Configure AdMob → Verify) |
| `guides/android/custom-adapter/applovin.mdx` | Reorganized (Prerequisites → Install → Configure app → Configure AppLovin → Verify) |
| `guides/android/custom-adapter/google-ad-manager.mdx` | Reorganized (Prerequisites → Install → Configure GAM → Verify) |
| `guides/android/custom-adapter/ironsource-levelplay.mdx` | Reorganized (Prerequisites → Install → Configure app → Configure LevelPlay → Troubleshooting) |

**Note:** Native Android edits are manual heading reorganization only. No SDK versions, screenshots, or technical instructions were changed. Existing `DocTag*` snippet imports were preserved.

---

## Navigation Changes (`docs.json`)

### Before
- Top tabs: Overview, Android, iOS, Unity, Flutter, Cocos, React Native (platform-first)

### After
- **Guides** tab:
  - **Getting Started** — Introduction, How Custom Adapters Work, Choose your SDK, Prerequisites, Gradle Setup
  - **Custom Adapter GMA** — Native Android, Native iOS, Flutter, React Native, Unity, Cocos (nested mediation pages)
  - **Custom Adapter Next-Gen** — AdMob, Google Ad Manager (Android)
  - **Orchestration SDK** — 7 existing pages
- **Reference** tab:
  - Class & Network Key Registry, Compatibility Matrix, Troubleshooting, Privacy & Consent

### URL preservation
- All integration page paths unchanged (e.g. `/guides/android/custom-adapter/admob`)
- `/` and `/overview` redirect to `/getting-started/introduction`
- `overview.mdx` retained on disk (not deleted); no longer in primary nav

---

## Pages Intentionally Left Unchanged (content)

| Area | Pages |
|------|-------|
| Native iOS GMA | `guides/ios/custom-adapter/*` (4 mediation pages) |
| Flutter GMA | `guides/flutter/custom-adapter/*` (4 pages) |
| React Native GMA | `guides/react-native/custom-adapter/*` (4 pages) |
| Unity GMA | `guides/unity/custom-adapter/*` (4 pages) |
| Cocos GMA | `guides/cocos/custom-adapter/*` (2 pages) |
| Next-Gen | `guides/android/next-gen/admob.mdx`, `google-ad-manager.mdx` |
| Orchestration | `guides/android/orchestration-sdk/*` (7 pages) |
| Gradle Setup | `gradle-setup/for-gradle-version-7-plus.mdx` (nav only) |
| Legacy overview | `overview.mdx` (file kept; superseded by redirect) |
| Snippets | `snippets/doc-tag-*.mdx` (unchanged) |

---

## Native Android Pilot — Section Mapping

| Step | AdMob | AppLovin | GAM | LevelPlay |
|------|-------|----------|-----|-----------|
| 1 Prerequisites | App prerequisites callout | App prerequisites callout | App prerequisites callout | App prerequisites callout |
| 2 Install the SDK | Gradle + dependency | Gradle + dependency | Gradle + dependency | Gradle + dependency |
| 3 Configure your app | *(omitted — no app-level config)* | AndroidManifest GMA app ID | *(omitted)* | AndroidManifest GMA app ID |
| 4 Configure mediation | AdMob waterfall/custom event | MAX network + yield partner | GAM yield group/partner | LevelPlay network + instances |
| 5 Verify integration | Completion text + DocTag | DocTag + completion text | Completion text + DocTag | *(no dedicated verify section)* |
| 6 Troubleshooting | *(omitted — no page-specific content)* | *(omitted)* | *(omitted)* | Testing instructions (existing content) |

---

## Validation

```
jamdesk validate
✓ docs.json is valid
✓ MDX syntax valid
✓ No deprecated components found
⚠ 32 broken image references in legacy source trees (pre-existing, not in active guides/)
```

No broken internal links or MDX errors in Phase 1 pages.

---

## Remaining Work for Phase 2

1. **Fill Reference placeholders** — Replace `«CLASS:…»`, `«NETWORK-KEY»`, `«VERSION:…»`, `«MIN-ANDROID»`, `«MIN-IOS»` with canonical values; deduplicate class names from integration pages into the registry.
2. **Extend 6-step flow** to Native iOS, Flutter, React Native, Unity, and Cocos (content rearrange only, same approach as Android pilot).
3. **Snippet system** — Extract repeated Gradle blocks, manifest setup, DocTag sections, and mediation-dashboard callouts per the structure brief (not started in Phase 1).
4. **Build script alignment** — Update `scripts/build-os-mediation-guides.js` to emit 6-step headings for Android so rebuilds do not overwrite manual pilot edits.
5. **Next-Gen & Orchestration** — Apply structure brief page anatomy where applicable.
6. **Retire or redirect `overview.mdx`** — Decide whether to remove the orphan file or repoint it as an alias.
7. **Gradle Setup stub** — Page Content doc includes a fuller Gradle stub; evaluate whether to merge with existing `gradle-setup/for-gradle-version-7-plus.mdx`.
8. **Legacy tree cleanup** — Address 32 broken images in `tapmind-custom-adapter-sdk-integration/` and `next-gen-sdk-integration/` if those trees are still scanned by validation.
9. **Cross-linking** — Integration pages should link to Registry/Matrix instead of inline class names (after registry is populated).
10. **Deploy** — Run `jamdesk deploy` when ready to publish the structural preview to production.

---

## Out of Scope (confirmed not done)

- No snippet/imports created for new pages
- No migration of all 33 integration pages
- No deletion of existing documentation
- No SDK version changes
- No screenshot changes
- No invented content beyond supplied Page Content doc structure
