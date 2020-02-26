# Restricts destructuring of tuple/arrays that may be empty (`safe-array-destructuring`)

Allow array destructuring to only be applied to tuple types, excluding tuple rest parameters.

The following Typescript code is valid even though it is clearly incorrect:

```ts
const arr: number[] = [];
const [first, second] = arr;
```

The issue is that array indexing is not defined in a type-safe way (as it usually happens in most known type systems).
This issue is discussed in [TS issue #13778](https://github.com/microsoft/TypeScript/issues/13778).
An approach to solve this is to change the definition of Array indexing in `lib.es5.d.ts`,
from:

```ts
interface Array<T> {
  // ...

  [n: number]: T;
}
```

to

```ts
interface Array<T> {
  // ...

  [n: number]: T | undefined;
}
```

This can be automated using something like [`patch-package`](https://github.com/ds300/patch-package) or some other postinstall script.

The problem that this rule aims to solve is that for `target` versions other than `es5` the approach with overriding the `Array` interface does not apply to array destructuring for some reason [TS issue #37045](https://github.com/microsoft/TypeScript/issues/37045).

Irregardless, this rule might be of use in projects where array destructuring needs to be more strictly enforced.

Examples of **incorrect** code for this rule:

```ts
const array: number[] = [];
const [first] = array;
```

```ts
const inner: { a: number[] } = { a: [] };
const {
  a: [value],
} = inner;
```

Examples of **correct** code for this rule:

```ts
const restTuple: [number, ...number[]] = [3];
const [first, ...rest] = restTuple;
```

```ts
type SemiTuple = [string, ...number[]];
const inner: { a: SemiTuple } = { a: ['test'] };

const {
  a: [value],
} = inner;
```

## Related To

- Typescript array [indexing issue](https://github.com/microsoft/TypeScript/issues/13778)
- TypeScript [`target` option issue](https://github.com/microsoft/TypeScript/issues/37045)
