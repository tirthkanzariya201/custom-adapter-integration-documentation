# GitBook → JamDesk Migration Assessment

**Repository:** `custom-adapter-integration-documentation`  
**Source analyzed:** `https://github.com/tirthkanzariya201/custom-adapter-integration-documentation`  
**GitBook content root:** `tapmind-custom-adapter-sdk-integration/`  
**Assessment date:** 2026-06-08  
**Scope:** Analysis only — no documentation files were modified.

---

## Executive Summary

The repository contains **94 GitBook documentation pages** plus GitBook configuration assets, coexisting with a **JamDesk starter template** (`docs.json`, `introduction.mdx`, `quickstart.mdx`, etc.) that is not yet wired to the GitBook content.

Migration is **moderately complex** but highly **pattern-driven**:

| Area | Risk | Notes |
|------|------|-------|
| Navigation | Low | `SUMMARY.md` maps cleanly to `docs.json` |
| Hints / callouts | Medium | 158 `{% hint %}` blocks across 68 files — automatable |
| Includes | Medium | 28 `{% include %}` references → JamDesk snippets |
| Tabs | Low | Only 3 files |
| Images | Medium | Local `.gitbook/assets/` paths must be relocated |
| Landing page | High | Root `README.md` uses GitBook HTML buttons |
| Changelog | None | No changelog / Updates content found |
| Legacy URLs | Medium | 8 pages embed old GitBook-hosted images |

**Estimated content pages requiring work:** 91 of 94 (3 pages are near-ready).

---

## 1. Repository Structure

### Top-level folders and files

```
custom-adapter-integration-documentation/
├── .gitbook/                          # GitBook assets & reusable includes
│   ├── assets/                        # 9 image files
│   └── includes/                      # 5 include/snippet files
├── api-reference/                     # JamDesk starter (not GitBook)
├── components/                        # JamDesk starter (not GitBook)
├── gradle-setup/                      # GitBook content (1 page)
├── openapi/                           # JamDesk starter (not GitBook)
├── tapmind-custom-adapter-sdk-integration/   # Primary GitBook content (92 pages)
├── writing/                           # JamDesk starter (not GitBook)
├── docs.json                          # JamDesk config (starter template — needs replacement)
├── introduction.mdx                   # JamDesk starter
├── quickstart.mdx                     # JamDesk starter
├── LICENSE
├── README.md                          # GitBook landing page
└── SUMMARY.md                         # GitBook sidebar navigation
```

### Documentation content folders

| Folder | Purpose | Page count |
|--------|---------|------------|
| `tapmind-custom-adapter-sdk-integration/` | Platform & mediation integration guides | 92 `.md` files |
| `gradle-setup/` | Android Gradle 7+ prerequisite | 1 `.md` file |
| `README.md` (root) | Site landing / platform picker | 1 `.md` file |

**Total GitBook pages:** 94

### Platform breakdown (`tapmind-custom-adapter-sdk-integration/`)

| Engine | Networks | Pages per network | Engine README |
|--------|----------|-------------------|---------------|
| `native-android-engine` | AdMob, AppLovin, GAM, IronSource/LevelPlay | README + installation + configuration | ✓ |
| `native-ios-engine` | AdMob, AppLovin, GAM, IronSource/LevelPlay | README + installation + configuration | ✓ |
| `unity-android-engine` | AdMob, AppLovin, GAM, IronSource/LevelPlay | README + installation + configuration | ✓ |
| `unity-ios-engine` | AdMob, AppLovin, GAM, IronSource/LevelPlay | README + installation + configuration | ✓ |
| `flutter-android-engine` | AdMob, AppLovin, GAM, IronSource/LevelPlay | README + installation + configuration | ✓ |
| `flutter-ios-engine` | AdMob, AppLovin, GAM, IronSource/LevelPlay | README + installation + configuration | ✓ |
| `cocos-android-engine` | AdMob, GAM only | README + installation + configuration | ✓ |
| `cocos-ios-engine` | AdMob, GAM only | README + installation + configuration | ✓ |

**8 engines × ~11–12 pages each ≈ 92 pages**

### GitBook-specific configuration files

| File / folder | Present | Notes |
|---------------|---------|-------|
| `SUMMARY.md` | ✅ Yes | Defines full sidebar (94 links, all resolve to existing files) |
| `.gitbook/` | ✅ Yes | Contains `assets/` and `includes/` |
| `.gitbook.yaml` | ❌ No | Not present in repository |
| `.gitbook/tags.yaml` | ❌ No | Not present |
| Other GitBook metadata | ❌ No | No `.gitbook.yaml`, no GitBook redirects file |

### JamDesk files already present (not from GitBook)

These appear to be from `jamdesk init` and are **not connected** to GitBook content:

- `docs.json` — still references starter `introduction`, `quickstart`, `writing/*`, `components/*`
- `introduction.mdx`, `quickstart.mdx`
- `api-reference/`, `components/`, `writing/`, `openapi/`

These will need to be replaced or removed during migration.

---

## 2. GitBook Feature Usage

### Syntax inventory

| GitBook syntax | Occurrences | Files affected | JamDesk equivalent |
|----------------|-------------|----------------|-------------------|
| `{% hint style="info" %}` | 158 open + 158 close | 68 files | `<Note>`, `<Info>`, or `<Callout type="info">` |
| `{% include "..." %}` | 28 | 28 `configuration.md` files | MDX snippet import from `/snippets/` (e.g. `import DocTag from '/snippets/doc-tag-admob-gam.mdx'`) |
| `{% tabs %}` | 5 | 3 files | `<Tabs>` / `<Tab>` components |
| `{% tab title="..." %}` | 9 | 3 files | `<Tab title="...">` |
| `{% endtab %}` | 14 | 3 files | `</Tab>` |
| `{% endtabs %}` | 5 | 3 files | `</Tabs>` |
| `{% content-ref %}` | 0 | — | N/A |
| `{% embed %}` | 0 | — | N/A |
| `{% swagger %}` | 0 | — | N/A |
| `{% openapi %}` | 0 | — | N/A |
| `{% updates %}` | 0 | — | N/A |
| `{% stepper %}` | 0 | — | N/A |
| `{% card %}` / `{% columns %}` | 0 | — | N/A |

**All hints use `style="info"` only** — no warning, danger, or success variants detected.

### Files with `{% tabs %}` (highest conversion complexity)

1. `native-ios-engine/applovin/installation.md` — CocoaPods vs SPM tabs (2 tab groups)
2. `native-ios-engine/ironsource-levelplay/installation.md` — CocoaPods vs SPM tabs (2 tab groups)
3. `unity-ios-engine/google-ad-manager/installation.md` — single iOS tab group

### Files with `{% include %}` (28 files — all `configuration.md`)

All references point to one of three include files:

| Include file | Used by | Content |
|--------------|---------|---------|
| `.gitbook/includes/doc-tag-admob-gam.md` | 16 configuration pages (AdMob + GAM) | Logcat debug tag note |
| `.gitbook/includes/doc-tag-ironsource.md` | 8 configuration pages | Logcat debug tag note |
| `.gitbook/includes/doc-tag-applovin.md` | 4 configuration pages | Logcat debug tag note |

Unused include files:

- `.gitbook/includes/untitled.md` — empty
- `.gitbook/includes/less-than-div-style-display-flex-f....md` — orphaned GitBook artifact

### Other GitBook / non-standard patterns

| Pattern | Occurrences | Files | JamDesk equivalent |
|---------|-------------|-------|-------------------|
| YAML frontmatter (`---`) | ~65 pages | README, configuration, network READMEs | JamDesk MDX frontmatter (`title`, `description`) |
| `<a class="button primary">` | 10 buttons | Root `README.md` | `<Card>` grid or `<Button>` / styled links |
| `<figure><img src="...">` | 8 | Cocos installation + IronSource configuration | Standard `![alt](/images/...)` or `<Frame>` |
| `<div align="left"><img>` | 6 | Unity installation pages | Standard markdown images |
| `[<br>](url)` legacy image embed | 8 | All `google-ad-manager/README.md` files | Replace with proper `<img>` or markdown image |
| `***` horizontal rules | Multiple | Root README, engine READMEs | `---` or `<Divider />` |
| `icon:` in frontmatter | 1 | Root `README.md` (`icon: mobile-screen`) | JamDesk page metadata or remove |

> **Note:** JamDesk's built-in `jamdesk migrate` command targets **Mintlify**, not GitBook. GitBook conversion will require a custom script or manual/semiautomated find-and-replace.

---

## 3. Navigation Analysis

### Current navigation (GitBook)

Navigation is defined entirely in **`SUMMARY.md`** (GitBook table of contents). Structure:

```
TapMind Custom Adapter SDK Integration (README.md)          ← Landing page
├── Native-Android Engine
│   ├── AdMob → Installation, Configuration
│   ├── Applovin → Installation, Configuration
│   ├── Google Ad Manager → Installation, Configuration
│   └── Ironsource - Levelplay → Installation, Configuration
├── Native-iOS Engine (same 4 networks)
├── Unity-Android Engine (same 4 networks)
├── Unity-iOS Engine (same 4 networks)
├── Flutter-Android Engine (same 4 networks)
├── Flutter-iOS Engine (same 4 networks)
├── Cocos-Android Engine (AdMob, GAM only)
└── Cocos-iOS Engine (AdMob, GAM only)

GRADLE SETUP (separate top-level section)
└── For Gradle Version 7+
```

**Landing page:** `README.md` (root) — platform picker with button links.

**Section hierarchy:** 3 levels deep

1. Engine (e.g. Native-Android)
2. Mediation network (e.g. AdMob)
3. Page type (README / Installation / Configuration)

**Coverage:** All 94 content files are linked in `SUMMARY.md`. No orphan pages. No broken SUMMARY links.

### Proposed JamDesk navigation tree (`docs.json`)

Recommend a **tabbed layout** mirroring the GitBook hierarchy. Page slugs assume `.md` → `.mdx` conversion with path preserved:

```json
{
  "name": "TapMind Custom Adapter SDK Integration",
  "navigation": {
    "tabs": [
      {
        "tab": "Get Started",
        "groups": [
          {
            "group": "Overview",
            "pages": ["index"]
          },
          {
            "group": "Prerequisites",
            "pages": ["gradle-setup/for-gradle-version-7+"]
          }
        ]
      },
      {
        "tab": "Native Android",
        "groups": [
          { "group": "Overview", "pages": ["tapmind-custom-adapter-sdk-integration/native-android-engine/README"] },
          { "group": "AdMob", "pages": [".../admob/README", ".../admob/installation", ".../admob/configuration"] },
          { "group": "AppLovin", "pages": [".../applovin/README", ".../applovin/installation", ".../applovin/configuration"] },
          { "group": "Google Ad Manager", "pages": [".../google-ad-manager/README", ".../google-ad-manager/installation", ".../google-ad-manager/configuration"] },
          { "group": "IronSource LevelPlay", "pages": [".../ironsource-levelplay/README", ".../ironsource-levelplay/installation", ".../ironsource-levelplay/configuration"] }
        ]
      },
      {
        "tab": "Native iOS",
        "groups": ["...same pattern..."]
      },
      {
        "tab": "Unity Android",
        "groups": ["...same pattern..."]
      },
      {
        "tab": "Unity iOS",
        "groups": ["...same pattern..."]
      },
      {
        "tab": "Flutter Android",
        "groups": ["...same pattern..."]
      },
      {
        "tab": "Flutter iOS",
        "groups": ["...same pattern..."]
      },
      {
        "tab": "Cocos Android",
        "groups": [
          { "group": "Overview", "pages": [".../cocos-android-engine/README"] },
          { "group": "AdMob", "pages": [".../admob/README", ".../admob/installation", ".../admob/configuration"] },
          { "group": "Google Ad Manager", "pages": [".../google-ad-manager/README", ".../google-ad-manager/installation", ".../google-ad-manager/configuration"] }
        ]
      },
      {
        "tab": "Cocos iOS",
        "groups": ["...same as Cocos Android..."]
      }
    ]
  }
}
```

**Alternative (simpler):** Single sidebar with nested groups (no tabs) — closer to GitBook UX but longer scroll. Given 8 engines, **tabs per engine** are recommended.

**Landing page mapping:** Convert root `README.md` → `index.mdx` and set as default route.

---

## 4. Content Migration Risk Assessment

### Summary by classification

| Classification | Count | % |
|----------------|-------|---|
| Ready for migration | 3 | 3% |
| Requires syntax conversion | 83 | 88% |
| Requires manual review | 8 | 9% |

### Ready for migration (3 pages)

| Page | Reasoning |
|------|-----------|
| `gradle-setup/for-gradle-version-7+.md` | Plain markdown, no GitBook syntax, no images |
| `unity-android-engine/admob/installation.md` | Plain markdown steps only |
| `unity-ios-engine/admob/installation.md` | Plain markdown steps only |

> These still need `.md` → `.mdx` rename and `docs.json` registration.

### Requires syntax conversion (83 pages)

All remaining pages in `tapmind-custom-adapter-sdk-integration/` except the 8 GAM READMEs below.

**Common conversion needs:**

| Page type | Typical patterns | Effort |
|-----------|------------------|--------|
| `configuration.md` (28) | 4–7 hints + 1 include + optional image | Medium — templated |
| `installation.md` (30) | 1–2 hints; 3 files also have tabs | Low–Medium |
| `README.md` — engine (8) | 1 hint + frontmatter | Low |
| `README.md` — network (28) | 1 hint + frontmatter; 8 GAM pages also have legacy embeds | Low–Medium |
| Root `README.md` | HTML buttons, frontmatter, horizontal rules | High (see manual review) |

### Requires manual review (8 pages)

| Page | Reasoning |
|------|-----------|
| `README.md` (root) | GitBook HTML button grid; duplicate Unity-Android link; malformed Gradle button (`7+</a>` missing `)`); must be redesigned with JamDesk `<Card>` components |
| `*/google-ad-manager/README.md` (8 engines) | Contains `[<br>](https://ca-docs.adster.tech/...)` — embedded screenshot from **legacy GitBook deployment**; image will break unless re-hosted |

**GAM README files requiring manual image fix:**

- `native-android-engine/google-ad-manager/README.md`
- `native-ios-engine/google-ad-manager/README.md`
- `unity-android-engine/google-ad-manager/README.md`
- `unity-ios-engine/google-ad-manager/README.md`
- `flutter-android-engine/google-ad-manager/README.md`
- `flutter-ios-engine/google-ad-manager/README.md`
- `cocos-android-engine/google-ad-manager/README.md`
- `cocos-ios-engine/google-ad-manager/README.md`

---

## 5. Images & Assets

### Image files in repository

**Location:** `.gitbook/assets/` (9 files)

| File | Referenced in content | Status |
|------|----------------------|--------|
| `image (9).jpeg` | 4× IronSource `configuration.md` (all platforms) | ✅ Used — must relocate |
| `cocos-extension-guide (1).png` | 4× Cocos `installation.md` (Android + iOS, AdMob + GAM) | ✅ Used — must relocate |
| `cocos-extension-guide.png` | — | ⚠️ Unused duplicate |
| `image.png` | — | ⚠️ Unused |
| `image (1).png` through `image (5).png` | — | ⚠️ Unused |

### External images (will continue working)

| Source | Used in | Risk |
|--------|---------|------|
| `https://developers.google.com/static/admob/images/...` | Unity Applovin/IronSource installation pages | Low — third-party CDN |
| `https://ca-docs.adster.tech/custom-adapter-integration/android` | 8 GAM README pages | **High** — legacy GitBook host; likely broken after GitBook decommission |

### Asset migration recommendation

1. Move used assets to `/images/` (JamDesk convention)
2. Update 8 content references from `../../../.gitbook/assets/...` → `/images/...`
3. Download and re-host GAM configuration screenshots from `ca-docs.adster.tech` before that site is retired
4. Optionally delete 6 unused asset files after migration

### Relative path impact

Current image paths are **3 levels deep** relative references (`../../../.gitbook/assets/`). These **will not work** in JamDesk without:

- Moving assets to a public `/images/` folder, and
- Updating all references to absolute site paths

---

## 6. Internal Links

### Link types found

| Link type | Count | Migration impact |
|-----------|-------|------------------|
| External HTTPS links | ~60+ | ✅ No change needed |
| `SUMMARY.md` internal links | 94 | ⚠️ Replaced by `docs.json` — file not needed post-migration |
| Root `README.md` HTML `href` links | 10 | ❌ Must update to JamDesk routes (no `.md`, no trailing `/`) |
| `[<br>](ca-docs.adster.tech)` | 8 | ❌ Broken legacy embeds — manual fix |
| Cross-page markdown links | 0 | None found between content pages |
| `{% content-ref %}` | 0 | None |

### Links likely to break in JamDesk

| Source | Link pattern | Issue |
|--------|--------------|-------|
| Root `README.md` | `href="tapmind-custom-adapter-sdk-integration/native-android-engine/"` | GitBook directory-style URL; JamDesk uses slug-based routes |
| Root `README.md` | `href="gradle-setup/for-gradle-version-7+.md"` | `.md` extension + `+` character in slug needs encoding |
| GAM READMEs (×8) | `https://ca-docs.adster.tech/custom-adapter-integration/android` | External legacy host |
| Image refs (×8) | `../../../.gitbook/assets/...` | Relative GitBook asset paths |

### Links that will work unchanged

All standard markdown links to external documentation (Google AdMob, CocoaPods, GitHub repos, AppLovin dashboard, etc.) require no changes.

---

## 7. Changelog Pages

### Findings

| Item | Result |
|------|--------|
| `{% updates %}` blocks | **0** found |
| Changelog / release pages | **None** |
| `CHANGELOG.md` | **Not present** |
| References to "changelog" | **None** |

### Recommendation

**No changelog migration required** for this repository. If release notes are needed on JamDesk in the future, create a new changelog section using JamDesk-native content (MDX pages or a dedicated updates component) rather than porting GitBook Updates blocks.

---

## 8. Migration Plan

### Phase 1 — Safe automated changes

1. **Remove JamDesk starter template** files not needed (`introduction.mdx`, `quickstart.mdx`, `writing/`, `components/`, `api-reference/`, `openapi/example-api.yaml`) or archive them on a branch.
2. **Relocate assets:** `.gitbook/assets/` → `/images/` (copy only the 2 used files; optionally all 9).
3. **Create snippets:** Convert 3 include files to `/snippets/doc-tag-*.mdx`.
4. **Bulk syntax conversion script:**
   - `{% hint style="info" %}...{% endhint %}` → `<Note>...</Note>`
   - `{% include "..." %}` → MDX import statements
   - `{% tabs %}` / `{% tab %}` → `<Tabs>` / `<Tab>`
   - `---` GitBook frontmatter → JamDesk `title` / `description` frontmatter
5. **Rename files:** `.md` → `.mdx` (94 content files).
6. **Generate `docs.json`** navigation from `SUMMARY.md` (scriptable — 1:1 mapping).
7. **Update image paths** in 8 files to `/images/...`.

### Phase 2 — Manual review required

1. **Redesign landing page** (`README.md` → `index.mdx`):
   - Replace GitBook HTML buttons with JamDesk `<Card>` components
   - Fix duplicate Unity-Android button
   - Fix malformed Gradle Setup button markup
2. **GAM README screenshots (8 files):**
   - Download images from `ca-docs.adster.tech` while still accessible
   - Re-host in `/images/gam-configuration/`
   - Replace `[<br>](url)` with proper image markdown
3. **Review native iOS installation tabs** — large CocoaPods/SPM content blocks; verify tab rendering and code block formatting in JamDesk preview.
4. **Verify IronSource configuration screenshot** (`image (9).jpeg`) displays correctly after move.
5. **Review Cocos installation screenshots** for clarity after migration.
6. **Delete obsolete files:** `SUMMARY.md`, `.gitbook/includes/untitled.md`, unused assets (optional, after validation).

### Phase 3 — JamDesk validation

```bash
jamdesk validate                  # docs.json schema + MDX syntax
jamdesk broken-links              # internal link check
jamdesk spellcheck                # optional content QA
jamdesk dev                       # local preview at localhost:3000
jamdesk deploy --detach           # staging deploy (after jamdesk login)
```

**Validation checklist:**

- [ ] All 94 pages render without MDX errors
- [ ] Navigation matches GitBook hierarchy
- [ ] All 8 local images display
- [ ] GAM configuration screenshots visible on 8 README pages
- [ ] Snippet imports resolve on 28 configuration pages
- [ ] Tabs render on 3 iOS installation pages
- [ ] Landing page cards link to correct engine pages
- [ ] No references to `.gitbook/` paths remain
- [ ] `docs.json` name, theme, and colors match TapMind branding

---

## Appendix A — File counts

| Category | Count |
|----------|-------|
| Total `.md` / `.mdx` in repo | 111 |
| GitBook content pages | 94 |
| JamDesk starter pages | 10 |
| GitBook include files | 5 |
| Image assets | 9 |
| Engines documented | 8 |
| Mediation networks (max) | 4 per engine |

## Appendix B — Include → Snippet mapping

| GitBook include | Target snippet | Import in configuration pages |
|-----------------|----------------|-------------------------------|
| `doc-tag-admob-gam.md` | `snippets/doc-tag-admob-gam.mdx` | AdMob + GAM configuration (16 pages) |
| `doc-tag-ironsource.md` | `snippets/doc-tag-ironsource.mdx` | IronSource configuration (8 pages) |
| `doc-tag-applovin.md` | `snippets/doc-tag-applovin.mdx` | AppLovin configuration (4 pages) |

## Appendix C — Known content issues (pre-existing)

1. Root `README.md` lists **Unity-Android Engine** twice (lines 27–28); second entry likely intended as duplicate or error.
2. Gradle Setup button HTML is **malformed** — missing closing parenthesis in anchor text.
3. `unity-ios-engine/google-ad-manager/installation.md` tab is titled **"IOS"** but content is Unity Package Manager steps (naming inconsistency).

---

*End of migration assessment report.*
