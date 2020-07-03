# Disallow usage of the implicit `any` type in catch clauses (`no-implicit-any-catch`)

Using the `any` type defeats the purpose of using TypeScript.
When `any` is used, all compiler type checks around that value are ignored.

The noImplicitAny flag in TypeScript does not cover this due to backwards compatibility reasons.

## Rule Details

This rule requires an explicit type to be declared in the catch clause error argument.

The following pattern is considered a warning:

```ts
try {
  // ...
} catch (e) {
  // ...
}
```

The following patterns are not warnings:

```ts
try {
  // ...
} catch (e /*: unknown*/) {
  // ...
}
```

```ts
try {
  // ...
} catch (e /*: any*/) {
  // ...
}
```

## Options

The rule accepts an options object with the following properties:

```ts
type Options = {
  // if false, disallow specifying : any as the error type as well. See also `no-explicit-any`
  allowExplicitAny: boolean;
};

const defaults = {
  allowExplicitAny: true,
};
```

## Further Reading

- The original issue report for allowing `: unknown` in error clauses: https://github.com/microsoft/TypeScript/issues/36775
