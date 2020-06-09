# Disallow literal numbers that lose precision (`no-loss-of-precision`)

## Rule Details

This rule extends the base [`eslint/no-loss-of-precision`](https://eslint.org/docs/rules/no-loss-of-precision) rule.
It adds support for numeric separators.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-loss-of-precision": "off",
  "@typescript-eslint/no-loss-of-precision": ["error"]
}
```

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/no-loss-of-precision.md)</sup>
