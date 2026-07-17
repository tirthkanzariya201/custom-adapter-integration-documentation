# Anchor Audit

**Date:** 2026-06-09

JamDesk generates heading anchors via **github-slugger** (same as rehype-slug). GitBook manual `id` anchors on headings do not match MDX-generated slugs.

## Summary

| Category | Meaning | Count |
|---|---|---|
| A | Heading exists but anchor changed | 0 |
| B | Heading was renamed | 0 |
| C | Heading no longer exists | 0 |
| D | Link is obsolete | 0 |

## Findings

| File | Broken Fragment | Target Heading | Actual Generated Anchor | Category | Recommended Fix |
|---|---|---|---|---|---|
