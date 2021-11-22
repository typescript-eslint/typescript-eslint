# Disallow `this` keywords outside of classes or class-like objects (`no-invalid-this`)

## Rule Details

This rule extends the base [`eslint/no-invalid-this`](https://eslint.org/docs/rules/no-invalid-this) rule.
It adds support for TypeScript's `this` parameters.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-invalid-this": "off",
  "@typescript-eslint/no-invalid-this": ["error"]
}
```

## Options

See [`eslint/no-invalid-this` options](https://eslint.org/docs/rules/no-invalid-this#options).

## When Not To Use It

When you are indifferent as to how your variables are initialized.

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/no-invalid-this.md)

</sup>

## Source

- Rule: [no-invalid-this.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-invalid-this.ts)
- Documentation: [no-invalid-this.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-invalid-this.md)
- Tests: [no-invalid-this.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-invalid-this.test.ts)

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
