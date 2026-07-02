@CONVENTIONS.md

# Genvid Epic Online Services (C3 Addon)

<!--
Project context for Claude Code. The genvid plugin's skills read this
file for project-specific facts the plugin can't infer. The
@CONVENTIONS.md import above brings in the plugin's contract.
-->

Construct 3 addon exposing Epic Online Services (EOS) to Genvid-built games.
TypeScript source in `src/`, compiled to `dist/`, packaged as
`Genvid_EOS.c3addon`.

## Commands

- Lint: `npm run lint` (eslint on `src`)
- Build: `npm run build` (`tsc -p src --outDir dist`, typechecks + emits)
- Package: `npm run zip:windows` / `npm run zip:posix` (produces `Genvid_EOS.c3addon`)
- Validate (lint + build): `npm run lint && npm run build`

There is no automated test suite; validation is lint + a clean build.

## Commit Format

Plain imperative subject, referencing the GitHub issue when there is one:
`<Imperative subject> (#<issue>)` (e.g. `Add available-only option (#42)`).
Omit the `(#N)` suffix when no issue applies.

## Pull Request Format

Title mirrors the commit subject. In the body, describe the change and how it
was verified (lint + build), and link the GitHub issue it closes.

## Branching

Branch off `main`, named with a short kebab-case slug, optionally prefixed with
the issue number (e.g. `available-only-option` or `gh-42-available-only-option`).
`main` is the default/base branch.
