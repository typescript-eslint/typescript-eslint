# Disallow duplicate class members (`no-dupe-class-members`)

## Rule Details

This rule extends the base [`eslint/no-dupe-class-members`](https://eslint.org/docs/rules/no-dupe-class-members) rule.
It adds support for TypeScript's method overload definitions.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-dupe-class-members": "off",
  "@typescript-eslint/no-dupe-class-members": ["error"]
}
```

## Options

See [`eslint/no-dupe-class-members` options](https://eslint.org/docs/rules/no-dupe-class-members#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/no-dupe-class-members.md)

</sup>

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

- Rule: [no-dupe-class-members.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-dupe-class-members.ts)
- Documentation: [no-dupe-class-members.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-dupe-class-members.md)
- Tests: [no-dupe-class-members.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-dupe-class-members.test.ts)
