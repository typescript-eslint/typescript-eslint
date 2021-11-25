# Disallow literal numbers that lose precision (`no-loss-of-precision`)

## Rule Details

This rule extends the base [`eslint/no-loss-of-precision`](https://eslint.org/docs/rules/no-loss-of-precision) rule.
It adds support for [numeric separators](https://github.com/tc39/proposal-numeric-separator).
Note that this rule requires ESLint v7.

## How to Use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-loss-of-precision": "off",
  "@typescript-eslint/no-loss-of-precision": ["error"]
}
```

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/no-loss-of-precision.md)

</sup>

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

- Rule: [no-loss-of-precision.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-loss-of-precision.ts)
- Documentation: [no-loss-of-precision.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-loss-of-precision.md)
- Tests: [no-loss-of-precision.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-loss-of-precision.test.ts)
