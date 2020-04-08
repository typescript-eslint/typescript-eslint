# enforce dot notation whenever possible (`dot-notation`)

## Rule Details

This rule extends the base [`eslint/dot-notation`](https://eslint.org/docs/rules/dot-notation) rule.
It supports all options and features of the base rule.

## How to use

```cjson
{
  // note you must disable the base rule as it can report incorrect errors
  "dot-notation": "off",
  "@typescript-eslint/dot-notation": ["error"]
}
```

## Options

New options

- `allowPrivateClassPropertyAccess`

This allows square-bracket notation for private class members.

```ts
interface Options {
  allowPrivateClassPropertyAccess?: boolean;
}
```

```cjson
{
  "allowPrivateClassPropertyAccess": true,
}
```

See [`eslint/dot-notation` options](https://eslint.org/docs/rules/dot-notation#options).

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/dot-notation.md)</sup>
