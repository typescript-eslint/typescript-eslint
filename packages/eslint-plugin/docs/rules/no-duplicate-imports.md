# Disallow duplicate imports (`no-duplicate-imports`)

## Rule Details

This rule extends the base [`eslint/no-duplicate-imports`](https://eslint.org/docs/rules/no-duplicate-imports) rule.
This version adds support for type-only import and export.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-duplicate-imports": "off",
  "@typescript-eslint/no-duplicate-imports": ["error"]
}
```

## Options

See [`eslint/no-duplicate-imports` options](https://eslint.org/docs/rules/no-duplicate-imports#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/no-duplicate-imports.md)

</sup>

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

- Rule: [no-duplicate-imports.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-duplicate-imports.ts)
- Documentation: [no-duplicate-imports.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-duplicate-imports.md)
- Tests: [no-duplicate-imports.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-duplicate-imports.test.ts)
