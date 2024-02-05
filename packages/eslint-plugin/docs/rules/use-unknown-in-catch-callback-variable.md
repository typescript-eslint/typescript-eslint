---
description: 'Enforce typing arguments in .catch() callbacks as unknown.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/use-unknown-in-catch-callback-variable** for documentation.

In the context of exception handling, TypeScript treats the catch variable as `any` by default. However, `unknown` would be a more accurate type, so TypeScript [introduced the `useUnknownInCatchVariables` compiler option](<(https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#defaulting-to-the-unknown-type-in-catch-variables---useunknownincatchvariables)>) to treat the `catch` variable as `unknown` instead.

```ts
try {
  throw x;
} catch (err) {
  // err has type 'any' with useUnknownInCatchVariables: false
  // err has type 'unknown' with useUnknownInCatchVariables: true
}
```

The Promise analog of the `try-catch` block, [`Promise.prototype.catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch), is not affected by the `useUnknownInCatchVariables` compiler option, and its "`catch` variable" will always have the type `any`.

```ts
Promise.reject(x).catch(err => {
  // err has type 'any' regardless of `useUnknownInCatchVariables`
});
```

However, you can still provide an explicit type annotation, which lets you achieve the same effect as the `useUnknownInCatchVariables` option does for synchronous `catch` variables.

```ts
Promise.reject(x).catch((err: unknown) => {
  // err has type 'unknown'
});
```

This rule enforces that you always provide the `unknown` type annotation.

<!--tabs-->

### ❌ Incorrect

```ts
Promise.reject(new Error('I will reject!')).catch(err => {
  console.log(err);
});
```

### ✅ Correct

```ts
Promise.reject(new Error('I will reject!')).catch((err: unknown) => {
  console.log(err);
});
```

<!--/tabs-->

:::info
There is actually a way to have the `catch()` callback variable use the `unknown` type _without_ an explicit type annotation at the call sites, but it has the drawback that it involves overriding global type declarations. See [this comment](https://github.com/typescript-eslint/typescript-eslint/issues/7526#issuecomment-1690600813) on the proposal for this rule, and [this TypeScript issue](https://github.com/microsoft/TypeScript/issues/45602#issuecomment-934427206).
:::

## When Not To Use It

If your codebase does not use `useUnknownInCatchVariables`, it probably does not make sense to enable this rule, though it wouldn't have any adverse affects to do so. Alternately, if you have modified the global type declarations in order to make `catch()` callbacks use the `unknown` type without an explicit type annotation, you do not need this rule.
