---
description: 'Disallow passing non-Thenable values to promise aggregators.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/thenable-in-promise-aggregators** for documentation.

A "Thenable" value is an object which has a `then` method, such as a Promise.
The `await` keyword is generally used to retrieve the result of calling a Thenable's `then` method.

When multiple Thenable's are running at the same time, it is sometimes desirable to wait until any one of them resolves (`Promise.race`), all of them resolve or any of them reject (`Promise.all`), or all of them resolve or reject (`Promise.allSettled`).

Each of these functions accept an iterable of promises as input and return a single
Promise.
If a non-Thenable is passed, it is ignored.
While doing so is valid JavaScript, it is often a programmer error, such as forgetting to unwrap a wrapped promise, or using the `await` keyword on the individual promises, which defeats the purpose of using one of these Promise aggregators.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
await Promise.race(['value1', 'value2']);

await Promise.race([
  await new Promise(resolve => setTimeout(resolve, 3000)),
  await new Promise(resolve => setTimeout(resolve, 6000)),
]);
```

### ✅ Correct

```ts
await Promise.race([Promise.resolve('value1'), Promise.resolve('value2')]);

await Promise.race([
  new Promise(resolve => setTimeout(resolve, 3000)),
  new Promise(resolve => setTimeout(resolve, 6000)),
]);
```

## When Not To Use It

If you want to allow code to use `Promise.race`, `Promise.all`, or `Promise.allSettled` on arrays of non-promise values.
This is generally not preferred but can sometimes be useful for visual consistency.
You might consider using [ESLint disable comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1) for those specific situations instead of completely disabling this rule.
