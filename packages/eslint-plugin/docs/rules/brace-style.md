# Enforce consistent brace style for blocks (`brace-style`)

## Rule Details

This rule extends the base [`eslint/brace-style`](https://eslint.org/docs/rules/brace-style) rule.
It adds support for `enum`, `interface`, `namespace` and `module` declarations.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "brace-style": "off",
  "@typescript-eslint/brace-style": ["error"]
}
```

## Options

See [`eslint/brace-style` options](https://eslint.org/docs/rules/brace-style#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/brace-style.md)

</sup>

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

- Rule: [brace-style.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/brace-style.ts)
- Documentation: [brace-style.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/brace-style.md)
- Tests: [brace-style.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/brace-style.test.ts)
