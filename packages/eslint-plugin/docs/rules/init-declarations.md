# require or disallow initialization in variable declarations (`init-declarations`)

## Rule Details

This rule extends the base [`eslint/init-declarations`](https://eslint.org/docs/rules/init-declarations) rule.
It supports all options and features of the base rule.

## How to use

```cjson
{
  // note you must disable the base rule as it can report incorrect errors
  "init-declarations": "off",
  "@typescript-eslint/init-declarations": ["error"]
}
```

## Options

See [`eslint/init-declarations` options](https://eslint.org/docs/rules/init-declarations#options).

## When Not To Use It

When you are indifferent as to how your variables are initialized.

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/init-declarations.md)</sup>
