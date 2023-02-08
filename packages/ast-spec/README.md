# `@typescript-eslint/ast-spec`

> Complete specification for the TypeScript-ESTree AST

This package includes:

- Node definitions as TypeScript types (the specification)
- Logic for converting from the TypeScript AST to the TypeScript-ESTree AST.
- Tests/Fixtures/Examples for each Node

## ✋ Internal Package

This is an _internal package_ to the [typescript-eslint monorepo](https://github.com/typescript-eslint/typescript-eslint).
You likely don't want to use it directly.

👉 See **https://typescript-eslint.io** for docs on typescript-eslint.

## Fixtures

This AST spec comes with a collection of _fixtures_, or small code snippets, used to verify AST correctness.

For more information, see [feat(ast-spec): add fixture test framework and some initial fixtures](https://github.com/typescript-eslint/typescript-eslint/pull/3258).

## Legacy Fixtures

The `legacy-fixtures` folder contains all of the old fixtures from our previous testing framework.
No new fixtures should be added to this folder, and instead we should be attempting to migrate and remove cases wherever possible.

For more information, see:

- [Repo: move `shared-fixtures` tests to `ast-spec` fixtures](https://github.com/typescript-eslint/typescript-eslint/issues/6065)
- [chore: migrated `shared-fixtures` to `ast-spec`](https://github.com/typescript-eslint/typescript-eslint/pull/6436)
