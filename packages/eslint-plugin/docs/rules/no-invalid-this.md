> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-invalid-this** for documentation.

## Rule Details

This rule extends the base [`eslint/no-invalid-this`](https://eslint.org/docs/rules/no-invalid-this) rule.
It adds support for TypeScript's `this` parameters.

## How to Use

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
