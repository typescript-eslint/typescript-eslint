# Enforces consistent usage of type exports (`consistent-type-exports`)

TypeScript 3.8 added support for type-only exports.

Type-only exports allow you to specify that 1 or more named exports are exported as type-only. This allows
transpilers to drop exports without knowing the types of the dependencies.

## Rule Details

This rule aims to standardize the use of type exports style across the codebase.

Given a class `Button`, and an interface `ButtonProps`, examples of **correct** code:

```ts
export { Button } from 'some-library';
export type { ButtonProps } from 'some-library';
```

Examples of **incorrect** code:

```ts
import { Button, ButtonProps } from 'some-library';
```

## When Not To Use It

- If you are not using TypeScript 3.8 (or greater), then you will not be able to use this rule, as type-only imports are not allowed.
