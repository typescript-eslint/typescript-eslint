# Enforces the any type is not used (no-explicit-any)

Using the `any` type defeats the purpose of using TypeScript.
When `any` is used, all compiler type checks around that value are ignored.

## Rule Details

This rule goes doesn't allow `any` types to be defined.
It aims to keep TypeScript maximally useful.
TypeScript has a compiler flag for `--noImplicitAny` that will prevent
an `any` type from being implied by the compiler, but doesn't prevent
`any` from being explicitly used.

The following patterns are considered warnings:

```ts
const age : any = "seventeen"
```

```ts
function greet () : any {}
```

The following patterns are not warnings:

```ts
const age : number = 17
```

```ts
function greet () : string {}
```

## When Not To Use It

If an unknown type or a library without typings is used
and you want to be able to specify `any`.

## Further Reading

* TypeScript [any type](https://www.typescriptlang.org/docs/handbook/basic-types.html#any)

## Compatibility

* TSLint: [no-any](https://palantir.github.io/tslint/rules/no-any/)
