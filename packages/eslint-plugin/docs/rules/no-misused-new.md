---
description: 'Enforce valid definition of `new` and `constructor`.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-misused-new** for documentation.

Warns on apparent attempts to define constructors for interfaces or `new` for classes.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
class C {
  new(): C;
}

interface I {
  new (): I;
  constructor(): void;
}
```

### ✅ Correct

```ts
class C {
  constructor() {}
}
interface I {
  new (): C;
}
```
