---
description: 'Require exporting types that are used in exported entities.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/require-types-exports** for documentation.

When exporting entities from a module, it is recommended to export also all the
types that are used in their declarations. This is useful for consumers of the
module, as it allows them to use the types in their own code without having to
use utility types like [`Parameters`](https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype)
or [`ReturnType`](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)
in order to extract the types from your code.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
type Arg = string;
type Result = number;

export function strLength(arg: Arg): Result {
  return arg.length;
}

interface Fruit {
  name: string;
  color: string;
}

export const getFruitName = (fruit: Fruit) => fruit.name;

enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export declare function getRandomColor(): Color;
```

### ✅ Correct

```ts
export type Arg = string;
export type Result = number;

export function strLength(arg: Arg): Result {
  return arg.length;
}

export interface Fruit {
  name: string;
  color: string;
}

export const getFruitName = (fruit: Fruit) => fruit.name;

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export declare function getRandomColor(): Color;
```

<!--/tabs-->

## When Not To Use It

When you don't want to enforce exporting types that are used in exported functions declarations.
