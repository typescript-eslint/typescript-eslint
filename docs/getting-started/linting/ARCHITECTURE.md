---
id: architecture
title: Architecture
sidebar_label: Architecture
---

## Abstract Syntax Trees (AST)s

Parsers such as those in ESLint and TypeScript read in the text of source code and parse it into a standard format they can reason about.
ASTs are called such because although they might contain information on the location of constructs within source code, they are an abstract representation that cares more about the semantic structure.

For example, given this line of code:

```js
1 + 2;
```

ESLint would natively understand it as an object like:

```json
{
  "type": "ExpressionStatement",
  "expression": {
    "type": "BinaryExpression",
    "left": {
      "type": "Literal",
      "value": 1,
      "raw": "1"
    },
    "operator": "+",
    "right": {
      "type": "Literal",
      "value": 2,
      "raw": "2"
    }
  }
}
```

ESLint uses an AST format known as **[`estree`]**.

ESTree is more broadly used than just for ESLint -- it is the de facto community standard.
ESLint' built-in parser that outputs an `estree`-shaped AST is also a separate package, called **[`espree`]**.

:::note
You can play more with various ASTs such as ESTree on [astexplorer.net] and read more details on their [Wikipedia article](https://en.wikipedia.org/wiki/Abstract_syntax_tree).
:::

## `@typescript-eslint/parser`

TypeScript produces a different AST format to the one that ESLint requires to work.
This means that by default, the TypeScript AST is not compatible with ESLint.

For example:

```ts
let x: number = 1;
```

That is not valid JavaScript code because it contains the `: number` type annotation.
ESLint's native Espree parser would raise an error attempting to parse it.

Additionally, because TypeScript is developed separately from ESLint, ESTree, and Espree, its AST also represents nodes differently in many cases.
Many nodes have different names or different member structures.

[`@typescript-eslint/parser`] is a parser that takes in ESLint configuration settings, reads in TypeScript source text, and produces an ESTree AST.

ESLint allows specifying custom parsers such as `@typescript-eslint/parser`.
See more on https://eslint.org/docs/user-guide/configuring/plugins#specifying-parser.

:::note
You can select the `@typescript-eslint/parser` on the top-middle ⚙ dropdown in [astexplorer.net] that defaults to Acorn.
:::

### `@typescript-eslint/typescript-estree`

[`@typescript-eslint/typescript-estree`] is the utility package used by `@typescript-eslint/parser` to take TypeScript source code and produce the equivalent ESTree AST.
It works by:

1. Invoking the TypeScript compiler on the given source code in order to
   produce a TypeScript AST
2. Converting that TypeScript AST into an ESTree AST

> Because [`@typescript-eslint/typescript-estree`] has a very specific purpose, it is reusable for tools with similar
> requirements to ESLint.
> It is therefore also used to power the amazing opinionated code formatter [Prettier](https://prettier.io)'s TypeScript support.

### `@typescript-eslint/scope-manager`

`@typescript-eslint/scope-manager` is a fork of [`eslint-scope`](https://github.com/eslint/eslint-scope), enhanced to support TypeScript functionality.

A "scope analyser" traverses an AST and builds a model of how variables (and in our case, types) are defined and consumed by the source code.
This form of static analysis allows you to understand and trace variables throughout the program, allowing you to access powerful information about a program without needing to drop into the much, much heavier type information.

[`@typescript-eslint/parser`]: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser
[`@typescript-eslint/scope-manager`]: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/scope-manager
[`@typescript-eslint/typescript-estree`]: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/typescript-estree
[astexplorer.net]: https://astexplorer.net
[`espree`]: https://github.com/eslint/espree
[`estree`]: https://github.com/estree/estree
