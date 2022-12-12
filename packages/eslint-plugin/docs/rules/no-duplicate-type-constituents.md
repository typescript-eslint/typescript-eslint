---
description: 'Disallow duplicate constituents of union or intersection types.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-duplicate-type-constituents** for documentation.

Although TypeScript supports duplicate union and intersection constituents, people usually expect members to have unique values within the same intersection and union. Duplicate values make the code redundant and generally reduce readability.

## Rule Details

This rule disallows duplicate union or intersection constituents.

It determines whether two types are equivalent in the following way.

1. whether the syntax is exactly the same.
2. whether TypeScript treats them as the same type.

If either of the two conditions is satisfied, It treats the two types as duplicates.

<!--tabs-->

### ❌ Incorrect

```ts
type T1 = 'A' | 'A';

type T2 = A | A | B;

type T3 = { a: string } & { a: string };

type T4 = [1, 2, 3] & [1, 2, 3];

type StringA = string;
type StringB = string;
type T5 = StringA | StringB;
```

### ✅ Correct

```ts
type T1 = 'A' | 'B';

type T2 = A | B | C;

type T3 = { a: string } & { b: string };

type T4 = [1, 2, 3] & [1, 2, 3, 4];

type StringA = string;
type NumberB = string;
type T5 = StringA | NumberB;
```

## Options

### `ignoreIntersections`

When set to true, duplicate checks on intersection type members are ignored.

### `ignoreUnions`

When set to true, duplicate checks on union type members are ignored.
