# require or disallow initialization in variable declarations (`init-declarations`)

## Rule Details

This rule extends the base [`eslint/init-declarations`](https://eslint.org/docs/rules/init-declarations) rule.
It adds support for TypeScript's `declare` variables.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "init-declarations": "off",
  "@typescript-eslint/init-declarations": ["error"]
}
```

## Options

See [`eslint/init-declarations` options](https://eslint.org/docs/rules/init-declarations#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/init-declarations.md)

</sup>

## Source

- Rule: [init-declarations.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/init-declarations.ts)
- Documentation: [init-declarations.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/init-declarations.md)
- Tests: [init-declarations.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/init-declarations.test.ts)

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
