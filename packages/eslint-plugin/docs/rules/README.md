---
title: Overview
sidebar_label: Overview
pagination_next: null
pagination_prev: null
slug: /
---

`@typescript-eslint/eslint-plugin` includes over 100 rules that detect best practice violations, bugs, and/or stylistic issues specifically for TypeScript code. All of our rules are listed below.

Instead of enabling rules one by one, we recommend using one of [our pre-defined configs](/linting/configs) to easily enable a large set of recommended rules.

## Rules

The rules are listed in alphabetical order. You can optionally filter them based on these categories:

import RulesTable from "@site/src/components/RulesTable";

<RulesTable />

## Filtering

- "Config Group" refers to the configuration preset. We offer [three different config groups](/linting/configs) that allow users to enable a large set of recommended rules all at once.
- `🔧 fixable` refers to whether the rule contains an ESLint auto-fixer. If the rule has an auto-fixer, then some rule violations can be fixed by running `eslint` with the `--fix` flag. This will automatically change the code, which can save a lot of time! (It is a common pattern for developers to configure their IDE to automatically run `eslint --fix` when saving a TypeScript file.)
- `💡 has suggestions` refers to whether the rule will offer a suggestion of how to fix the code. Sometimes, it is not safe to automatically fix the code with an auto-fixer. But in these cases, we often have a good guess of what the correct fix should be, and we can provide it as a suggestion to the developer.
- `💭 requires type information` refers to whether the rule needs to leverage the power of the TypeScript compiler in order to work properly. Rules that require type information are usually much slower than rules that don't. Thus, if linting performance becomes an issue in a gigantic codebase, a good first step might be make rules that require type information run only in CI.
- `🧱 extension rule` means that the rule was originally a [core ESLint rule](https://eslint.org/docs/latest/rules/). Some core ESLint rules do not support TypeScript syntax: either they crash, ignore the syntax, or falsely report against it. In these cases, we create an "extension rule": a rule within our plugin that has the same functionality, but also supports TypeScript.
- `📐 formatting rule` means that the rule has to do with formatting. Formatting rules are mostly here for legacy purposes, because we [strongly recommend against using ESLint for formatting](/linting/troubleshooting/formatting).
- `💀 deprecated rule` means that the rule should no longer be used and will be removed from the plugin in a future version.
