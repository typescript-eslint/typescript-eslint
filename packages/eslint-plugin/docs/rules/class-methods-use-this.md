---
description: 'Enforce that class methods utilize `this`.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/class-methods-use-this** for documentation.

## Examples

This rule extends the base [`eslint/class-methods-use-this`](https://eslint.org/docs/rules/class-methods-use-this) rule.
It adds support for ignoring `override` methods or methods on classes that implement an interface.

## Options

This rule adds the following options:

```ts
interface Options extends BaseClassMethodsUseThisOptions {
  ignoreOverrideMethods?: boolean;
  ignoreClassesThatImplementAnInterface?: boolean;
}

const defaultOptions: Options = {
  ...baseClassMethodsUseThisOptions,
  ignoreOverrideMethods: false,
  ignoreClassesThatImplementAnInterface: false,
};
```

### `ignoreOverrideMethods`

Example of a correct code when `ignoreOverrideMethods` is set to `true`:

```ts
class X {
  override method() {}
  override property = () => {};
}
```

### `ignoreClassesThatImplementAnInterface`

Example of a correct code when `ignoreClassesThatImplementAnInterface` is set to `true`:

```ts
class X implements Y {
  method() {}
  property = () => {};
}
```
