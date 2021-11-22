# Enforces consistent spacing before and after commas (`comma-spacing`)

## Rule Details

This rule extends the base [`eslint/comma-spacing`](https://eslint.org/docs/rules/comma-spacing) rule.
It adds support for trailing comma in a types parameters list.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "comma-spacing": "off",
  "@typescript-eslint/comma-spacing": ["error"]
}
```

## Options

See [`eslint/comma-spacing` options](https://eslint.org/docs/rules/comma-spacing#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/comma-spacing.md)

</sup>

## Source

- Rule: [comma-spacing.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/comma-spacing.ts)
- Documentation: [comma-spacing.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/comma-spacing.md)
- Tests: [comma-spacing.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/comma-spacing.test.ts)

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information
