# Anchor Fix Report

**Date:** 2026-06-09

## Root cause

GitBook migration left manual heading anchors (`<a href="#slug" id="slug"></a>`) that use GitBook slug conventions. JamDesk assigns anchors from heading text via github-slugger, so fragment validation fails for mismatched ids.

## Fix applied (Category A)

Removed GitBook anchor tags from headings where the heading text exists and JamDesk generates a different slug. Visible heading text unchanged.

| Metric | Count |
|---|---|
| Category A warnings fixed | 0 |
| Files modified | 0 |
| Category B/C/D left for review | 0 |

### Files modified


## Remaining warnings (review)

None.

## Validation

| Check | Before | After |
|---|---|---|
| Custom fragment audit | 0 | 0 |
| `jamdesk validate` | PASS | PASS |
| `jamdesk broken-links` fragment messages | 0 | 0 |

Note: `jamdesk broken-links` may under-report fragment issues on Windows due to CRLF line endings in heading extraction; custom audit uses CRLF-safe parsing.
