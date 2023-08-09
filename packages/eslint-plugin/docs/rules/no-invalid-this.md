---
description: 'Disallow `this` keywords outside of classes or class-like objects.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-invalid-this** for documentation.

:::danger

The code problem checked by this ESLint rule is automatically checked by the TypeScript compiler (as long as you have the `strict` or `noImplicitThis` compiler flags enabled). Thus, it is not recommended to turn on this rule in new TypeScript projects. You only need to enable this rule if you prefer the ESLint error messages over the TypeScript compiler error messages.

:::

This rule extends the base [`eslint/no-invalid-this`](https://eslint.org/docs/rules/no-invalid-this) rule.
It adds support for TypeScript's `this` parameters.
