# Disallow variable declarations from shadowing variables declared in the outer scope (`no-shadow`)

## Rule Details

This rule extends the base [`eslint/no-shadow`](https://eslint.org/docs/rules/no-shadow) rule.
It adds support for TypeScript's `this` parameters, and adds options for TypeScript features.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-shadow": "off",
  "@typescript-eslint/no-shadow": ["error"]
}
```

## Options

See [`eslint/no-shadow` options](https://eslint.org/docs/rules/no-shadow#options).
This rule adds the following options:

```ts
interface Options extends BaseNoShadowOptions {
  ignoreTypeValueShadow?: boolean;
}

const defaultOptions: Options = {
  ...baseNoShadowDefaultOptions,
  ignoreTypeValueShadow: true,
};
```

### `ignoreTypeValueShadow`

When set to `true`, the rule will ignore when you name a type and a variable with the same name.

Examples of **correct** code with `{ ignoreTypeValueShadow: true }`:

```ts
type Foo = number;
const Foo = 1;

interface Bar {
  prop: number;
}
const Bar = 'test';
```

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/no-shadow.md)</sup>
