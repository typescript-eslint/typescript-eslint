---
id: releases
sidebar_label: Releases
title: Releases
---

## Canary

We release a canary version for each commit to `main` that passes all required checks. This release is performed automatically by the [`publish_canary_version` step](https://github.com/typescript-eslint/typescript-eslint/blob/5feb2dba9da2bd5e233451b7b0f1c99414b5aef9/.github/workflows/ci.yml#L234-L263).

This release is goes to the `canary` tag on npm and it is versioned as an incremental canary patch release on top of the current `latest` version. I.e. if the current version is `5.6.1`, then the first canary version will be `5.6.2-alpha.0`, the second `5.6.2-alpha.1`, and so on.

## Latest

We release a latest version every Monday at 1pm US Eastern time using the latest commit to `main` at that time. This release is performed automatically by a Github action located in a private repository. This release goes to the standard `latest` tag on npm.

See the [versioning](#versioning) section below for how the version number is calculated.

If there have been no commits that impact public-facing packages then a patch-level release shall be released.

Latest releases shall only ever be "minor" or "patch" releases.

## Major Releases

We currently do not have a set schedule around when major releases shall be performed; instead they are done as the need arises.

We keep a backlog of breaking issues as a milestone on GitHub that is named in the form `${major}.0.0`.
When we do do a major release, we release a release candidate version to the `rc-v${major}` tag on npm for each commit to the major branch.

### Major Release Steps

Our releases go through three groups of steps:

1. [Pre-Release Preparation]
1. [Merging Breaking Changes]
1. [Releasing the Version]

#### 1. Pre-Release Preparation

1. Create a milestone by the name of the release [example: [Milestone 6.0.0](https://github.com/typescript-eslint/typescript-eslint/milestone/8)].
1. If an issue for changes to recommended rule configs doesn't yet exist, create one [example: [Changes to the `recommended` sets for 5.0.0](https://github.com/typescript-eslint/typescript-eslint/issues/5900)].
1. Add any breaking changes intended for the release to that milestone.
1. Create two new branches off `main` in the project repository (not a personal fork):
   - `v${major}`
   - `v${major}-canary-auto-release`
1. Raise a PR from `v${major}-canary-auto-release` to `main` modifying the [`ci.yml` workflow](https://github.com/typescript-eslint/typescript-eslint/blob/main/.github/workflows/ci.yml) [example: [chore: add auto-canary release for v6](https://github.com/typescript-eslint/typescript-eslint/pull/5883)]:
   - Under `pushes:` at the beginning of the file, add an `- v${major}` list item.
   - Add a `publish_canary_version_v${major}` step the same as `publish_canary_version` except:
     - Add the condition: `if: github.ref == 'refs/heads/v${major}'`.
     - Its publish command should be `npx lerna publish premajor --loglevel=verbose --canary --exact --force-publish --yes --dist-tag rc-v${major}`.
   - Merge this into `main` once reviewed and rebase the `v${major}` branch.

#### 2. Merging Breaking Changes

1. Send a PR from `v${major}` to `main` [example: [v6.0.0](https://github.com/typescript-eslint/typescript-eslint/pull/5886)].
1. Change all [breaking change PRs](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aissue+is%3Aopen+label%3A%22breaking+change%22) to target the `v${major}` branch.
   - To signify these changes as breaking, the first line of the PR description must read as `BREAKING CHANGE:`, and second line should briefly summarize the changes.
   - It is important to note that when merged the commit message must also include `BREAKING CHANGE:` as the first line in order for lerna to recognize it as a breaking change in the release notes. If you miss this it just means more manual work when writing the release documentation.
1. Wait until all required PRs have been merged
1. Let the release wait for **at least 1 week** to allow time for early adopters to help test it and discuss the changes.
   - Promote it on the [`@tseslint`](https://twitter.com/tseslint) twitter to get some additional attention.
1. Once discussions have settled, rebase merge the PR on top of `main`.

:::note
_Non_-breaking changes can be merged to `main` or the major branch.
They don't need any special treatment.
:::

#### 3. Releasing the Version

1. Discuss with the maintainers to be ready for an [out-of-band](#out-of-band) release. Doing this manually helps ensure someone is on-hand to action any issues that might arise from the major release.
1. Prepare the release notes. Lerna will automatically generate the release notes on GitHub, however this will be disorganized and unhelpful for users. We need to reorganize the release notes so that breaking changes are placed at the top to make them most visible. If any migrations are required, we must list the steps to make it easy for users.

- Example release notes: [`v5.0.0`](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v5.0.0), [`v4.0.0`](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v4.0.0), [`v3.0.0`](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v3.0.0)

1. Finally, tweet the release on the `@tseslint` twitter with a link to the GitHub release. Make sure you include additional information about the highlights of the release!

## Out-of-Band

We will do releases "out-of-band" (outside the [latest](#latest) schedule) for rare emergencies.
We assess need on a case-by-case basis though generally an emergency is defined as a critical regression specifically introduced in the latest release.

These releases are done manually by a maintainer with the required access privileges.

## Back-Porting Releases

We **_do not_** back port releases to previously released major/minor versions.
We only ever release forward.
