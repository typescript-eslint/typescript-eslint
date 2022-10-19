---
description: 'Require overridden methods to call super.method in their body.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/call-super-on-override** for documentation.

This rule enforces that overridden methods are calling exact super method to avoid missing super class method implementations.

## Rule Details

Examples of code for this rule:

### ❌ Incorrect

```ts
class Foo1 {
  bar(param: any): void {}
}

class Foo2 extends Foo1 {
  override bar(param: any): void {}
}
```

### ✅ Correct

```ts
class Foo1 {
  bar(param: any): void {}
}

class Foo2 extends Foo1 {
  override bar(param: any): void {
    super.bar(param);
  }
}
```


## When Not To Use It

When you are using TypeScript < 4.3 or you did not set `noImplicitOverride: true` in `CompilerOptions`
