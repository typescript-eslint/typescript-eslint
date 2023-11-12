---
description: 'Require switch-case statements to be exhaustive.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/switch-exhaustiveness-check** for documentation.

When working with union types in TypeScript, it's common to want to write a `switch` statement intended to contain a `case` for each constituent (possible type in the union).
However, if the union type changes, it's easy to forget to modify the cases to account for any new types.

This rule reports when a `switch` statement over a value typed as a union of literals is missing a case for any of those literal types and does not have a `default` clause.

There is also an option to check the exhaustiveness of switches on non-union types by requiring a default clause.

## Examples

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

const day = 'Monday' as Day;
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

const day = 'Monday' as Day;
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

const day = 'Monday' as Day;
let result = 0;

switch (day) {
  case 'Monday':
    result = 1;
    break;
  default:
    result = 42;
}
```

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

## When Not To Use It

If you don't frequently `switch` over union types with many parts, or intentionally wish to leave out some parts.
