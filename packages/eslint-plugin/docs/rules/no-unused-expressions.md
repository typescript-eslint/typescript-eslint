---
hide_title: true
sidebar_label: no-unused-expressions
---

# Disallow unused expressions (`no-unused-expressions`)

## Rule Details

This rule extends the base [`eslint/no-unused-expressions`](https://eslint.org/docs/rules/no-unused-expressions) rule.
It adds support for optional call expressions `x?.()`, and directive in module declarations.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-unused-expressions": "off",
  "@typescript-eslint/no-unused-expressions": ["error"]
}
```

## Options

See [`eslint/no-unused-expressions` options](https://eslint.org/docs/rules/no-unused-expressions#options).

:::note

Taken with ❤ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/no-unused-expressions.md)

:::
