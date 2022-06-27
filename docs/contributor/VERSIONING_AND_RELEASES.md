---
id: versioning-and-releases
sidebar_label: Versioning and Releases
title: Versioning and Releases
---

## Releases

### Canary

We release a canary version for each and every commit to `main` that passes all required checks. This release is performed automatically by the [`publish_canary_version` step](https://github.com/typescript-eslint/typescript-eslint/blob/5feb2dba9da2bd5e233451b7b0f1c99414b5aef9/.github/workflows/ci.yml#L234-L263).

This release is goes to the `canary` tag on npm and it is versioned as an incremental canary patch release on top of the current `latest` version. I.e. if the current version is `5.6.1`, then the first canary version will be `5.6.2-alpha.0`, the second `5.6.2-alpha.1`, and so on.

### Latest

We release a latest version every Monday at 1pm US Eastern time using the latest commit to `main` at that time. This release is performed automatically by an external job (TBA migration to GitHub actions). This release goes to the standard `latest` tag on npm.

See the [versioning](#versioning) section below for how the version number is calculated.

If there have been no commits that impact public-facing packages then a patch-level release shall be released.

Latest releases shall only ever be "minor" or "patch" releases.

### Major Releases

We currently do not have a set schedule around when major releases shall be performed; instead they shall be done as the need arises. We keep a backlog of breaking issues as a milestone on GitHub that is named in the form `${major}.0.0`.
When we do do a major release, we release a release candidate version to the `rc-v${major}` tag on npm for each commit to the major branch.

<details>

<summary>This section details the steps for a major release.</summary>

1. Create a new branch off `main` called `v${major}`. This branch should be created in the project repository (not your personal fork).
1. Add a new step to [the CI workflow](https://github.com/typescript-eslint/typescript-eslint/blob/main/.github/workflows/ci.yml). This step should be exactly the same as the `publish_canary_version` step except:
   1. The publish command should be `npx lerna publish premajor --loglevel=verbose --canary --exact --force-publish --yes --dist-tag rc-v${major}`.
   1. The step should have the condition: `if: github.ref == 'refs/heads/v${major}'`.
1. Raise a new PR merging the new branch into `main`.
   - This PR serves as documentation of the changes as well as a place for directed feedback.
1. Any breaking change PRs should have their target branch switched to this branch.
   - To signify these changes as breaking changes, the first line of the PR description must read as `BREAKING CHANGE:`.
   - It is important to note that when merged the commit message must also include `BREAKING CHANGE:` as the first line in order for lerna to recognize it as a breaking change in the release notes. If you miss this it just means more manual work when writing the release documentation.
1. Non-breaking changes can be merged to `main` or the major branch as desired. They do not need any special treatment.
1. Once all required PRs have been merged - let the release bake for at least 1 week to allow time for early adopters to help test it.
   - Consider promoting it on the [`@tseslint`](https://twitter.com/tseslint) twitter to get some additional attention.
1. Once the RC has baked for long enough, rebase merge the PR on top of `main`.
1. Discuss with the maintainers to organize an [out-of-band](#out-of-band) release. Doing this manually helps ensure someone is on-hand to action any issues that might arise from the major release.
1. Prepare the release notes. Lerna will automatically generate the release notes on GitHub, however this will be disorganized and unhelpful for users. We need to reorganize the release notes so that breaking changes are placed at the top to make them most visible. If any migrations are required, we must list the steps to make it easy for users.
1. Finally, tweet the release on the `@tseslint` twitter with a link to the GitHub release. Make sure you include additional information about the highlights of the release!

<details>

### Out-of-Band

Rarely we will do releases "out-of-band" (outside the [latest](#latest) schedule). These releases are done manually by a maintainer with the required access privileges.

These releases are done only in emergencies. We assess need on a case-by-case basis though generally an emergency is defined as a critical regression specifically introduced in the latest release.

### Back-Porting Releases

We **_do not_** back port releases to previously released major/minor versions; we only ever release forward.

## Versioning

In this project we follow [semantic versioning (semver)](https://semver.org/). This page exists to help set guidelines around when what we consider to fall within each of the semver categories.

All of the packages in this project are published with the same version number to make it easier to coordinate both releases and installations.

When considering whether a change should be counted as "breaking" we first need to consider what package(s) it impacts. For example breaking changes for the parser packages have a different standard to those for the ESLint plugins. This is because not only do they have _very_ different API surfaces, they also are consumed in very different ways.

Please note that the lists provided below are non-exhaustive and are intended to serve as examples to help guide maintainers when planning and reviewing changes.

### Internal packages

Any packages in this project that are not part of our public API surface (such as `eslint-plugin-internal` or `website`) shall not be considered when calculating new package versions.

### `ast-spec` and `visitor-keys`

A change to the AST **_shall_** be considered breaking if it:

- Removes or renames an existing AST Node.
- Removes or renames an existing property on an AST Node.
- Changes a type in a non-refining way (i.e. `string` to `number`).

A change to the AST **_shall not_** be considered breaking if it:

- Adds a new property to the AST.
- Adds a new node type to the AST.
- Adds a new node type to an existing union type.
- Refines a type to be more specific (i.e. `string` to `'literal' | 'union'`).
- Removes a type from a union that was erroneously added and did not match the runtime AST.

### `eslint-plugin` and `eslint-plugin-tslint`

A change to the plugins **_shall_** be considered breaking if it:

- Removes or renames an option.
- Changes the default option of a rule.
- Changes a rule's schema to be stricter.
- Consumes type information to a rule that did not previously consume it.
- Removes or renames a rule.
- Changes any of the recommended configurations.
- Changes the default behavior of a rule in such a way that causes new reports in a large set of cases in an average codebase.

A change to the plugins **_shall not_** be considered breaking if it:

- Adds an option.
- Adds a rule.
- Deprecates a rule.
- Adds additional checks to an existing rule that causes new reports in a small-to-medium set of cases in an average codebase.
- Refactors a rule's code in a way that does not introduce additional reports.
- Changes to a rule's description or other metadata.
- Adds a fixer or suggestion fixer.
- Removes a fixer or suggestion fixer.
- Fixes incorrect behavior in a rule that may or may not introduce additional reports.

#### `parser`, `typescript-estree`, `scope-manager`, `types`, `type-utils`, `utils`

A change to these packages **_shall_** be considered breaking if it:

- Changes the API surface in a backwards-incompatible way (remove or rename functions, types, etc).

A change to these packages **_shall not_** be considered breaking if it:

- Adds to the API surface (add functions, types, etc).
- Deprecates parts of the API surface.
- Adds **_optional_** arguments to functions or properties to input types.
- Adds additional properties to output types.
- Adds documentation in the form of JSDoc comments.
