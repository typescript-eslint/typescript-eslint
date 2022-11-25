---
description: 'Disallow the usage of unsafe enum code patterns.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/strict-enums** for documentation.

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

This rule flags the following unsafe enum practices:

- Changing a numeric enum's value with math operators such as increments or multiplying
  - TypeScript allows changing numeric enum values like `myValue++` as a convenience, even though the new value may not be in the enum.
- Assigning a value of one enum type to a recipient that's a different enum type
  - In other words, you are trying to assign a `Fruit` enum value to a variable with a `Vegetable` type.
- Comparing an enum value with another value that is not its same enum type
  - You might be trying to compare using a number literal, like `Fruit.Value1 === 1`. Or, you might be trying to compare use a disparate enum type, like `Fruit.Value1 === Vegetable.Value1`.
- Providing a value to a location where only one of those two is a particular enum type
  - You might be trying to use a number literal, like `useFruit(1)`. Or, you might be trying to use a disparate enum type, like `useFruit(Vegetable.Value1)`, where `useFruit` receives a parameter of type `Foo`.

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
if (fruit === 0) {
}
if (vegetable === 'lettuce') {
}
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
const fruit = Fruit.Apple;
```

```ts
let fruit = Fruit.Apple;
fruit = Fruit.Banana;
```

```ts
if (fruit === Fruit.Apple) {
}
if (vegetable === Vegetable.Lettuce) {
}
```

```ts
function useFruit(fruit: Fruit) {}
useFruit(Fruit.Apple);
```

<!--/tabs-->

## Rule Details

### Number Enums vs String Enums

Surprisingly, the TypeScript compiler deals with string enums in a safer way than it does with number enums. If we duplicate the first example above by using a string enum, the TypeScript compiler will correctly throw an error:

```ts
enum Vegetable {
  Lettuce = 'lettuce',
  Carrot = 'carrot',
}

let vegetable = Vegetable.Lettuce;
vegetable = 'definitelyNotAVegetable'; // Type '"definitelyNotAVegetable"' is not assignable to type 'Vegetable'.

// Even "valid" strings will not work, which is good!
vegetable = 'carrot'; // Type '"carrot"' is not assignable to type 'Vegetable'.
```

Thus, the `strict-enums` rule is mostly concerned with throwing errors for misused number enums. However, it still prevents mismatched comparison, which slips by the TypeScript compiler even for string enums:

```ts
// Bad
if (vegetable === 'lettuce') {
  // The TypeScript compiler allows this, but the `strict-enums` rule does not
}

// Good
if (vegetable === Vegetable.Lettuce) {
}
```

### Comparison Operators

Since it is a common pattern, this rule allows using greater than or less than to compare numeric enums, like this:

```ts
if (fruit > Fruit.Banana) {
}
```

This pattern allows you to select a subset of enums. However, it can lead to bugs when enum values are arbitrarily changed, because the subset will also change. The TypeScript compiler cannot warn you about this, so you should use this pattern with care.
