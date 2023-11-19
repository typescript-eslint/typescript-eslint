---
description: 'Disallow unnecessary template literals.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-useless-template-literals** for documentation.

This rule reports template literals that can be simplified to a normal string literal.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
const ab1 = `${'a'}${'b'}`;
const ab2 = `a${'b'}`;

const stringWithNumber = `1 + 1 = ${2}`;

const stringWithBoolean = `${'true is '}${true}`;

const string = 'a';
const wrappedString = `${string}`;

declare const intersectionWithString: string & { _brand: 'test-brand' };
const wrappedIntersection = `${intersectionWithString}`;
```

### ✅ Correct

```ts
const string = 'a';
const concatenatedString = `${string}-b`;

const number = 1;
const concatenatedNumber = `${number}-2`;

const boolean = true;
const concatenatedBoolean = `${boolean}-false`;

const nullish = null;
const concatenatedNullish = `${nullish}-undefined`;

const left = 'left';
const right = 'right';
const concatenatedVariables = `${left}-${right}`;

const concatenatedExpressions = `${1 + 2}-${3 + 4}`;

const taggedTemplate = tag`${'a'}-${'b'}`;

const wrappedNumber = `${number}`;
const wrappedBoolean = `${boolean}`;
const wrappedNull = `${nullish}`;
```

<!--/tabs-->

## Related To

- [`restrict-template-expressions`](./restrict-template-expressions.md)
