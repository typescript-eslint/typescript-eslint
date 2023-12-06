---
description: 'Require switch-case statements to be exhaustive.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/switch-exhaustiveness-check** for documentation.

When working with union types or enums in TypeScript, it is common to want to write a `switch` statement intended to contain a `case` for each possible type in the union or the enum.
However, if the union type or the enum changes, it is easy to forget to modify the cases to account for any new types.

This rule reports when a `switch` statement over a value typed as a union of literals or as an enum is missing a case for any of those literal types and does not have a `default` clause.

There is also an option to check the exhaustiveness of switches on non-union types by requiring a default clause.

## Options

### `"allowDefaultCase"`

Defaults to true. If set to false, this rule will also report when a `switch` statement has a case for everything in a union and _also_ contains a `default` case. Thus, by setting this option to false, the rule becomes stricter.

`default` cases in this situation are obviously superfluous, as they would contain dead code. But beyond being superfluous, these kind of `default` cases can be harmful: if a new value is added to the switch statement union, the `default` statement would prevent the `switch-exhaustiveness-check` rule from alerting you that you need to handle the new case.

Why is this important? Consider why TypeScript is valuable: when we add a new argument to a widely-used function, we don't have to go on a scavenger hunt through our codebase. We can simply run the TypeScript compiler and it will tell us all the exact places in the code that need to be updated. The `switch-exhaustiveness-check` rule is similar: when we add a new enum member, we don't have to go on a scavenger hunt. We can simply run ESLint and it will tell us all the exact places in the code that need to be updated. So in order to preserve the ability of ESLint to do this, we have to remove the `default` cases.

Note that in some situations, like when switch statements use data from external APIs, `default` cases can be valuable, so you might want to turn the option off. For example, if you update the API of a web application to return a new value, it is possible that users will be using the app on the older version and have not refreshed the page yet. Thus, they might query the new API on an older version of the code, which would result in undefined behavior. In these kinds of situations, you might want to enforce an explicit `default` case that throws an error, or allows the user to safely save their work, or something along those lines.

## Examples

When the switch doesn't have exhaustive cases, either filling them all out or adding a default will correct the rule's complaint.

Here are some examples of code working with a union of literals:

<!--tabs-->

### ❌ Incorrect

```ts
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

declare const day: Day;
let result = 0;

switch (day) {
  case 'Monday':
    result = 1;
    break;
}
```

### ✅ Correct

```ts
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

declare const day: Day;
let result = 0;

switch (day) {
  case 'Monday':
    result = 1;
    break;
  case 'Tuesday':
    result = 2;
    break;
  case 'Wednesday':
    result = 3;
    break;
  case 'Thursday':
    result = 4;
    break;
  case 'Friday':
    result = 5;
    break;
  case 'Saturday':
    result = 6;
    break;
  case 'Sunday':
    result = 7;
    break;
}
```

### ✅ Correct

```ts
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

declare const day: Day;
let result = 0;

switch (day) {
  case 'Monday':
    result = 1;
    break;
  default:
    result = 42;
}
```

<!--/tabs-->

Likewise, here are some examples of code working with an enum:

<!--tabs-->

### ❌ Incorrect

```ts
enum Fruit {
  Apple,
  Banana,
  Cherry,
}

declare const fruit: Fruit;

switch (fruit) {
  case Fruit.Apple:
    console.log('an apple');
    break;
}
```

### ✅ Correct

```ts
enum Fruit {
  Apple,
  Banana,
  Cherry,
}

declare const fruit: Fruit;

switch (fruit) {
  case Fruit.Apple:
    console.log('an apple');
    break;

  case Fruit.Banana:
    console.log('a banana');
    break;

  case Fruit.Cherry:
    console.log('a cherry');
    break;
}
```

### ✅ Correct

```ts
enum Fruit {
  Apple,
  Banana,
  Cherry,
}

declare const fruit: Fruit;

switch (fruit) {
  case Fruit.Apple:
    console.log('an apple');
    break;

  default:
    console.log('a fruit');
    break;
}
```

<!--/tabs-->

## Options

### `requireDefaultForNonUnion`

Examples of additional **incorrect** code for this rule with `{ requireDefaultForNonUnion: true }`:

```ts option='{ "requireDefaultForNonUnion": true }' showPlaygroundButton
const value: number = Math.floor(Math.random() * 3);

switch (value) {
  case 0:
    return 0;
  case 1:
    return 1;
}
```

Since `value` is a non-union type it requires the switch case to have a default clause only with `requireDefaultForNonUnion` enabled.

<!--/tabs-->

## When Not To Use It

If you don't frequently `switch` over union types or enums with many parts, or intentionally wish to leave out some parts, this rule may not be for you.
