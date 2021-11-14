# Enforces consistent usage of type exports (`consistent-type-exports`)

TypeScript 3.8 added support for type-only exports.

Type-only exports allow you to specify that 1 or more named exports are exported as type-only. This allows
transpilers to drop exports without knowing the types of the dependencies.

## Rule Details

This rule aims to standardize the use of type exports style across a codebase.

Given a class `Button`, and an interface `ButtonProps`, examples of code:

<!--tabs-->

### ❌ Incorrect

```ts
export { Button } from 'some-library';
export type { ButtonProps } from 'some-library';
```

### ✅ Correct

```ts
export { Button, ButtonProps } from 'some-library';
```

## When Not To Use It

- If you are using a TypeScript version less than 3.8, then you will not be able to use this rule as type exports are not supported.
- If you specifically want to use both export kinds for stylistic reasons, you can disable this rule.

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [x] 💭 Requires type information
