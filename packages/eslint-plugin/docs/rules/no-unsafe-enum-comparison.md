---
description: 'Disallow comparing an enum value with a non-enum value.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-unsafe-enum-comparison** for documentation.

The TypeScript compiler can be surprisingly lenient when working with enums.
For example, it will allow you to compare enum values against numbers even though they might not have any type overlap:

```ts
enum Fruit {
  Apple,
  Banana,
}

let fruit = Fruit.Apple;
fruit === 999; // No error
```

This rule flags when an enum typed value is compared to a non-enum `number`.

<!--tabs-->

### ❌ Incorrect

```ts
let fruit = Fruit.Apple;
fruit === 999;
```

### ✅ Correct

```ts
let fruit = Fruit.Apple;
fruit === Fruit.Banana;
```

<!--/tabs-->

## To Do: Add Option For Comparison Operators

Since it is a common pattern, this rule allows using greater than or less than to compare numeric enums, like this:

```ts
if (fruit > Fruit.Banana) {
}
```

This pattern allows you to select a subset of enums. However, it can lead to bugs when enum values are arbitrarily changed, because the subset will also change. The TypeScript compiler cannot warn you about this, so you should use this pattern with care.
