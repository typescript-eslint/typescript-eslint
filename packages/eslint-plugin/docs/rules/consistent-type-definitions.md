# Consistent with type definition either `interface` or `type` (consistent-type-definitions)

There are two ways to define a type.

```js
// type alias
type T1 = {
  a: string,
  b: number,
};

// interface
interface T2 {
  a: string;
  b: number;
}
```

## Rule Details

Examples of **incorrect** code with `interface` option.

```ts
type T = { x: number };
```

Examples of **correct** code with `interface` option.

```ts
type T = string;
type Foo = string | {};

interface T {
  x: number;
}
```

Examples of **incorrect** code with `type` option.

```ts
interface T {
  x: number;
}
```

Examples of **correct** code with `interface` option.

```ts
type T = { x: number };
```

## Options

This rule has two options:

```CJSON
{
    // Consistent with type definition by `interface`
    "@typescript-eslint/ban-types": ["error", "interface"]
}
```

Or for tabbed indentation:

```CJSON
{
    // Consistent with type definition by `type`
    "@typescript-eslint/ban-types": ["error", "type"]
}
```

## When Not To Use It

If you specifically want to use an interface or type literal for stylistic reasons, you can disable this rule.

## Compatibility

- TSLint: [interface-over-type-literal](https://palantir.github.io/tslint/rules/interface-over-type-literal/)
