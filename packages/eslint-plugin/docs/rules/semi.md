# require or disallow semicolons instead of ASI (semi)

This rule enforces consistent use of semicolons.

## Rule Details

This rule extends the base [eslint/semi](https://eslint.org/docs/rules/semi) rule.
It supports all options and features of the base rule.
This version adds support for numerous typescript features.

## How to use

```cjson
{
  // note you must disable the base rule as it can report incorrect errors
  "semi": "off",
  "@typescript-eslint/semi": ["error"]
}
```

## Options

See [eslint/semi options](https://eslint.org/docs/rules/semi#options).

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/semi.md)</sup>
