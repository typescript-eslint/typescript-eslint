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

### Note

Class properties that have `function` value are not considered as real method override and cause `SyntaxError` on super calls:

```ts
class Foo1 {
  bar1 = function () {};

  bar2 = () => {};
}

class Foo2 extends Foo1 {
  override bar1 = function () {
    super.bar1(); // SyntaxError: 'super' keyword unexpected here
  };

  override bar2 = () => {
    super.bar2(); // SyntaxError: 'super' keyword unexpected here
  };
}
```

## When Not To Use It

When you are using TypeScript < 4.3 or you did not set `noImplicitOverride: true` in `CompilerOptions`
