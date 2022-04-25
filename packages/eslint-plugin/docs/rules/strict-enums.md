# `strict-enums`

Disallows the usage of unsafe enum patterns.

## Rule Details

Horrifyingly, the TypeScript compiler will allow you to set any number to a variable containing a number enum, like this:

```ts
enum Fruit {
  Apple,
  Banana,
}

let fruit = Fruit.Apple;
fruit = 999; // No error
```

This has resulted in many TypeScript programmers avoiding the use of enums altogether. Instead, they should use this rule, which bans working with enums in potentially unsafe ways.

See the examples below for the types of patterns that are prevented.

## Goals

The goal of this rule is to make enums work like they do in other languages. One of the main benefits of enums is that they allow you to write code that is future-safe, because enums are supposed to be resilient to reorganization. If you arbitrarily change the values of an enum (or change the ordering of an enum with computed values), the idea is that nothing in your code-base should break.

Subsequently, this rule bans potentially-dangerous patterns that you might already be using, like using the greater than operator to select a subset of enum values.

## Banned Patterns

This rule bans:

1. Mismatched enum declarations
1. Mismatched enum assignments
1. Enum incrementing/decrementing
1. Mismatched enum comparisons
1. Mismatched enum function arguments

<!--tabs-->

### ❌ Incorrect

```ts
const fruit: Fruit = 0;
```

```ts
let fruit = Fruit.Apple;
fruit = 1;
```

```ts
let fruit = Fruit.Apple;
fruit++;
```

```ts
if (fruit === 0) {
}
if (vegetable === 'lettuce') {
}
```

```ts
if (fruit > Fruit.Apple) {
}
```

```ts
function useFruit(fruit: Fruit) {}
useFruit(0);
```

### ✅ Correct

```ts
const fruit = Fruit.Apple;
```

```ts
let fruit = Fruit.Apple;
fruit = Fruit.Banana;
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
if (fruit !== Fruit.Apple) {
}
```

```ts
function useFruit(fruit: Fruit) {}
useFruit(Fruit.Apple);
```

## Number Enums vs String Enums

Surprisingly, the TypeScript compiler deals with string enums in a safer way than it does with number enums. If we duplicate the first example above by using a string enum, the TypeScript compiler will correctly throw an error:

```ts
enum Vegetable {
  Lettuce = 'lettuce',
  Carrot = 'carrot',
}

let vegetable = Vegetable.Lettuce;
vegetable = 'tomato'; // Type '"tomato"' is not assignable to type 'Vegetable'.

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

## Options

No options are provided.

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [x] 💭 Requires type information
