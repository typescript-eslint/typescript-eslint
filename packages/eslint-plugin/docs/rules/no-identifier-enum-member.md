# Disallow identifier (aka variable) enum members (`no-identifier-enum-member`)

TypeScript allows the value of an enum member to be any valid JavaScript expression. However, because enums create their own scope whereby
each enum member becomes a variable in that scope, unexpected values could be used at runtime. Example:

```ts
const imOutside = 2;
const b = 2;
enum Foo {
  outer = imOutside,
  a = 1,
  b = a,
  c = b,
  // does c == Foo.b == Foo.c == 1?
  // or does c == b == 2?
}
```

The answer is that `Foo.c` will be `1` at runtime. The [playground](https://www.typescriptlang.org/play/#src=const%20imOutside%20%3D%202%3B%0D%0Aconst%20b%20%3D%202%3B%0D%0Aenum%20Foo%20%7B%0D%0A%20%20%20%20outer%20%3D%20imOutside%2C%0D%0A%20%20%20%20a%20%3D%201%2C%0D%0A%20%20%20%20b%20%3D%20a%2C%0D%0A%20%20%20%20c%20%3D%20b%2C%0D%0A%20%20%20%20%2F%2F%20does%20c%20%3D%3D%20Foo.b%20%3D%3D%20Foo.c%20%3D%3D%201%3F%0D%0A%20%20%20%20%2F%2F%20or%20does%20c%20%3D%3D%20b%20%3D%3D%202%3F%0D%0A%7D) illustrates this quite nicely.

## Rule Details

This rule is meant to prevent unexpected results in code by prohibiting the use of identifiers (aka variables) as enum members to prevent unexpected runtime behavior. All other values should be allowed since they do not have this particular issue.

Examples of **incorrect** code for this rule:

```ts
const str = 'Test';
enum Invalid {
  A = str, // Variable assignment
}
```

Examples of **correct** code for this rule:

```ts
enum Valid {
  A,
  B = 'TestStr', // A regular string
  C = 4, // A number
  D = null,
  E = /some_regex/,
  F = 2 + 2, // Expressions
  G = {}, // Objects
  H = [], // Arrays
  I = new Set([1, 2, 3]), // Any constructable class
}
```

## Options

There are no options.

## When Not To Use It

If you want the value of an enum member to be stored as a variable, do not use this rule.
