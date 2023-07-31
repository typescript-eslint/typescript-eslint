---
description: 'Require unary negation to take a number.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-unsafe-unary-minus** for documentation.

TypeScript does not prevent you from putting a minus sign before things other than numbers:

```ts
const s = 'hello';
const x = -s; // x is NaN
```

This rule restricts the unary `-` operator to `number | bigint`.

## Examples

### ❌ Incorrect

```ts
const f = (a: string) => -a;
const g = (a: {}) => -a;
```

### ✅ Correct

```ts
const a = -42;
const b = -42n;
const f1 = (a: number) => -a;
const f2 = (a: bigint) => -a;
const f3 = (a: number | bigint) => -a;
const f4 = (a: any) => -a;
const f5 = (a: 1 | 2) => -a;
```
