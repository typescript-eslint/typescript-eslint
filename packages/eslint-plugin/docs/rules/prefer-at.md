---
description: 'Enforce the use of `array.at(-1)` instead of `array[array.length - 1]`.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/prefer-at** for documentation.

There are two ways to get the last item of the array:

- `arr[arr.length - 1]`: getting an item by index calculated relative to the length of the array.
- `arr.at(-1)`: getting an item by the `at` method. [Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at)

`arr.at(-1)` is a cleaner equivalent to `arr[arr.length - 1]`.

This rule supports the following types:

- `string` or `String`
- `Array`
- `Int8Array`
- `Uint8Array`
- `Uint8ClampedArray`
- `Int16Array`
- `Uint16Array`
- `Int32Array`
- `Float32Array`
- `Uint32Array`
- `Float64Array`
- `BigInt64Array`
- `BigUint64Array`

## Options

```ts
interface Options {
  ignoreFunctions?: boolean;
}
```

## Examples

### `ignoreFunctions = false` (default)

<!--tabs-->

### ❌ Incorrect

```ts
let arr = [1, 2, 3];
let a = arr[arr.length - 1];

function getArr(): Array<number> {
  return arr;
}
let b = getArr()[getArr().length - 1];
```

### ✅ Correct

```ts
let arr = [1, 2, 3];
let a = arr.at(-1);

function getArr(): Array<number> {
  return arr;
}
let b = getArr().at(-1);
```

<!--/tabs-->

### `ignoreFunctions = true`

<!--tabs-->

### ❌ Incorrect

```ts
let arr = [1, 2, 3];
let a = arr[arr.length - 1];
```

### ✅ Correct

```ts
let arr = [1, 2, 3];
let a = arr.at(-1);

function getArr(): Array<number> {
  return arr;
}
let b = getArr()[getArr().length - 1];
```

<!--/tabs-->

## When Not To Use It

If you support a browser that does not match
[this table](https://caniuse.com/mdn-javascript_builtins_array_at)
or use `node.js < 16.6.0` and don't include the polyfill
