---
id: formatting
title: What About Formatting?
---

We strongly recommend against using ESLint for formatting.
We strongly recommend using [Prettier](https://prettier.io), [dprint](https://dprint.dev), or an equivalent instead.

## Formatters vs. Linters

**Formatters** are tools that verify and correct whitespace issues in code, such as spacing and newlines.
Formatters typically run very quickly because they are only concerned with changing whitespace, not code logic or naming.

**Linters** are tools that verify and correct logical and non-whitespace style issues in code, such as naming consistency and bug detection.
Linters often take seconds or more to run because they apply many logical rules to code.

### Problems with Using Linters as Formatters

Linters apply much more work than formatters -- often including potentially multiple rounds of rule fixers.
That generally makes them run orders of magnitude slower.

Additionally, modern formatters such as Prettier are architected in a way that applies formatting to all code regardless of original formatting.
Linters typically run on a rule-by-rule basis, typically resulting in many edge cases and missed coverage in formatting.

### Suggested Usage

We recommend using [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) to disable formatting rules in your ESLint configuration.
You can then configure your formatter separately from ESLint.

## ESLint Core and Formatting

Per [ESLint's 2020 Changes to Rule Policies blog post](https://eslint.org/blog/2020/05/changes-to-rules-policies#what-are-the-changes):

> Stylistic rules are frozen - we won't be adding any more options to stylistic rules.
> We've learned that there's no way to satisfy everyone's personal preferences, and most of the rules already have a lot of difficult-to-understand options.
> Stylistic rules are those related to spacing, conventions, and generally anything that does not highlight an error or a better way to do something.

We support the ESLint team's decision and backing logic to move away from stylistic rules.
With the exception of bug fixes, no new formatting-related pull requests will be accepted into typescript-eslint.
