---
description: 'Disallow aliasing `this`.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-this-alias** for documentation.

Assigning a variable to `this` instead of properly using arrow lambdas may be a symptom of pre-ES6 practices
or not managing scope well.

## Examples

<!--tabs-->

### ❌ Incorrect

```js
const self = this;

setTimeout(function () {
  self.doWork();
});
```

### ✅ Correct

```js
setTimeout(() => {
  this.doWork();
});
```

## Options

## When Not To Use It

If your project is structured in a way that it needs to assign `this` to variables, this rule is likely not for you.
If only a subset of your project assigns `this` to variables then you might consider using [ESLint disable comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1) for those specific situations instead of completely disabling this rule.
