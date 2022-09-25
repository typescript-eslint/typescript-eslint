---
description: 'Require empty lines around comments.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/lines-around-comment** for documentation.

## Rule Details

This rule extends the base [`eslint/lines-around-comment`](https://eslint.org/docs/rules/lines-around-comment) rule.
It adds support for TypeScript syntax.

See the [ESLint documentation](https://eslint.org/docs/rules/lines-around-comment) for more details on the `comma-dangle` rule.

## Rule Changes

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "lines-around-comment": "off",
  "@typescript-eslint/lines-around-comment": ["error"]
}
```

In addition to the options supported by the `lines-around-comment` rule in ESLint core, the rule adds the following options:

## Options

- `allowInterfaceStart: true` doesn't require a blank line after the interface body block start
- `allowInterfaceEnd: true` doesn't require a blank line before the interface body block end
- `allowTypeStart: true` doesn't require a blank line after the type literal block start
- `allowTypeEnd: true` doesn't require a blank line after the type literal block end

[See the other options allowed](https://eslint.org/docs/rules/comma-dangle#options)

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/lines-around-comment.md)

</sup>
