---
description: 'Disallow providing non-enum values to enum typed locations.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-unsafe-enum-assignment** for documentation.

The TypeScript compiler can be surprisingly lenient when working with enums.
For example, it will allow you to assign any `number` value to a variable containing a numeric enum:

```ts
enum Fruit {
  Apple,
  Banana,
}

let fruit = Fruit.Apple;
fruit = 999; // No error
```

This rule flags when a `number` value is provided in a location that expects an enum type.

<!--tabs-->

### ❌ Incorrect

```ts
let fruit = Fruit.Apple;
fruit++;
```

```ts
const fruit: Fruit = 0;
```

```ts
function useFruit(fruit: Fruit) {}
useFruit(0);
```

### ✅ Correct

```ts
let fruit = Fruit.Apple;
fruit = Fruit.Banana;
```

```ts
const fruit: Fruit = Fruit.Apple;
```

```ts
function useFruit(fruit: Fruit) {}
useFruit(Fruit.Apple);
```

<!--/tabs-->

## When Not to Use It

If you use enums as shorthands for numbers and don't mind potentially unsafe `number`-typed values assigned to them, you likely don't need this rule.
