---
description: 'Disallow delete operator for arrays.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-array-delete** for documentation.

In JavaScript, using the `delete` operator on an array makes the given index empty and leaves the array length unchanged.
See [MDN's _Deleting array elements_ documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete#deleting_array_elements) for more information.
This can sometimes cause problems with performance and unexpected behaviors around array loops and index accesses.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
declare const array: unknown[];
declare const index: number;

delete array[index];
```

### ✅ Correct

```ts
declare const array: unknown[];
declare const index: number;

array.splice(index, 1);
```
