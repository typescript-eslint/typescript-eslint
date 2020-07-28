# Disallow variable redeclaration (`no-redeclare`)

## Rule Details

This rule extends the base [`eslint/no-redeclare`](https://eslint.org/docs/rules/no-redeclare) rule.
It adds support for TypeScript function overloads, and declaration merging.

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-redeclare": "off",
  "@typescript-eslint/no-redeclare": ["error"]
}
```

## Options

See [`eslint/no-redeclare` options](https://eslint.org/docs/rules/no-redeclare#options).
This rule adds the following options:

```ts
interface Options extends BaseNoShadowOptions {
  ignoreDeclarationMerge?: boolean;
}

const defaultOptions: Options = {
  ...baseNoShadowDefaultOptions,
  ignoreDeclarationMerge: true,
};
```

### `ignoreDeclarationMerge`

When set to `true`, the rule will ignore declaration merges between the following sets:

- interface + interface
- namespace + namespace
- class + interface
- class + namespace
- class + interface + namespace
- function + namespace

Examples of **correct** code with `{ ignoreDeclarationMerge: true }`:

```ts
interface A {
  prop1: 1;
}
interface A {
  prop2: 2;
}

namespace Foo {
  export const a = 1;
}
namespace Foo {
  export const b = 2;
}

class Bar {}
namespace Bar {}

function Baz() {}
namespace Baz {}
```

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/no-redeclare.md)</sup>
