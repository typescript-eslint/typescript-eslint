---
id: managing-issues
sidebar_label: Managing Issues
title: Managing Issues
---

Please note that this document serves as a guide for how you might manage issues. As you become more familiar with the codebase and how it's supposed to behave you'll be able to skip steps or do things out of order as you see fit. For example you may be able to identify if a bug report is "working as intended" or you might recognize an issue as a duplicate without having a completely filled out issue. In such cases you can forgo the back-and-forth and just skip to the closing steps.

Use your best judgement when triaging issues, but most of all remember to be kind, friendly, and encouraging when responding to users.

## Bug Reports

### Ensuring the Issue is Complete

#### "Simple" bug

A simple bug is a bug that can be reproduced in a single TS file plus an ESLint config (and possibly a tsconfig) - i.e. an issue reproducible in our web playground. The vast, vast majority of bug reports will fall into this category.

Before you being reviewing a simple bug report you should first ensure that there is a complete, isolated reproduction case provided by the reporter. This means that there should be a playground link which shows the issue being reported. Whilst a playground link is definitely preferred; it is not explicitly required if there is code and config in the issue that can be pasted into the playground to reproduce the issue. If you cannot reproduce the issue in the playground, remove the "triage" tag, add the "awaiting response" tag, and ask the user to create an isolated reproduction in the playground and comment back when they have one. For example:

> Thanks for the report `@reporter`. Unfortunately I couldn't reproduce the issue using the code you provided. Could you please create an isolated reproduction in our playground (https://typescript-eslint.io/play/) and comment back when you've got one? We prefer an isolated reproduction so that we as volunteer maintainers can quickly reproduce the issue and more easily find the cause.

#### "Complex" bug

A complex bug is a bug that requires multiple files to reproduce. This is the rarer case, but does happen when people are using library types or if there are issues when types are imported.

Before you being reviewing a complex bug report you should first ensure that there is a link to a github repo that can be checked out to reproduce the issue. Unlike with simple issues - it is not acceptable for these sorts of issues to be missing their link; the reason being that if you're trying to reproduce a case by pasting contents into files it's very, very easy to do something wrong or different to the way the reporter intended - meaning you won't be able to reproduce the issue. This in turn can mean you burn a lot of time trying to get things right. Instead remove the "triage" tag, add the "awaiting response" tag, and ask the user to create an isolated reproduction repo and comment back when they have one. For example:

> Thanks for the report `@reporter`. Could you please create an isolated reproduction repo for us? Ideally we want a repo that we can just checkout, install, and immediately reproduce the issue so that we as volunteer maintainers can quickly reproduce the issue and more easily find the cause.

### Triaging the Issue

#### Looking for Duplicates

It's usually worth doing a quick search for related issues. Most of the time users are good about this and they won't ever raise an issue to begin with, but there are some people that will raise a duplicate issue for various reasons. If you find an existing issue which matches, you needn't spend any more time on the issue. Remove the "triage" and "bug" tags, add the "duplicate" tag, and close the issue with a comment referencing the duplicate issue. For example:

> Duplicate of `#12345`. Please make sure you use the search before raising an issue.

It's worth noting that occasionally a user will intentionally raise a duplicate issue because they feel the original issue was closed when it shouldn't have been. If this is the case then you should read the original issue to gather context and understand the reason for it being closed, and determine if the new issue is raises any new or relevant issue that requires addressing. In that case you should continue on the normal triaging flow below.

#### Bug or Working as Intended?

Once you're sure the issue is complete and correct, the next step is to determine if the report is "valid" or not. In short we need to determine if the report is the user misunderstanding how code is designed work ("working as intended") or if the report is an actual bug. As you become more familiar with the codebase and how everything works this will be easier to do intuitively, but to begin with this will likely involve investigating the documentation, code, and the tests to determine if it's a bug or working as intended. In general if there is a passing test or documented example that is the same as or similar to the repro code - that indicates that it's working as intended. If you can't find anything that matches, use your best judgement based on the spirit of the code. If you're ever unsure - don't hesitate to loop in a maintainer that has more context to help!

- If you determine that the bug is due to the user doing something wrong like they've have used the incorrect config, then remove the "bug" and "triage" tags, and add the "working as intended" and "fix: user error" tags, then close the issue with a comment explaining how the user might correct their mistake. [This issue search has some examples of closing comments](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aissue+sort%3Aupdated-desc+label%3A%22fix%3A+user+error%22+is%3Aclosed).
- If you determine that the bug is working as intended, remove the "bug" and "triage" tags, and add the "working as intended" tag, then close the issue with a comment explaining why the report is working as intended. You needn't go into too much detail in your comment - just enough to explain it. [This issue search has some examples of closing comments](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aissue+sort%3Aupdated-desc+label%3A%22working+as+intended%22+is%3Aclosed).
- If you determine that the bug is actually a bug, remove the "triage" tag, and add the "accepting PRs" tag. If you know the rough steps for a fix, consider writing a comment with links to codebase to help someone put together a fix. If you think that the fix is relatively straight-forward then consider also tagging the issue with "good first issue".

:::note
If your link is both a "permalink" (includes a commit hash instead of a branch name) and has a line number/line range then GitHub will embed the code in your comment.
When viewing a file in GitHub pressing `y` will update the URL to a "permalink" with the current commit hash, then you can select the relevant lines and paste that URL into the comment.
:::

## New Rules

## Rule Enhancements
