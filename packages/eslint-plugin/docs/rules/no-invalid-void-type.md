# Disallows usage of `void` type outside of generic or return types (`no-invalid-void-type`)

Disallows usage of `void` type outside of generic or return types.
If `void` is used as return type, it shouldn’t be a part of intersection/union type.

## Rationale

The `void` type means “nothing” or that a function does not return any value,
in contra with implicit undefined type which means that a function returns a value `undefined`.
So “nothing” cannot be mixed with any other types. If you need this - use `undefined` type instead.

## Rule Details

This rule aims to ensure that the `void` type is only used in valid places.

The following patterns are considered warnings:

```ts
type PossibleValues = string | number | void;
type MorePossibleValues = string | ((number & any) | (string | void));

function logSomething(thing: void) {}
function printArg<T = void>(arg: T) {}

logAndReturn<void>(undefined);

interface Interface {
  lambda: () => void;
  prop: void;
}

class MyClass {
  private readonly propName: void;
}
```

The following patterns are not considered warnings:

```ts
type NoOp = () => void;

function noop(): void {}

let trulyUndefined = void 0;

async function promiseMeSomething(): Promise<void> {}
```

### Options

#### `allowGenerics`

This option lets you control if `void` can be used as a valid value for generics
by passing `true` or `false` accordingly.

Alternatively, you can provide an array of strings to only allow generic types by those names.

This option is `true` by default.

The following patterns are considered warnings with `{ allowGenerics: false }`:

```ts
logAndReturn<void>(undefined);

let voidPromise: Promise<void> = new Promise<void>(() => {});
let voidMap: Map<string, void> = new Map<string, void>();
```

The following patterns are considered warnings with `{ allowGenerics: ['Ex.Mx.Tx'] }`:

```ts
logAndReturn<void>(undefined);

type NotAllowedVoid1 = Mx.Tx<void>;
type NotAllowedVoid2 = Tx<void>;
type NotAllowedVoid3 = Promise<void>;
```

The following patterns are not considered warnings with `{ allowGenerics: ['Ex.Mx.Tx'] }`:

```ts
type AllowedVoid = Ex.MX.Tx<void>;
```

## When Not To Use It

If you don't care about if `void` is used with other types,
or in invalid places, then you don't need this rule.

## Compatibility

- TSLint: [invalid-void](https://palantir.github.io/tslint/rules/invalid-void/)
