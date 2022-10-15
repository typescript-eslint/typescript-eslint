---
description: 'Enforce using labeled tuple.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/prefer-labeled-tuple** for documentation.

TypeScript labeled tuple has no impact on type-checking, but it can improve the code readability more readable by giving meaningful names for the tuple members.

This rule enforces using labels for the tuple members.

## Examples

### ❌ Incorrect

```ts
type Position = [number, number];

function foo(...arg: [number, number]) {}
```

### ✅ Correct

```ts
type Position = [x: string, y: number];

function foo(...arg: [x: number, y: number]) {}
```

## Further Reading

- [TypeScript 4.0 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html)
