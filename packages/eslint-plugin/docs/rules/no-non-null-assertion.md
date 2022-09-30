---
description: 'Disallow non-null assertions using the `!` postfix operator.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-non-null-assertion** for documentation.

## Examples

Using non-null assertions cancels the benefits of the strict null-checking mode.

<!--tabs-->

### ❌ Incorrect

```ts
interface Foo {
  bar?: string;
}

const foo: Foo = getFoo();
const includesBaz: boolean = foo.bar!.includes('baz');
```

### ✅ Correct

```ts
interface Foo {
  bar?: string;
}

const foo: Foo = getFoo();
const includesBaz: boolean = foo.bar?.includes('baz') ?? false;
```

## When Not To Use It

If you don't care about strict null-checking, then you will not need this rule.
