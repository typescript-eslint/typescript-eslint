# Prefers a non-null assertion over explicit type cast when possible (`non-nullable-type-assertion-style`)

This rule detects when an `as` cast is doing the same job as a `!` would, and suggests fixing the code to be an `!`.

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
const maybe = Math.random() > 0.5 ? '' : undefined;

const definitely = maybe as string;
const alsoDefinitely = <string>maybe;
```

### ✅ Correct

```ts
const maybe = Math.random() > 0.5 ? '' : undefined;

const definitely = maybe!;
const alsoDefinitely = maybe!;
```

## When Not To Use It

If you don't mind having unnecessarily verbose type casts, you can avoid this rule.

## Source

- Rule: [non-nullable-type-assertion-style.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/non-nullable-type-assertion-style.ts)
- Documentation: [non-nullable-type-assertion-style.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/non-nullable-type-assertion-style.md)
- Tests: [non-nullable-type-assertion-style.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/non-nullable-type-assertion-style.test.ts)

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [x] 💭 Requires type information
