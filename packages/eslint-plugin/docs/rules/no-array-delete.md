---
description: 'Disallow delete operator for arrays.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-array-delete** for documentation.

In JavaScript `delete` operator in arrays makes the given index empty, and leaves the array length unchanged.
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

```js
declare const array: unknown[];
declare const index: number;

array.splice(index, 1);
```
