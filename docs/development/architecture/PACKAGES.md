---
id: packages
title: Packages
sidebar_label: Packages
---

This page describes the top-level packages exported by the [typescript-eslint monorepo](https://github.com/typescript-eslint/typescript-eslint).
Each of these are published as npm packages under the `@typescript-eslint` organization.

## `@typescript-eslint/eslint-plugin`

[`@typescript-eslint/eslint-plugin`] is the core [ESLint plugin](https://eslint.org/docs/user-guide/configuring/plugins) used by consumers to load in custom rules and rule configurations lists from typescript-eslint.
Those rules rely on ESLint using the `@typescript-eslint/parser` package described below, and are generally built using the other packages on this page.

## `@typescript-eslint/parser`

[`@typescript-eslint/parser`] takes in ESLint configuration settings, reads in TypeScript source text, and produces an ESTree AST.
This is necessary because TypeScript produces a different, incompatible AST format to the one that ESLint requires to work.

For example, this is not valid JavaScript code because it contains the `: number` type annotation:

```ts
let x: number = 1;
```

ESLint's native Espree parser would raise an error attempting to parse it.

Additionally, because TypeScript is developed separately and with different goals from ESLint, ESTree, and Espree, its AST also represents nodes differently in many cases.
TS's AST is optimized for its use case of parsing incomplete code and typechecking.
ESTree is unoptimized and intended for "general purpose" use-cases of traversing the AST.

See more on configuring custom parsers with ESLint on [ESLint's User Guide > Configuring > Plugins](https://eslint.org/docs/user-guide/configuring/plugins#specifying-parser).

:::tip
You can select `@typescript-eslint/parser` on the [TypeScript ESLint playground](https://typescript-eslint.io/play#showAST=es)'s left sidebar under _Options_ > _AST Explorer_ by selecting _ESTree_.
:::

## `@typescript-eslint/typescript-estree`

[`@typescript-eslint/typescript-estree`] is used by `@typescript-eslint/parser` to take TypeScript source code and produce the equivalent ESTree AST.
It works by:

1. Invoking the TypeScript compiler on the given source code in order to
   produce a TypeScript AST
2. Converting that TypeScript AST into an ESTree AST

> Because [`@typescript-eslint/typescript-estree`] has a very specific purpose, it is reusable for tools with similar
> requirements to ESLint.
> It is therefore also used to power the amazing opinionated code formatter [Prettier](https://prettier.io)'s TypeScript support.

## `@typescript-eslint/scope-manager`

[`@typescript-eslint/scope-manager`] is a fork of [`eslint-scope`](https://github.com/eslint/eslint-scope), enhanced to support TypeScript functionality.

A "scope analyser" traverses an AST and builds a model of how variables (and in our case, types) are defined and consumed by the source code.
This form of static analysis allows you to understand and trace variables throughout the program, allowing you to access powerful information about a program without needing to drop into the much, much heavier type information.

## `@typescript-eslint/utils`

[`@typescript-eslint/utils`] contains public utilities for writing custom rules and plugins in TypeScript.
Rules declared in `@typescript-eslint/eslint-plugin` are created using its utility functions.
Any custom rules you write generally will be as well.

## `@typescript-eslint/eslint-plugin-tslint`

[`@typescript-eslint/eslint-plugin-tslint`] is a separate ESLint plugin that allows running TSLint rules within ESLint to help you migrate from TSLint to ESLint.

:::caution
**TSLint is deprecated.** It is in your best interest to migrate off it entirely. See [Linting > TSLint](../../linting/TSLINT.md).
:::

[`@typescript-eslint/eslint-plugin-tslint`]: https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin-tslint
[`@typescript-eslint/eslint-plugin`]: https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin
[`@typescript-eslint/utils`]: https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/utils
[`@typescript-eslint/parser`]: https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/parser
[`@typescript-eslint/scope-manager`]: https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/scope-manager
[`@typescript-eslint/typescript-estree`]: https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/typescript-estree
[`@typescript-eslint/typescript-estree`]: https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/typescript-estree
