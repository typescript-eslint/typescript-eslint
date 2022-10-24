---
id: issues
sidebar_label: Issue Management
title: Issue Management
---

This document serves as a guide for how you might manage issues, also known as issue triaging.

Use your best judgement when triaging issues, but most of all remember to be **kind, friendly, and encouraging** when responding to users.

:::tip
If you're ever unsure on any part of issue management, don't hesitate to loop in a maintainer that has more context to help!
:::

## Issue Flow

[Issues pending triage](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aopen+is%3Aissue+label%3Atriage) are given the `triage` label.
Most issues go through the following triage flow when created:

1. Some user files the issue, and it is given the `triage` label automatically
2. A maintainer will ensure the issue is valid:
   - If it doesn't fill out an appropriate template with enough information:
     - Add the `please fill out the template` and `awaiting response` labels
     - Ask the poster for more information using a _Needs More Info_ response
   - If it's a duplicate of an issue that already exists:
     - Add the `duplicate` label and remove the `bug` label
     - If it's an obvious duplicate, post a _Clearly Duplicate Issue_ response
     - If it's not an obvious duplicate, link to the existing issue and explain why
   - If the code is working as intended:
     - Add the `working as intended` label and remove the `bug` and `triage` labels
     - If the behavior is due to the user doing something wrong, such as an incorrect config:
       - Add the `fix: user error` label
       - [This issue search has some examples of closing comments](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aissue+sort%3Aupdated-desc+label%3A%22fix%3A+user+error%22+is%3Aclosed)
     - If the behavior is otherwise expected, [this issue search has some examples of closing comments](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aissue+sort%3Aupdated-desc+label%3A%22working+as+intended%22+-label%3A%22fix%3A+user+error%22+is%3Aclosed+)
     - You needn't go into too much detail in your comment - just enough to explain it
3. If it was valid, add the `accepting prs` label and remove the `triage` label
4. If you know the rough steps for a fix, consider writing a comment with links to codebase to help someone put together a fix
5. If you think that the fix is relatively straightforward then consider also adding the `good first issue` label

Whenever an issue is waiting for the reporter to provide more information, it should be given the `awaiting response` label.
When more information is provided:

- If you have time to go through the triage flow again, do so
- If you don't have time, add the `triage` label and remove the `awaiting response` label

:::tip
If your link is both a "permalink" (includes a commit hash instead of a branch name) and has a line number/line range then GitHub will embed the code in your comment.
When viewing a file in GitHub pressing `y` will update the URL to a "permalink" with the current commit hash, then you can select the relevant lines and paste that URL into the comment.
:::

### Determining Whether Code is Working As Intended

As you become more familiar with the codebase and how everything works this will be easier to do intuitively, but to begin with this will likely involve investigating the documentation, code, and the tests to determine if it's a bug or working as intended.
In general if there is a passing test or documented example that is the same as or similar to the repro code - that indicates that it's working as intended.
If you can't find anything that matches, use your best judgement based on the spirit of the code.

### Looking for Duplicates

It's worth noting that occasionally a user will intentionally raise a duplicate issue because they feel the original issue was closed when it shouldn't have been.
If this is the case then you should read the original issue to gather context and understand the reason for it being closed, and determine if the new issue is raises any new or relevant issue that requires addressing.

### Response Templates

We include a set of common responses to issues in [`.github/replies.yml`](https://github.com/typescript-eslint/typescript-eslint/blob/main/.github/replies.yml), intended to be used with the [Refined Saved Replies](https://github.com/JoshuaKGoldberg/refined-saved-replies) extension.
Don't treat these as exact responses you must use: they're just a starting copy+paste helper.
Please do adopt your specific responses to your personal tone and to match the thread for non-straightforward issues.

## Skipping Steps

As you become more familiar with the codebase and how it's supposed to behave you'll be able to skip steps or do things out of order as you see fit.
For example you may be able to identify if a bug report is "working as intended" or you might recognize an issue as a duplicate without having a completely filled out issue.
In such cases you can forgo the back-and-forth and just skip to the closing steps.

## Specific Issue Types

### 🐛 Bug Reports

#### 🐞 "Simple" Bugs

A simple bug is a bug that can be reproduced in a single TS file plus an ESLint config (and possibly a TSConfig) - i.e. an issue reproducible on https://typescript-eslint.io/play.
The vast majority of bug reports fall into this category.

If you cannot reproduce the issue as described using the issue's provided playground reproduction, it has not provided enough information.
Consider using a specific response like the _Needs Playground Reproduction_ response.

#### 🦟 "Complex" Bugs

A complex bug is a bug that requires multiple files to reproduce.
This is the rarer case, but does happen when people are using library types or if there are issues when types are imported.

These bugs should be reported with a link to a GitHub repository that can be checked out to reproduce the issue.
If you cannot reproduce the issue as described using repository's README.md and issue description, it has not provided enough information.
Consider using a specific response like the _Needs Full Reproduction_ response.

### ✨ Rule Enhancements

TODO: This will be filled out... soon!

### 🚀 New Rules

TODO: This will be filled out... soon!
