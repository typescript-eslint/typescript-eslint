---
description: 'Enforce the use of Array.prototype.find() over Array.prototype.filter() followed by [0] when looking for a single result.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/prefer-find** for documentation.

When searching for the first item in an array matching a condition, it may be tempting to use code like `arr.filter(x => x > 0)[0]`. However, it is simpler to use [Array.prototype.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find) instead, `arr.find(x => x > 0)`, which also returns the first entry matching a condition.

Beware that the two approaches are not quite identical, however! `.find()` will only execute the callback on array elements until it finds a match, whereas `.filter()` executes the callback for all array elements. Therefore, when fixing errors from this rule, be sure that your `.filter()` callbacks do not have side effects.

<!--tabs-->

### ❌ Incorrect

```ts
[1, 2, 3].filter(x => x > 1)[0];
```

### ✅ Correct

```ts
[1, 2, 3].find(x => x > 1);
```

## When Not To Use It

If you don't mind `.filter(...)[0]`, you can avoid this rule.
