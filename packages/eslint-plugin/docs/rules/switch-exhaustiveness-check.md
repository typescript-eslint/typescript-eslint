---
description: 'Require switch-case statements to be exhaustive with union type.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/switch-exhaustiveness-check** for documentation.

When working with union types (or enums) in TypeScript, it is common to write a `switch` statement intended to contain a `case` for each constituent (possible type in the union). However, if the union type (or enum) is added to, it is easy to forget to modify the switch statements throughout the codebase to account for the new addition.

This rule reports when a `switch` statement over a value typed as a union of literals is missing a case for any of those literal types and does not have a `default` clause.

Additionally, this rule also reports when a `switch` statement has a case for everything in a union and _also_ contains a `default` case. `default` cases in this situation are obviously superfluous, as they would contain dead code. But beyond being superfluous, these kind of `default` cases are actively harmful: if a new value is added to the switch statement union, the `default` statement would prevent this rule from alerting you that you need to handle the new case.

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

## When Not To Use It

If you don't frequently `switch` over union types with many parts, or intentionally wish to leave out some parts.
