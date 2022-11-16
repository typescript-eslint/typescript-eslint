---
id: pull-requests
title: Pull Requests
---

This document serves as a guide for how you might review pull requests.

Use your best judgement when reviewing PRs, and most of all remember to be **kind, friendly, and encouraging** when responding to users.
Many users are new to open source and/or typed linting.
It's imperative we give them a positive, uplifting experience.

:::tip
If you're ever unsure on any part of PR reviews, don't hesitate to loop in a maintainer that has more context to help!
:::

## PR Flow

:::note
We include a set of common responses to PRs in [`.github/replies.yml`](https://github.com/typescript-eslint/typescript-eslint/blob/main/.github/replies.yml), intended to be used with the [Refined Saved Replies](https://github.com/JoshuaKGoldberg/refined-saved-replies) extension.
Don't treat these as exact responses you must use: they're just a starting copy+paste helper.
Please do adopt your specific responses to your personal tone and to match the thread for non-straightforward PRs.
:::

TODO: This will be filled out... soon!

## Pruning Old PRs

Every so often, we like to [search for open PRs `awaiting response`](https://github.com/typescript-eslint/typescript-eslint/pulls?q=is%3Aopen+is%3Apr+label%3A%22awaiting+response%22) to find ones that might have been forgotten.
Our flow for PRs that have been waiting for >=1 month is:

1. Ping the author with a message like the _Checking In_ template
2. Wait 2 weeks
3. If they still haven't responded, close the PR with a message like the _Pruning Stale PR_ template
