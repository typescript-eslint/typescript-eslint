---
description: "Disallow using the spread operator on types that can't be spread."
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-misused-spread** for documentation.

The [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) (`...`) is a powerful feature in JavaScript, but it can only be used with types that support it. This rule disallows using the spread operator on types that can't be spread, or types that spreading them in specific cases can lead to unexpected behavior.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
declare const userName: string;
const chars = [...userName];

declare const arr: number[];
const arrSpread = { ...arr };

declare const set: Set<number>;
const setSpread = { ...set };

declare const map: Map<string, number>;
const mapSpread = { ...map };

declare function getObj(): { a: 1; b: 2 };
const getObjSpread = { ...getObj };
```

### ✅ Correct

```ts
declare const userName: string;
const chars = userName.split('');

declare const arr: number[];
const arrSpread = [...arr];

declare const set: Set<number>;
const setSpread = [...set];

declare const map: Map<string, number>;
const mapSpread = [...map];

declare function getObj(): { a: 1; b: 2 };
const getObjSpread = { ...getObj() };
```

<!--/tabs-->

## When Not To Use It

When you want to allow using the spread operator on types that can't be spread.
