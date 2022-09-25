---
description: 'Require both operands of addition to have type `number` or `string`.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/restrict-plus-operands** for documentation.

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
var foo = '5.5' + 5;
var foo = 1n + 1;
```

### ✅ Correct

```ts
var foo = parseInt('5.5', 10) + 10;
var foo = 1n + 1n;
```

## Options

### `checkCompoundAssignments`

Examples of code for this rule with `{ checkCompoundAssignments: true }`:

<!--tabs-->

#### ❌ Incorrect

```ts
/*eslint @typescript-eslint/restrict-plus-operands: ["error", { "checkCompoundAssignments": true }]*/

let foo: string | undefined;
foo += 'some data';

let bar: string = '';
bar += 0;
```

#### ✅ Correct

```ts
/*eslint @typescript-eslint/restrict-plus-operands: ["error", { "checkCompoundAssignments": true }]*/

let foo: number = 0;
foo += 1;

let bar = '';
bar += 'test';
```

### `allowAny`

Examples of code for this rule with `{ allowAny: true }`:

<!--tabs-->

#### ❌ Incorrect

```ts
var fn = (a: any, b: boolean) => a + b;
var fn = (a: any, b: []) => a + b;
var fn = (a: any, b: {}) => a + b;
```

#### ✅ Correct

```ts
var fn = (a: any, b: any) => a + b;
var fn = (a: any, b: string) => a + b;
var fn = (a: any, b: bigint) => a + b;
var fn = (a: any, b: number) => a + b;
```

## How to Use
