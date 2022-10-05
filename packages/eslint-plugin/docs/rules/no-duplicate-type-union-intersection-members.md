---
description: 'Disallow duplicate union/intersection type members.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-duplicate-type-union-intersection-members** for documentation.

Although TypeScript supports duplicate union and intersection member values, people usually expect members to have unique values within the same intersection and union. Duplicate values make the code redundant and generally reduce readability.

## Rule Details

This rule disallows duplicate union or intersection type members. It only checks duplication on the notation. Members with the same value but different names are not marked duplicates.

<!--tabs-->

### ❌ Incorrect

```ts
type T1 = A | A | B;

type T2 = { a: string } & { a: string };

type T3 = [1, 2, 3] & [1, 2, 3];

type T4 = () => string | string;
```

### ✅ Correct

```ts
type T1 = A | B | C;

type T2 = { a: string } & { b: string };

type T3 = [1, 2, 3] & [1, 2, 3, 4];

type T4 = () => string | number;
```

## Options

### `ignoreIntersections`

When set to true, duplicate checks on intersection type members are ignored.

### `ignoreUnions`

When set to true, duplicate checks on union type members are ignored.
