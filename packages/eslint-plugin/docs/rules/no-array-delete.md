---
description: 'Disallow delete operator for arrays.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-array-delete** for documentation.

In JavaScript `delete` operator in arrays makes the given index empty, and leaves the array length as is. this may
cause a problem for optimizing and undefined behaviors like getting `undefined` when accessing that index.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
declare const array: any[];
declare const index: number;

delete array[index];
```

### ✅ Correct

```js
declare const array: any[];
declare const index: number;

array.splice(index, 1);
```
