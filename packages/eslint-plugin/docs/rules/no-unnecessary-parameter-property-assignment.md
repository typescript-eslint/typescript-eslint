---
description: 'Disallow unnecessary assignment of constructor property parameter to itself.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-unnecessary-parameter-property-assignment** for documentation.

## Examples

Prevents accidental assignment of a parameter property to itself. This assignment is not necessary and has no effect.

<!--tabs-->

### ❌ Incorrect

```ts
class Foo {
  constructor(public bar: string) {
    this.bar = bar;
  }
}
```

### ✅ Correct

```ts
class Foo {
  constructor(public bar: string) {}
}
```

## When Not To Use It

If you don't care about having unnecessary parameter property assignment, then you don't need to use this rule.
