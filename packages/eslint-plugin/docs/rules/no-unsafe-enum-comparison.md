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

declare let fruit: Fruit;

fruit === 999; // No error
```

This rule flags when an enum typed value is compared to a non-enum `number`.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
enum Fruit {
  Apple,
}

declare let fruit: Fruit;

fruit === 999;
```

```ts
enum Vegetable {
  Asparagus = 'asparagus',
}

declare let vegetable: Vegetable;

vegetable === 'asparagus';
```

### ✅ Correct

```ts
enum Fruit {
  Apple,
}

declare let fruit: Fruit;

fruit === Fruit.Banana;
```

```ts
enum Vegetable {
  Asparagus = 'asparagus',
}

declare let vegetable: Vegetable;

vegetable === Vegetable.Asparagus;
```

<!--/tabs-->

## When Not To Use It

If you don't mind number and/or literal string constants being compared against enums, you likely don't need this rule.

Separately, in the rare case of relying on an third party enums that are only imported as `type`s, it may be difficult to adhere to this rule.
You might consider using [ESLint disable comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1) for those specific situations instead of completely disabling this rule.
