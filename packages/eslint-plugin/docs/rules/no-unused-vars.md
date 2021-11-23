# Disallow unused variables (`no-unused-vars`)

## Rule Details

This rule extends the base [`eslint/no-unused-vars`](https://eslint.org/docs/rules/no-unused-vars) rule.
It adds support for TypeScript features, such as types.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": ["error"]
}
```

## Options

See [`eslint/no-unused-vars` options](https://eslint.org/docs/rules/no-unused-vars#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/no-unused-vars.md)

</sup>

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

<!-- markdownlint-disable MD044 -->

- Rule: [no-unused-vars.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-unused-vars.ts)
- Documentation: [no-unused-vars.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-unused-vars.md)
- Tests: [no-unused-vars.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-unused-vars/no-unused-vars.test.ts) and [no-unused-vars-eslint.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-unused-vars/no-unused-vars-eslint.test.ts)
<!-- markdownlint-enable MD044 -->
