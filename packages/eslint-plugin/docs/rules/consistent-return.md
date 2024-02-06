---
description: 'Require `return` statements to either always or never specify values.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/consistent-return** for documentation.

This rule extends the base [`eslint/consistent-return`](https://eslint.org/docs/rules/consistent-return) rule.
This version adds support for functions that return `void` or `Promise<void>`.

<!--tabs-->

### ❌ Incorrect

```ts
function foo(): undefined {}
function bar(flag: boolean): undefined {
  if (flag) return foo();
  return;
}

async function baz(flag: boolean): Promise<undefined> {
  if (flag) return;
  return foo();
}
```

### ✅ Correct

```ts
function foo(): void {}
function bar(flag: boolean): void {
  if (flag) return foo();
  return;
}

async function baz(flag: boolean): Promise<void | number> {
  if (flag) return 42;
  return;
}
```
