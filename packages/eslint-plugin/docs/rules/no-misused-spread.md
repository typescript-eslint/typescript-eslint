---
description: 'Disallow spread operator that shouldn\'t be spread most of the time.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-misused-spread** for documentation.

Spreading a function is almost always a mistake. Most of the time you forgot to call the function.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
const fn = () => ({ name: 'name' });
const obj = {
  ...fn,
  value: 1,
};
```

```ts
const fn = () => ({ value: 33 });
const otherFn = ({ value: number }) => ({ value: value });
otherFn({ ...fn });
```

### ✅ Correct

```ts
const fn = () => ({ name: 'name' });
const obj = {
  ...fn(),
  value: 1,
};
```

```ts
const fn = () => ({ value: 33 });
const otherFn = ({ value: number }) => ({ value: value });
otherFn({ ...fn() });
```
