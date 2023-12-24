---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: We're following ESLint's lead in moving our formatting lint rules to the ESLint Stylistic project.
slug: deprecating-formatting-rules
tags: [formatter, formatting, prettier, style, stylistic]
title: Deprecating Formatting Rules
---

[ESLint recently announced their plan to deprecate their core formatting rules](https://eslint.org/blog/2023/10/deprecating-formatting-rules).
The [ESLint Stylistic](https://eslint.style) project has taken over maintenance of formatting rules.

As a result, we in typescript-eslint are now able to deprecate our formatting rules as well.
We'll keep these deprecated rules available until our next major version.

<!--truncate-->

## Context: Formatting Rules

The ESLint blog post thoroughly explains the history and tradeoffs of formatting rules.
See also [ESLint's 2020 Changes to Rule Policies blog post](https://eslint.org/blog/2020/05/changes-to-rules-policies/#what-are-the-changes) and our _[What About Formatting?](/linting/troubleshooting/formatting)_ docs.
The performance downsides of formatting rules are heightened when [linting with type information](/linting/typed-linting).

## Timelines

[v6.16.0](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v6.16.0), released December 25th, 2023, marks the rules as deprecated.
Deprecation is only a documentation change.
Per semantic versioning, formatting-related rules will remain available for all releases of typescript-eslint in the current major version, v6.

**Our next major version, v7, will remove all deprecated rules.**

## Upgrading to ESLint Stylistic

Although you can continue to use formatting rules in typescript-eslint for now, we don't plan on adding any new features or fixes to the rules.
You'll want to switch to using their equivalents from [ESLint Stylistic](https://eslint.style).

See the [ESLint Stylistic > Getting Started](https://eslint.style/guide/getting-started) guide for how to switch formatting rules to that project.
The equivalent stylistic rules for deprecated typescript-eslint rules are summarized in this table:

| typescript-eslint Rule                                                                        | ESLint Stylistic Rule                                                                                 |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`@typescript-eslint/block-spacing`](/rules/block-spacing)                                    | [`@stylistic/block-spacing`](https://eslint.style/rules/ts/block-spacing)                             |
| [`@typescript-eslint/brace-style`](/rules/brace-style)                                        | [`@stylistic/brace-style`](https://eslint.style/rules/ts/brace-style)                                 |
| [`@typescript-eslint/comma-dangle`](/rules/comma-dangle)                                      | [`@stylistic/comma-dangle`](https://eslint.style/rules/ts/comma-dangle)                               |
| [`@typescript-eslint/comma-spacing`](/rules/comma-spacing)                                    | [`@stylistic/comma-spacing`](https://eslint.style/rules/ts/comma-spacing)                             |
| [`@typescript-eslint/func-call-spacing`](/rules/func-call-spacing)                            | [`@stylistic/func-call-spacing`](https://eslint.style/rules/ts/func-call-spacing)                     |
| [`@typescript-eslint/indent`](/rules/indent)                                                  | [`@stylistic/indent`](https://eslint.style/rules/ts/indent)                                           |
| [`@typescript-eslint/key-spacing`](/rules/key-spacing)                                        | [`@stylistic/key-spacing`](https://eslint.style/rules/ts/key-spacing)                                 |
| [`@typescript-eslint/keyword-spacing`](/rules/keyword-spacing)                                | [`@stylistic/keyword-spacing`](https://eslint.style/rules/ts/keyword-spacing)                         |
| [`@typescript-eslint/lines-around-comment`](/rules/lines-around-comment)                      | [`@stylistic/lines-around-comment`](https://eslint.style/rules/ts/lines-around-comment)               |
| [`@typescript-eslint/lines-between-class-members`](/rules/lines-between-class-members)        | [`@stylistic/lines-between-class-members`](https://eslint.style/rules/ts/lines-between-class-members)        |
| [`@typescript-eslint/member-delimiter-style`](/rules/member-delimiter-style)                  | [`@stylistic/member-delimiter-style`](https://eslint.style/rules/ts/member-delimiter-style)           |
| [`@typescript-eslint/no-extra-parens`](/rules/no-extra-parens)                                | [`@stylistic/no-extra-parens`](https://eslint.style/rules/ts/no-extra-parens)                         |
| [`@typescript-eslint/padding-line-between-statements`](/rules/padding-line-between-statements) | [`@stylistic/padding-line-between-statements`](https://eslint.style/rules/ts/padding-line-between-statements) |
| [`@typescript-eslint/quotes`](/rules/quotes)                                                  | [`@stylistic/quotes`](https://eslint.style/rules/ts/quotes)                                           |
| [`@typescript-eslint/semi`](/rules/semi)                                                      | [`@stylistic/semi`](https://eslint.style/rules/ts/semi)                                               |
| [`@typescript-eslint/space-before-blocks`](/rules/space-before-blocks)                        | [`@stylistic/space-before-blocks`](https://eslint.style/rules/ts/space-before-blocks)                 |
| [`@typescript-eslint/space-before-function-paren`](/rules/space-before-function-paren)        | [`@stylistic/space-before-function-paren`](https://eslint.style/rules/ts/before-function-paren)       |
| [`@typescript-eslint/space-infix-ops`](/rules/space-infix-ops)                                | [`@stylistic/space-infix-ops`](https://eslint.style/rules/ts/space-infix-ops)                         |
| [`@typescript-eslint/type-annotation-spacing`](/rules/type-annotation-spacing)                | [`@stylistic/type-annotation-spacing`](https://eslint.style/rules/ts/type-annotation-spacing)         |

## Supporting typescript-eslint

If you enjoyed this blog post and/or use typescript-eslint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖
