# `object-curly-spacing`

Enforces consistent spacing inside braces.

## Rule Details

This rule extends the base [`eslint/object-curly-spacing`](https://eslint.org/docs/rules/object-curly-spacing) rule.
It adds support for TypeScript's object types.

## How to Use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "object-curly-spacing": "off",
  "@typescript-eslint/object-curly-spacing": ["error"]
}
```

## Options

See [`eslint/object-curly-spacing` options](https://eslint.org/docs/rules/object-curly-spacing#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/object-curly-spacing.md)

</sup>

## Attributes

- Configs:
  - [ ] ✅ Recommended
  - [ ] 🔒 Strict
- [x] 🔧 Fixable
- [ ] 💭 Requires type information
