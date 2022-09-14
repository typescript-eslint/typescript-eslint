---
description: 'Only allow comparisons between primitive types.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/strict-comparisons** for documentation.

This rule disallows comparisons between any non-primitive types. It also disables ordering comparisons between strings.

Using `>` `<` `>=` `<=` to compare strings is often a mistake, but can be allowed using the `allowStringOrderComparison` option.

By default, any comparisons between objects are not allowed. Objects are compared by reference, and in many cases this is not what
the developer wanted. This can be allowed by using the `allowObjectEqualComparison` option.

## Examples

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
if (true > false) {
} // Not allowed

if (2 > undefined) {
} // Not allowed

if ({} > {}) {
} // Not allowed

if ('' > '') {
} // This can be allowed by using the "allowStringOrderComparison" option.

// The following expressions are invalid by default, but can be allowed by using the "allowObjectEqualComparison" option
if ({} === {}) {
} // Not allowed

if ([] === []) {
} // Not allowed

if ({} === undefined) {
} // Not allowed

const date1 = new Date(1550971894640);
const date2 = new Date(1550971894640);
if (date1 === date2) {
} // Not allowed

function sameObject<T>(a: T, b: T): boolean {
  return a === b; // Not allowed
}
```

### ✅ Correct

```ts
const s1 = 'a';
const s2 = 'b';
if (s1.localeCompare(s2) < 0) {
}

const o1 = {};
const o2 = {};
if (isEqual(o1, o2)) {
}
```

## Options

### `allowObjectEqualComparison`

Allows `!=` `==` `!==` `===` comparison between objects.

### `allowStringOrderComparison`

Allows `>` `<` `>=` `<=` comparison between strings.
