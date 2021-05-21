# require or disallow padding lines between statements (`padding-line-between-statements`)

## Rule Details

This rule extends the base [`eslint/padding-line-between-statements`](https://eslint.org/docs/rules/padding-line-between-statements) rule.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "padding-line-between-statements": "off",
  "@typescript-eslint/padding-line-between-statements": [
    "error",
    {
      "blankLine": "always",
      "prev": "var",
      "next": "return"
    }
  ]
}
```

## Options

See [`eslint/padding-line-between-statements` options](https://eslint.org/docs/rules/padding-line-between-statements#options).

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/padding-line-between-statements.md)</sup>
