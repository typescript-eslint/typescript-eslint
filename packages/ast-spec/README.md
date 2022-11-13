# `@typescript-eslint/ast-spec`

[![NPM Version](https://img.shields.io/npm/v/@typescript-eslint/ast-spec.svg?style=flat-square)](https://www.npmjs.com/package/@typescript-eslint/ast-spec)
[![NPM Downloads](https://img.shields.io/npm/dm/@typescript-eslint/ast-spec.svg?style=flat-square)](https://www.npmjs.com/package/@typescript-eslint/ast-spec)

> ✋ This is an internal-facing package.
> You probably don't want to use it directly.

If you're building an ESLint plugin, consider using [`@typescript-eslint/utils`](../utils) and [`@typescript-eslint/type-utils`](../type-utils).
If you're parsing TypeScript code, consider using [`@typescript-eslint/typescript-estree`](../typescript-estree).

This is the complete specification for the TypeScript-ESTree AST.
It includes:

- Node definitions as TypeScript types (the specification)
- Logic for converting from the TypeScript AST to the TypeScript-ESTree AST.
- Tests/Fixtures/Examples for each Node
