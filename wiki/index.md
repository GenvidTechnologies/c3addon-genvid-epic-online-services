---
okf_version: "0.2"
---

<!-- `okf_version` is the ONLY frontmatter key permitted here (§8/§12) — this
     file is the bundle-root index (`wiki/index.md`, the OKF bundle root per
     gvt-dev ADR-0022). A `wiki/<subdir>/index.md` carries NO frontmatter at
     all. -->

# Wiki Index

This is the wiki's table of contents — every page under `wiki/`,
grouped under section headings, one line each. `/gvt-wiki:maintain-wiki`
keeps this list current: a new page is added here when it's created, and
`lint` flags any page listed in **no** index — here, or in a
subdirectory's own `index.md`. Each entry's description is the linked
page's frontmatter `description`, so the index and the page can't drift.
See `wiki/schema.md` for the page format and maintenance rules.

This file is also the project's documentation index for the gvt-dev plugin
(`paths['docs/TOC.md']` in `.gvt-agent.json`). Skills that self-index a
document add it here under a conventional section heading, for example
`Decision Records` or `Process`.

## Schema

* [Wiki Maintenance Schema](schema.md) - The maintenance rules for this wiki — page format, create-vs-update lifecycle, raw/ immutability, staleness policy and the verb contract.

## Process

* [Issue Triage Conventions](issue-triage.md) - Types, priorities, labels, required fields and mutation recipes that /gvt-dev:triage-issues applies to this repository's GitHub issues.
