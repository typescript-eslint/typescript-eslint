# Enforces consistent spacing before function parenthesis (`space-before-function-paren`)

## Rule Details

This rule extends the base [`eslint/space-before-function-paren`](https://eslint.org/docs/rules/space-before-function-paren) rule.
It adds support for generic type parameters on function calls.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "space-before-function-paren": "off",
  "@typescript-eslint/space-before-function-paren": ["error"]
}
```

## Options

See [`eslint/space-before-function-paren` options](https://eslint.org/docs/rules/space-before-function-paren#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/space-before-function-paren.md)

</sup>

## Source

- Rule: [space-before-function-paren.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/space-before-function-paren.ts)
- Documentation: [space-before-function-paren.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/space-before-function-paren.md)
- Tests: [space-before-function-paren.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/space-before-function-paren.test.ts)

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information
