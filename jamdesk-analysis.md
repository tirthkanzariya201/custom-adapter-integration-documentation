# JamDesk Navigation & Content Analysis

**Repository analyzed:** `custom-adapter-integration-documentation`  
**GitHub:** `https://github.com/tirthkanzariya201/custom-adapter-integration-documentation`  
**Local workspace:** `Tapmind CA Integration`  
**Date:** 2026-06-08  
**Scope:** Analysis only — no files modified.

---

## Executive Summary

JamDesk does **not** auto-discover documentation folders. It renders **only** pages explicitly listed in `docs.json` → `navigation`, resolved as `{slug}.mdx` or `{slug}.md` relative to the project root.

`tapmind-custom-adapter-sdk-integration/` is invisible to JamDesk today because:

1. **`docs.json` navigation points exclusively at the JamDesk starter template** (`introduction`, `quickstart`, `writing/*`, `components/*`, `api-reference/*`).
2. **No GitBook file is registered in navigation** — not `README.md`, not `SUMMARY.md`, and not any path under `tapmind-custom-adapter-sdk-integration/`.
3. **JamDesk never reads `SUMMARY.md`** — that file is GitBook-only.
4. **Even after adding paths to navigation**, GitBook syntax (`{% hint %}`, `{% include %}`, etc.) in the `.md` files will cause **MDX parse failures** until converted.

Additionally, the **local workspace** (`Tapmind CA Integration`) currently contains **only** the JamDesk starter from `jamdesk init` — the GitBook content exists on GitHub (and in the local `_migration-analysis/` clone) but is **not present** in the workspace root.

---

## How JamDesk Builds Navigation and Content

### Content model (from JamDesk CLI v1.1.132 source)

```
docs.json (project root)
    └── navigation.pages[]  ──►  explicit list of page slugs
                                      │
                                      ▼
                            {slug}.mdx  (preferred)
                            {slug}.md   (fallback)
```

| Behavior | Detail |
|----------|--------|
| **Navigation source** | `docs.json` → `navigation` only |
| **Content source** | Files on disk matching navigation slugs |
| **Auto-indexing** | None — folders are not scanned for sidebar entries |
| **File extensions** | `.mdx` preferred; `.md` accepted if `.mdx` missing |
| **URL routing** | Slug path becomes URL (e.g. `introduction` → `/introduction`) |
| **Landing page** | First page in navigation, or pages configured via navbar — **not** auto-detected from `README.md` |
| **Search indexing** | Navigation-referenced pages (build includes nav pages; dev server watches all `**/*.{mdx,md}`) |

### Project root discovery (`findProjectDir`)

When you run `jamdesk dev` or `jamdesk validate`, JamDesk locates `docs.json` in this order:

1. Current working directory
2. `./jamdesk/docs.json`
3. `./docs/docs.json`
4. `./documentation/docs.json`

If none found → error: *"docs.json not found"*.

**This repository:** `docs.json` is at the **repository root** — no `docs/` subfolder is used.

### Assets JamDesk serves (when present)

| Path | Purpose |
|------|---------|
| `images/` | Static images referenced in MDX |
| `logo/` | Branding assets |
| `public/` | Additional static files |
| `snippets/` | Reusable MDX fragments (imported in pages) |
| `openapi/` | OpenAPI specs referenced in `docs.json` → `api.openapi` |
| `style.css` | Custom CSS (optional) |

JamDesk does **not** serve `.gitbook/assets/` unless those files are copied to `images/` or `public/` and references are updated.

---

## 1. JamDesk Configuration Files

### Primary configuration

| File | Role | Present in repo | Currently used |
|------|------|-----------------|----------------|
| **`docs.json`** | Site name, theme, colors, navbar, **navigation**, OpenAPI refs | ✅ Root | ✅ Yes — controls everything JamDesk renders |

### Optional / supporting configuration

| File | Role | Present | Used by JamDesk |
|------|------|---------|-----------------|
| `~/.jamdeskrc` | CLI defaults (port, verbose) | User machine only | CLI only |
| `style.css` | Custom styling | ❌ Not in repo | Would apply if added |
| `openapi/*.yaml` | API reference specs | ✅ `openapi/example-api.yaml` | ✅ Referenced in starter `docs.json` |
| `.gitignore` | Excludes `.jamdesk/` cache | ✅ Local workspace | Deploy/upload only |

### Files JamDesk does NOT use as configuration

| File | Platform | JamDesk reads it? |
|------|----------|-------------------|
| `SUMMARY.md` | GitBook sidebar | ❌ **No** |
| `README.md` | GitBook landing / GitHub | ❌ **No** (unless slug `README` added to `navigation`) |
| `.gitbook.yaml` | GitBook config | ❌ Not present; would be ignored |
| `.gitbook/` | GitBook assets/includes | ❌ Not indexed; assets not served from this path |

### JamDesk starter files (content, not config)

These exist in the GitHub repo and local workspace but are **content pages**, only rendered when listed in `navigation`:

- `introduction.mdx`
- `quickstart.mdx`
- `writing/pages.mdx`, `writing/components.mdx`, `writing/code-blocks.mdx`
- `components/cards.mdx`, `components/callouts.mdx`, `components/tabs-and-accordions.mdx`, `components/steps.mdx`
- `api-reference/openapi-example.mdx`, `api-reference/request-response-examples.mdx`

---

## 2. Which Folders JamDesk Is Indexing

### Answer: None automatically

JamDesk does **not** index or crawl folders. It only loads pages whose slugs appear in `docs.json` → `navigation`.

### Folders currently rendered (via `docs.json`)

Because navigation lists only starter pages, JamDesk currently renders **10 pages** from:

```
introduction.mdx
quickstart.mdx
writing/
components/
api-reference/
openapi/          ← spec only, not a page
```

### Folders present but NOT rendered

```
tapmind-custom-adapter-sdk-integration/   ← 92 GitBook .md files — NOT in navigation
gradle-setup/                             ← 1 .md file — NOT in navigation
README.md                                 ← root landing — NOT in navigation
.gitbook/                                 ← assets/includes — NOT served
SUMMARY.md                                ← ignored entirely
LICENSE                                   ← not a doc page
```

---

## 3. Is JamDesk Reading README.md, SUMMARY.md, docs/, or Another Folder?

| Source | Read by JamDesk? | Evidence |
|--------|------------------|----------|
| **`README.md`** | ❌ No (unless added to navigation as slug `README`) | `navigation-validator.js` only checks paths from `docs.json`; `init` explicitly excludes `README.md` from starter template |
| **`SUMMARY.md`** | ❌ No | Zero references in JamDesk CLI source; GitBook-only TOC format |
| **`docs/` folder** | ❌ Not used here | `findProjectDir` would use `docs/docs.json` if it existed; this repo has `docs.json` at root |
| **`tapmind-custom-adapter-sdk-integration/`** | ❌ Not in navigation | 92 files on disk in GitHub repo; zero navigation entries |
| **`docs.json` navigation** | ✅ **Yes — sole source** | `extractNavigationPages()` walks `navigation` tree |

### Monorepo note

JamDesk cloud builds support a dashboard **Docs Path** setting for repos where `docs.json` lives in a subdirectory (`docs/`, `jamdesk/`, `documentation/`). This repo uses the **root** — no Docs Path override needed.

---

## 4. Why `tapmind-custom-adapter-sdk-integration/` Is Not Appearing

### Root cause chain

```
GitBook content on disk
        │
        ▼
   SUMMARY.md defines sidebar          docs.json defines sidebar
   (GitBook reads this)               (JamDesk reads this)
        │                                      │
        ▼                                      ▼
   94 pages linked                    10 starter pages linked
        │                                      │
        ▼                                      ▼
   Visible on GitBook                  Visible on JamDesk
                                              │
                                              ▼
                              tapmind-custom-adapter-sdk-integration/
                              NEVER referenced → NEVER rendered
```

### Specific blockers

| # | Blocker | Impact |
|---|---------|--------|
| 1 | **Not in `docs.json` navigation** | Pages never appear in sidebar or routing |
| 2 | **`SUMMARY.md` is ignored** | GitBook TOC has no effect on JamDesk |
| 3 | **GitBook syntax in `.md` files** | Adding to nav without conversion → MDX compile errors (`{% hint %}`, etc.) |
| 4 | **`.gitbook/assets/` image paths** | Images break even if pages are added (wrong path for JamDesk) |
| 5 | **Local workspace missing content** | `Tapmind CA Integration` workspace has no `tapmind-custom-adapter-sdk-integration/` folder (only `_migration-analysis/` clone) |

### What would NOT fix it alone

- Renaming folders
- Keeping `SUMMARY.md` as-is
- Adding a `docs/` directory without moving `docs.json`
- Pushing GitBook `.md` files without updating `docs.json`

---

## 5. Current State Report

### Current JamDesk content source

| Item | Value |
|------|-------|
| **Active content** | JamDesk starter template (10 `.mdx` pages) |
| **Config file** | `docs.json` at repository root |
| **Site name in GitHub repo** | `"Documentation"` (starter default) |
| **Site name in local workspace** | `"Tapmind CA Integration"` (customized) |
| **OpenAPI** | Example spec only (`openapi/example-api.yaml`) |

### Current navigation source

**File:** `docs.json` → `navigation.tabs`

```json
{
  "tabs": [
    {
      "tab": "Docs",
      "groups": [
        { "group": "Get Started", "pages": ["introduction", "quickstart"] },
        { "group": "Writing Content", "pages": ["writing/pages", "writing/components", "writing/code-blocks"] },
        { "group": "API Pages", "pages": ["api-reference/openapi-example", "api-reference/request-response-examples"] }
      ]
    },
    {
      "tab": "Components",
      "groups": [
        { "group": "Built-In Components", "pages": ["components/cards", "components/callouts", "components/tabs-and-accordions", "components/steps"] }
      ]
    }
  ]
}
```

**Navbar:** `"Get Started"` button → `/introduction`

### GitBook content source (not connected)

| Item | Value |
|------|-------|
| **Navigation** | `SUMMARY.md` (94 links) |
| **Landing** | `README.md` |
| **Content root** | `tapmind-custom-adapter-sdk-integration/` + `gradle-setup/` |
| **Assets** | `.gitbook/assets/` (9 images) |
| **Snippets** | `.gitbook/includes/` (3 used includes) |

---

## 6. Required Changes for JamDesk to Render GitBook Documentation

### Mandatory

1. **Replace `docs.json` navigation** — map all 94 GitBook pages from `SUMMARY.md` into `navigation` (tabs/groups structure).
2. **Register landing page** — add root `README.md` as slug `README` or convert to `index.mdx`.
3. **Convert GitBook syntax to MDX** — `{% hint %}`, `{% include %}`, `{% tabs %}` → JamDesk components (see `migration-report.md`).
4. **Relocate images** — `.gitbook/assets/` → `images/` and update 8 content references.
5. **Create snippets** — convert 3 `.gitbook/includes/*.md` → `snippets/*.mdx`.
6. **Sync local workspace with GitHub** — pull/merge `custom-adapter-integration-documentation` so content exists where `jamdesk dev` runs.

### Recommended

7. **Remove starter template from navigation** (or delete starter files) once GitBook content is wired.
8. **Update `navbar.primary.href`** — point to GitBook landing (`/README` or `/`) instead of `/introduction`.
9. **Remove unused `api.openapi`** starter reference unless a real API spec is needed.
10. **Fix 8 GAM README legacy image embeds** (`ca-docs.adster.tech` URLs).

### Not required

- Keeping `SUMMARY.md` (can archive after `docs.json` is complete)
- Creating a `docs/` folder (root layout is valid)
- Renaming `tapmind-custom-adapter-sdk-integration/` (slug paths can match folder structure)

---

## 7. Proposed Exact File Changes

> **Note:** These are proposed changes only — not applied. A script should generate the full `navigation` block from `SUMMARY.md` (94 entries).

### Change 1 — Replace `docs.json`

**File:** `docs.json`

**Actions:**
- Set `name` to `"TapMind Custom Adapter SDK Integration"`
- Remove or empty `api.openapi` starter reference (unless needed)
- Replace entire `navigation` block
- Update `navbar.primary` to point at landing page

**Proposed structure (representative — full tree has 94 pages):**

```json
{
  "$schema": "https://jamdesk.com/docs.json",
  "name": "TapMind Custom Adapter SDK Integration",
  "description": "Integration guide for TapMind Custom Adapter SDK across mobile platforms and game engines.",
  "theme": "jam",
  "colors": {
    "primary": "#635BFF",
    "light": "#7C75FF",
    "dark": "#4F46E5"
  },
  "navbar": {
    "primary": {
      "type": "button",
      "label": "Get Started",
      "href": "/README"
    }
  },
  "navigation": {
    "tabs": [
      {
        "tab": "Overview",
        "icon": "book-open",
        "groups": [
          {
            "group": "Getting Started",
            "pages": [
              "README",
              "gradle-setup/for-gradle-version-7+"
            ]
          }
        ]
      },
      {
        "tab": "Native Android",
        "icon": "mobile-screen",
        "groups": [
          {
            "group": "Engine",
            "pages": ["tapmind-custom-adapter-sdk-integration/native-android-engine/README"]
          },
          {
            "group": "AdMob",
            "pages": [
              "tapmind-custom-adapter-sdk-integration/native-android-engine/admob/README",
              "tapmind-custom-adapter-sdk-integration/native-android-engine/admob/installation",
              "tapmind-custom-adapter-sdk-integration/native-android-engine/admob/configuration"
            ]
          },
          {
            "group": "AppLovin",
            "pages": [
              "tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/README",
              "tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/installation",
              "tapmind-custom-adapter-sdk-integration/native-android-engine/applovin/configuration"
            ]
          },
          {
            "group": "Google Ad Manager",
            "pages": [
              "tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/README",
              "tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/installation",
              "tapmind-custom-adapter-sdk-integration/native-android-engine/google-ad-manager/configuration"
            ]
          },
          {
            "group": "IronSource LevelPlay",
            "pages": [
              "tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/README",
              "tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/installation",
              "tapmind-custom-adapter-sdk-integration/native-android-engine/ironsource-levelplay/configuration"
            ]
          }
        ]
      }
    ]
  }
}
```

Repeat the **Native Android** tab pattern for the other 7 engines (`native-ios-engine`, `unity-android-engine`, `unity-ios-engine`, `flutter-android-engine`, `flutter-ios-engine`, `cocos-android-engine`, `cocos-ios-engine`). Cocos engines omit AppLovin and IronSource groups.

**Slug rules (from `SUMMARY.md` → `docs.json`):**

| SUMMARY.md link | JamDesk navigation slug |
|-----------------|---------------------------|
| `README.md` | `README` |
| `gradle-setup/for-gradle-version-7+.md` | `gradle-setup/for-gradle-version-7+` |
| `tapmind-custom-adapter-sdk-integration/.../README.md` | `tapmind-custom-adapter-sdk-integration/.../README` |
| `tapmind-custom-adapter-sdk-integration/.../installation.md` | `tapmind-custom-adapter-sdk-integration/.../installation` |
| `tapmind-custom-adapter-sdk-integration/.../configuration.md` | `tapmind-custom-adapter-sdk-integration/.../configuration` |

Strip `.md` extension. Do **not** rename files on disk — JamDesk resolves `README` → `README.md`.

---

### Change 2 — Create `snippets/` (3 files)

Convert GitBook includes to JamDesk snippets:

| Source | Target |
|--------|--------|
| `.gitbook/includes/doc-tag-admob-gam.md` | `snippets/doc-tag-admob-gam.mdx` |
| `.gitbook/includes/doc-tag-ironsource.md` | `snippets/doc-tag-ironsource.mdx` |
| `.gitbook/includes/doc-tag-applovin.md` | `snippets/doc-tag-applovin.mdx` |

**Example snippet content:**

```mdx
---
title: Doc Tag - AdMob/GAM
---

> Response can be checked in LOGCAT by using tag: **TapMindAdapter**
```

**Replace in 28 configuration files:**

```markdown
{% include "../../../.gitbook/includes/doc-tag-admob-gam.md" %}
```

**With:**

```mdx
import DocTagAdmobGam from '/snippets/doc-tag-admob-gam.mdx'

<DocTagAdmobGam />
```

---

### Change 3 — Move images

| Source | Target |
|--------|--------|
| `.gitbook/assets/image (9).jpeg` | `images/ironsource-configuration.jpeg` |
| `.gitbook/assets/cocos-extension-guide (1).png` | `images/cocos-extension-guide.png` |

**Update references in 8 content files** from:

```html
<img src="../../../.gitbook/assets/image (9).jpeg" ...>
```

To:

```markdown
![IronSource configuration](/images/ironsource-configuration.jpeg)
```

---

### Change 4 — Syntax conversion in all GitBook `.md` pages

**Bulk replace (68 files):**

```markdown
{% hint style="info" %}
...content...
{% endhint %}
```

**To:**

```mdx
<Note>
...content...
</Note>
```

**Tabs (3 files)** — `native-ios-engine/applovin/installation.md`, `native-ios-engine/ironsource-levelplay/installation.md`, `unity-ios-engine/google-ad-manager/installation.md`:

```markdown
{% tabs %}
{% tab title="CocoaPods" %}
...
{% endtab %}
{% tab title="SPM" %}
...
{% endtab %}
{% endtabs %}
```

**To:**

```mdx
<Tabs>
  <Tab title="CocoaPods">
    ...
  </Tab>
  <Tab title="SPM">
    ...
  </Tab>
</Tabs>
```

---

### Change 5 — Redesign root `README.md` (manual)

Replace GitBook HTML buttons:

```html
<a href="tapmind-custom-adapter-sdk-integration/native-android-engine/" class="button primary">...</a>
```

With JamDesk cards:

```mdx
<Columns cols={2}>
  <Card title="Native-Android Engine" icon="mobile-screen" href="/tapmind-custom-adapter-sdk-integration/native-android-engine/README">
    Java / Kotlin
  </Card>
  ...
</Columns>
```

Fix known bugs: duplicate Unity-Android button, malformed Gradle Setup anchor.

---

### Change 6 — Remove starter template (after GitBook nav is live)

**Remove from navigation** (already handled by Change 1).

**Optionally delete files:**

```
introduction.mdx
quickstart.mdx
writing/
components/
api-reference/
openapi/example-api.yaml
```

---

### Change 7 — Local workspace sync

**If developing in `Tapmind CA Integration` workspace:**

```bash
git remote add origin https://github.com/tirthkanzariya201/custom-adapter-integration-documentation.git
git pull origin main
```

Or clone the GitHub repo directly and run `jamdesk dev` from that root.

---

### Change 8 — Validation commands (post-change)

```bash
jamdesk validate          # Must pass: docs.json + MDX on all nav pages
jamdesk broken-links      # Verify internal links after README card rewrite
jamdesk dev               # Preview at http://localhost:3000/docs
```

---

## Appendix: Side-by-Side Platform Comparison

| Concern | GitBook | JamDesk |
|---------|---------|---------|
| Sidebar / nav | `SUMMARY.md` | `docs.json` → `navigation` |
| Landing page | `README.md` (first SUMMARY entry) | First nav page or navbar `href` |
| Page format | `.md` + GitBook tags | `.mdx` / `.md` + JSX components |
| Folder auto-discovery | Yes (via SUMMARY) | No |
| Reusable content | `.gitbook/includes/` | `snippets/*.mdx` + import |
| Images | `.gitbook/assets/` | `images/` or `public/` |
| Config file | `.gitbook.yaml` (optional) | `docs.json` (required) |
| `docs/` folder | N/A | Optional monorepo subdir |

---

## Appendix: Repository State Snapshot

| Location | Has GitBook content | Has `docs.json` | Content visible in JamDesk |
|----------|--------------------|-----------------|-----------------------------|
| GitHub `custom-adapter-integration-documentation` | ✅ 94 pages | ✅ Starter nav | ❌ Starter only |
| Local `Tapmind CA Integration` | ❌ Missing | ✅ Customized name | ❌ Starter only |
| Local `_migration-analysis/` (clone) | ✅ Full repo | ✅ Starter nav | ❌ Starter only |

---

*End of JamDesk analysis report.*
