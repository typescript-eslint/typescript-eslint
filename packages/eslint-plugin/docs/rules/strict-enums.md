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

## Banned Patterns

This rule bans:

1. Enum incrementing/decrementing - `incorrectIncrement`
1. Mismatched enum declarations/assignments - `mismatchedAssignment`
1. Mismatched enum comparisons - `mismatchedComparison`
1. Mismatched enum function arguments - `mismatchedFunctionArgument`

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

## Error Information

- `incorrectIncrement` - You cannot increment or decrement an enum type.
  - Enums are supposed to be resilient to reorganization, so you should explicitly assign a new value instead. For example, if someone someone reassigned/reordered the values of the enum, then it could potentially break your code.
- `mismatchedAssignment` - The type of the assignment does not match the declared enum type of the variable.
  - In other words, you are trying to assign a `Foo` enum value to a variable with a `Bar` type. Enums are supposed to be resilient to reorganization, so these kinds of assignments can be dangerous.
- `mismatchedComparison` - The two things in the comparison do not have a shared enum type.
  - You might be trying to compare using a number literal, like `Foo.Value1 === 1`. Or, you might be trying to compare use a disparate enum type, like `Foo.Value1 === Bar.Value1`. Either way, you need to use a value that corresponds to the correct enum, like `foo === Foo.Value1`, where `foo` is type `Foo`. Enums are supposed to be resilient to reorganization, so these types of comparisons can be dangerous.
- `mismatchedFunctionArgument` - The argument in the function call does not match the declared enum type of the function signature.
  - You might be trying to use a number literal, like `useFoo(1)`. Or, you might be trying to use a disparate enum type, like `useFoo(Bar.Value1)`. Either way, you need to use a value that corresponds to the correct enum, like `useFoo(Foo.Value1)`. Enums are supposed to be resilient to reorganization, so non-exact function calls like this can be dangerous.

## Number Enums vs String Enums

Surprisingly, the TypeScript compiler deals with string enums in a safer way than it does with number enums. If we duplicate the first example above by using a string enum, the TypeScript compiler will correctly throw an error:

```ts
enum Vegetable {
  Lettuce = 'lettuce',
  Carrot = 'carrot',
}

let vegetable = Vegetable.Lettuce;
vegetable = 'definatelyNotAVegetable'; // Type '"definatelyNotAVegetable"' is not assignable to type 'Vegetable'.

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

## Comparison Operators

Since it is a common pattern, this rule allows using greater than or less than to compare numeric enums, like this:

```ts
if (fruit > Fruit.Banana) {
}
```

This pattern allows you to select a subset of enums. However, it can lead to bugs when enum values are arbitrarily changed, because the subset will also change. The TypeScript compiler cannot warn you about this, so you should use this pattern with care.

## Options

No options are provided.

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [x] 💭 Requires type information
