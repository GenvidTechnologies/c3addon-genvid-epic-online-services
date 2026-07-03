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

There is no automated test suite; in-repo validation is lint + a clean build.
`npm run build` only typechecks and packages the addon — it does not exercise it
at runtime. **Testing the addon** means exporting the sample from the Construct 3
editor and preparing/building that export (Cordova → Android, per `README.md`),
similar to Burbank. So an acceptance criterion like "verify it runs against
dependency vX" is not reproducible from `npm run build` alone; treat it as
out-of-band verification done in the C3 editor.

## CI / Releasing

CI/CD runs on GitHub Actions (modeled on the sibling `c3addon-genvid-marketplace`):

- `.github/workflows/ci.yml` — lints and builds on every push to `main` and every
  pull request.
- `.github/workflows/release.yml` — on a version tag matching `[0-9]+.*` (e.g.
  `1.0.0.0`), builds, packages via `npm run zip:posix`, and publishes
  `Genvid_EOS.c3addon` to a GitHub Release. **To cut a release, push such a tag.**

Distribution is via GitHub Releases (the legacy CircleCI Azure blob upload was
dropped in the migration).

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
