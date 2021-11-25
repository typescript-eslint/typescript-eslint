# Enforce consistent indentation (`indent`)

## Warning

PLEASE READ THIS ISSUE BEFORE USING THIS RULE [#1824](https://github.com/typescript-eslint/typescript-eslint/issues/1824)

## Rule Details

This rule extends the base [`eslint/indent`](https://eslint.org/docs/rules/indent) rule.
It adds support for TypeScript nodes.

## How to Use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "indent": "off",
  "@typescript-eslint/indent": ["error"]
}
```

## Options

See [`eslint/indent` options](https://eslint.org/docs/rules/indent#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/indent.md)

</sup>

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

<!-- markdownlint-disable MD044 -->

- Rule: [indent.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/indent.ts)
- Documentation: [indent.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/indent.md)
- Tests: [indent.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/indent/indent.test.ts) and [indent-eslint.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/indent/indent-eslint.test.ts)

<!-- markdownlint-enable MD044 -->
