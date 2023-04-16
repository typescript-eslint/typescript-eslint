---
description: 'Enforce the use of `array.at(-1)` instead of `array[array.length - 1]`.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/prefer-at** for documentation.

There are two common ways to get the last item of an array:

- `arr[arr.length - 1]`: getting an item by index calculated relative to the length of the array.
- `arr.at(-1)`: getting an item by the [`at` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at).

`arr.at(-1)` is a cleaner equivalent to `arr[arr.length - 1]`.

This rule suggests code use `arr.at(-1)`, as it's cleaner than `arr[arr.length - 1]`.
It supports built-in array and string types, including integer arrays such as `Int8Array`.

## Options

### `ignoreFunctions`

This option enables ignoring arrays (and other supported types) returned from a function call.

Enable this option if you cannot guarantee that a function called with the same arguments returns the same result.

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

If you support a runtime environment that doesn't support [ES2022's `.at`](https://caniuse.com/mdn-javascript_builtins_array_at) and don't include a polyfill, you can ignore this rule.
