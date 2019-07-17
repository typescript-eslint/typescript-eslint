# require or disallow semicolons instead of ASI (semi)

This rule enforces consistent use of semicolons after statements.

## Rule Details

This rule extends the base [eslint/semi](https://eslint.org/docs/rules/semi) rule.
It supports all options and features of the base rule.
This version adds support for numerous typescript features.

See also the [@typescript-eslint/member-delimiter-style](member-delimiter-style.md) rule,
which by default requires members to be delimited by semicolons.

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
