# Disallow duplicate class members (`no-dupe-class-members`)

## Rule Details

This rule extends the base [`eslint/no-no-dupe-class-members`](https://eslint.org/docs/rules/no-no-dupe-class-members) rule.
It adds support for TypeScript's method overload definitions.

## How to use

```cjson
{
  // note you must disable the base rule as it can report incorrect errors
  "no-no-dupe-class-members": "off",
  "@typescript-eslint/no-no-dupe-class-members": ["error"]
}
```

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/no-no-dupe-class-members.md)</sup>
