# Native Android Navigation POC

**Date:** 2026-06-09  
**Scope:** Investigation + proof-of-concept for Native Android only  
**Status:** POC created — **not published** (production `docs.json` unchanged)

---

## Executive summary

JamDesk **does not** provide a secondary left-sidebar for in-page mediation navigation. It **does** provide an automatic **right-side Table of Contents (TOC)** generated from **H2 and H3** headings on the current page.

The recommended approach for your desired UX is:

1. Keep the **left sidebar platform-only** (one page per platform tab).
2. Merge all Native Android mediation content into **one long MDX page**.
3. Structure headings as **H2 = mediation network**, **H3 = Installation / Configuration**.
4. Let JamDesk render the **right TOC** from those headings.

A working POC has been generated and can be previewed locally without deploying.

---

## 1. JamDesk navigation capabilities

### Left sidebar (primary navigation)

| Feature | Supported? | Notes |
|---|---|---|
| Platform tabs | Yes | `docs.json` → `navigation.tabs` |
| Collapsible groups | Yes | Top-level and **nested groups** (accordion folders) |
| Per-page entries | Yes | Each slug = one sidebar link |
| Secondary / mediation sidebar inside a platform | **No** | No built-in “child nav” separate from `docs.json` |
| Auto-discovery of folders | **No** | Only slugs listed in `docs.json` render |

Source: [JamDesk Navigation overview](https://jamdesk.com/docs/navigation/overview)

**Nested groups** (e.g. AdMob → Installation, Configuration as folder children) are possible in the left sidebar, but they still appear as **separate pages** in the left nav — not as a single-document experience with right TOC.

### Right-side page TOC

| Feature | Supported? | Notes |
|---|---|---|
| Automatic TOC from headings | **Yes** | H2 and H3 only |
| Nested TOC hierarchy | **Yes** | H3 nests under parent H2 |
| H1 in TOC | No | Page title (H1) is excluded |
| H4+ in TOC | No | Sub-sections do not appear in TOC |
| Anchor links | **Yes** | github-slugger IDs (e.g. `#installation`, `#configuration`) |
| Desktop only | Yes | TOC hidden below ~1280px width |

Source: [JamDesk Headers](https://jamdesk.com/docs/content/headers)

### Other relevant options

| Option | Use case | Fit for this goal |
|---|---|---|
| `<Panel>` component | Replace right TOC with custom sticky content | Poor — replaces TOC, not heading-based nav |
| `anchors` in `docs.json` | External links at top of left sidebar | Not in-page mediation nav |
| Cross-page `#fragment` links | Link to sections on other pages | Works, but still multi-page |
| `<Card>` / `<Columns>` | Hub navigation on overview page | Good for overview, not long-form single doc |

Source: [Panel component](https://jamdesk.com/docs/components/panel), [Links & Navigation](https://jamdesk.com/docs/content/links)

---

## 2. Answers to your questions

| Question | Answer |
|---|---|
| Does secondary sidebar navigation exist? | **No** — only `docs.json` left sidebar + optional `anchors` (external links). |
| Does page TOC navigation exist? | **Yes** — automatic right TOC from **H2/H3** on the active page. |
| Is nested heading navigation supported? | **Yes** — H3 items nest under H2 in the right TOC. |
| Can left sidebar stay platform-only? | **Yes** — register a **single page** under the Native Android tab. |
| Can mediation nav live on the right? | **Yes** — with merged content and correct heading levels. |

---

## 3. Recommended approach

### Approach A (recommended): Single merged page + right TOC

**Structure:**

```markdown
# Native Android Integration Guide        ← H1 (page title, not in TOC)

## AdMob                                   ← H2 (TOC)
### Installation                           ← H3 (TOC)
### Configuration                          ← H3 (TOC)

## Google Ad Manager                       ← H2
### Installation
### Configuration

## AppLovin
### Installation
### Configuration

## IronSource LevelPlay
### Installation
### Configuration
```

**Expected right TOC:**

```
AdMob
  Installation
  Configuration
Google Ad Manager
  Installation
  Configuration
AppLovin
  Installation
  Configuration
IronSource LevelPlay
  Installation
  Configuration
```

### Approach B (not recommended for your goal): Nested left-sidebar groups

Keep separate pages but nest mediation groups under Native Android in `docs.json`. Left sidebar still lists every page; right TOC only covers the current page’s headings.

### Approach C: Overview hub + separate pages

Keep current multi-page layout; use Cards on overview for mediation links. Does not deliver single-document + right TOC navigation.

---

## 4. Proof-of-concept artifacts

| File | Purpose |
|---|---|
| `tapmind-custom-adapter-sdk-integration/native-android-engine/integration-guide.poc.mdx` | Merged Native Android content (all 4 mediations) |
| `docs.native-android-poc.json` | Alternate navigation — Native Android tab has **one page** only |
| `scripts/build-native-android-poc.js` | Regenerates merged MDX from existing per-mediation files |
| `scripts/preview-native-android-poc.ps1` | Local preview helper (swaps nav, restores on exit) |

### What was merged (Native Android only)

| Source pages | Merged into |
|---|---|
| `native-android-engine/README.mdx` | Page intro |
| `admob/README`, `installation`, `configuration` | `## AdMob` section |
| `google-ad-manager/README`, `installation`, `configuration` | `## Google Ad Manager` section |
| `applovin/README`, `installation`, `configuration` | `## AppLovin` section |
| `ironsource-levelplay/README`, `installation`, `configuration` | `## IronSource LevelPlay` section |

**Not modified:** Native iOS, Unity, Flutter, Cocos, production `docs.json`, or any live deployment.

### POC validation

```
jamdesk validate  (with docs.native-android-poc.json temporarily swapped)
→ PASS — docs.json valid, MDX syntax valid
```

---

## 5. Pros and cons

### Single-page + right TOC (Approach A)

| Pros | Cons |
|---|---|
| Left sidebar stays platform-only | Very long page (~15 KB MDX, more when rendered) |
| Right TOC matches desired mediation hierarchy | TOC hidden on mobile/tablet (<1280px) |
| No duplicate platform prerequisites across pages | Deep-link URLs change (one slug + `#fragments`) |
| Search indexes one comprehensive Native Android doc | Regeneration script needed if source pages change |
| Familiar Mintlify/JamDesk long-page pattern | Anchor collisions possible if two sections share H3 text (e.g. two “Installation” — mitigated by H2 parent context in UI) |

### Current multi-page layout

| Pros | Cons |
|---|---|
| Shorter pages, faster to scan | Left sidebar cluttered with mediation groups |
| Unique URL per installation/configuration | Right TOC only shows current page headings |
| Easier per-mediation edits | Does not match desired navigation model |

---

## 6. Preview instructions (local only)

### Option A — Preview script (recommended)

```powershell
cd "d:\TapMind\Tapmind CA Integration"
.\scripts\preview-native-android-poc.ps1
```

Then open:

**http://localhost:3456/tapmind-custom-adapter-sdk-integration/native-android-engine/integration-guide.poc**

The script temporarily swaps `docs.json` with `docs.native-android-poc.json` and **restores production navigation when you stop the server** (Ctrl+C).

### Option B — Manual preview

```powershell
cd "d:\TapMind\Tapmind CA Integration"

# Regenerate merged page (optional)
node scripts/build-native-android-poc.js

# Backup and swap navigation
Copy-Item docs.json docs.json.production-backup
Copy-Item docs.native-android-poc.json docs.json -Force

jamdesk dev --no-open --port 3456
# Open: http://localhost:3456/tapmind-custom-adapter-sdk-integration/native-android-engine/integration-guide.poc

# Restore when done
Copy-Item docs.json.production-backup docs.json -Force
Remove-Item docs.json.production-backup
```

### What to verify in preview

1. **Left sidebar** — Native-Android Engine tab shows only **Native Android** (one entry).
2. **Right TOC** (desktop, wide window) — Four H2 networks, each with Installation + Configuration H3 children.
3. **Content** — Code blocks, `<Info>` callouts, images, and snippet components render correctly.
4. **TOC click** — Clicking a TOC item scrolls to the correct mediation section.
5. **Mobile** — TOC is hidden; content still scrollable (consider in-page jump links if mobile TOC is required).

### Screenshots

Screenshots are not included in this report (no browser automation in this task). Capture manually during local preview:

1. Full desktop view — left sidebar + content + right TOC
2. Right TOC expanded showing all four mediations
3. Scrolled view on AdMob → Installation section

---

## 7. Production rollout (if approved later)

**Not executed in this POC.** Suggested steps:

1. Rename `integration-guide.poc.mdx` → `integration-guide.mdx` (or replace `README.mdx`).
2. Update production `docs.json` Native Android tab to single-page navigation (as in `docs.native-android-poc.json`).
3. Optionally keep old per-mediation files for maintenance and regenerate merged page via `build-native-android-poc.js`.
4. Run `jamdesk validate` and `jamdesk broken-links`.
5. Deploy with `jamdesk deploy`.

---

## 8. Conclusion

**JamDesk supports your desired right-side mediation navigation** via automatic page TOC, but **only when content lives on a single page** with H2/H3 heading structure. There is no built-in secondary left sidebar for mediation-level navigation inside a platform.

The Native Android POC demonstrates the target UX. Other platforms were intentionally left unchanged.
