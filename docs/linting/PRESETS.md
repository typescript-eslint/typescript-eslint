---
id: presets
sidebar_label: Presets
title: Presets
---

`@typescript-eslint/eslint-plugin` includes three rulesets you can extend from to pull in the recommended starting rules.

### `plugin:@typescript-eslint/recommended`

Recommended rules for code correctness that you can drop in without additional configuration.
We strongly recommend all TypeScript projects extend from this preset.

This preset is considered "stable": rule additions and removals will only be done in major version bumps.

```json
{
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```

### `plugin:@typescript-eslint/recommended-requiring-type-checking`

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ]
}
```

Additional recommended rules that require type information.
We recommend all TypeScript projects extend from this preset, with the caveat that rules using type information take longer to run.
See [Linting with Type Information](/docs/linting/type-linting) for more details.

This preset is considered "stable": rule additions and removals will only be done in major version bumps.

### `plugin:@typescript-eslint/strict`

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict"
  ]
}
```

Additional strict rules that can also catch bugs but are more opinionated than recommended rules.
If you are an experienced TypeScript user, you may find benefit from extending from this preset.

This preset is considered "unstable": rule additions and removals may be done in minor or even patch version bumps.
