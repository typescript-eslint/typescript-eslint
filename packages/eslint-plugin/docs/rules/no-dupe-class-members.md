---
description: 'Disallow duplicate class members.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-dupe-class-members** for documentation.

:::danger

The code problem checked by this ESLint rule is automatically checked by the TypeScript compiler. Thus, it is not recommended to turn on this rule in new TypeScript projects. You only need to enable this rule if you prefer the ESLint error messages over the TypeScript compiler error messages. (When this rule was originally written, the TypeScript compiler checks did not exist.)

:::

This rule extends the base [`eslint/no-dupe-class-members`](https://eslint.org/docs/rules/no-dupe-class-members) rule.
It adds support for TypeScript's method overload definitions.
