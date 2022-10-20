---
description: 'Disallow using in operator for arrays.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-in-array** for documentation.

This rule bans using `in` operator for checking array members existence.

## Rule Details

Examples of code for this rule:

### ❌ Incorrect

```ts
const arr = ['a', 'b', 'c'];

if ('c' in arr) {
  // ...
}
```

### ✅ Correct

```ts
const arr = ['a', 'b', 'c'];

if (arr.includes('a')) {
  // ...
}
```

## When Not To Use It

When you want exactly iterate over array indexes.
