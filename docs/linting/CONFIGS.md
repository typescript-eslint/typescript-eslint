---
id: configurations
sidebar_label: Configurations
title: Configurations
---

## Built-In Configurations

`@typescript-eslint/eslint-plugin` includes three rulesets you can extend from to pull in the recommended starting rules.

With the exception of `strict`, all configurations are considered "stable".
Rule additions and removals are treated as breaking changes and will only be done in major version bumps.

### `eslint-recommended`

This ruleset is meant to be used after extending `eslint:recommended`.
It disables core ESLint rules that are already checked by the TypeScript compiler.
Additionally, it enables rules that promote using the more modern constructs TypeScript allows for.

```jsonc
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ]
}
```

This config is automatically included if you use any of the other configurations mentioned on this page.

### `recommended`

Recommended rules for code correctness that you can drop in without additional configuration.
These rules are those whose reports are almost always for a bad practice and/or likely bug.
`recommended` also disables rules known to conflict with this repository, or cause issues in TypeScript codebases.

```json
{
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```

::tip
We strongly recommend all TypeScript projects extend from this configuration.
::

### `recommended-requiring-type-checking`

Additional recommended rules that require type information.
Rules in this configuration are similarly useful to those in `recommended`.

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ]
}
```

::tip
We recommend all TypeScript projects extend from this configuration, with the caveat that rules using type information take longer to run.
See [Linting with Type Information](/docs/linting/type-linting) for more details.
::

### `strict`

Additional strict rules that can also catch bugs but are more opinionated than recommended rules.

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict"
  ]
}
```

::tip
We recommend a TypeScript project extend from this configuration only if a nontrivial percentage of its developers are highly proficient in TypeScript.
::

## Overriding Configurations

These configurations are our recommended starting points, but **you don't need to use them as-is**.
ESLint allows you to configure your own rule settings on top of any extended configurations.
See [ESLint's Configuring Rules docs](https://eslint.org/docs/user-guide/configuring/rules#using-configuration-files).

### Suggesting Configuration Changes

If you feel strongly that a specific rule should (or should not) be one of these configurations, please feel free to [file an issue](TODO: NEW ISSUE TEMPLATE) along with a **detailed** argument explaining your reasoning.
