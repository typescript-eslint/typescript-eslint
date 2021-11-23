# Disallow unnecessary parentheses (`no-extra-parens`)

## Rule Details

This rule extends the base [`eslint/no-extra-parens`](https://eslint.org/docs/rules/no-extra-parens) rule.
It adds support for TypeScript type assertions.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-extra-parens": "off",
  "@typescript-eslint/no-extra-parens": ["error"]
}
```

## Options

See [`eslint/no-extra-parens` options](https://eslint.org/docs/rules/no-extra-parens#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/no-extra-parens.md)

</sup>

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

- Rule: [no-extra-parens.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-extra-parens.ts)
- Documentation: [no-extra-parens.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-extra-parens.md)
- Tests: [no-extra-parens.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-extra-parens.test.ts)
