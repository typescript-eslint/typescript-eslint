---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: Describing what an AST (Abstract Syntax Tree) is and why it's useful for ESLint and TypeScript tooling.
slug: upgrading-to-typescript-eslint-v6
tags: [breaking changes, typescript-eslint, v5, v6]
title: Upgrading to typescript-eslint v6
---

[typescript-eslint](https://typescript-eslint.io) is the tooling that enables standard JavaScript tools such as [ESLint](https://eslint.org) and [Prettier](https://prettier.io) to support TypeScript code.
We've been working on a set of breaking changes and general features that we're excited to get in front of users soon.
typescript-eslint v6 contains over a year's worth of improvements

## Trying Out v6

> Todo: actual setup instructions!

```shell
npm i @typescript-eslint/eslint-plugin@rc-v6  @typescript-eslint/parser@rc-v6
```

## New Features

## User-Facing Features

## User-Facing Features

## User-Facing Breaking Changes

### Configuration Breaking Changes

- [fix(eslint-plugin): remove valid-typeof disable in eslint-recommended](https://github.com/typescript-eslint/typescript-eslint/pull/5381): Removes the disabling of ESLint's `valid-typeof` rule from our preset configs.

#### [feat(eslint-plugin): rework configs: recommended, strict, stylistic; -type-checked](https://github.com/typescript-eslint/typescript-eslint/pull/5251)

The biggest configuration change in typescript-eslint v6 is that we've reworked the names of our [provided user configuration files](https://typescript-eslint.io/linting/configs).
typescript-eslint v5 provided three recommended configurations:

- [`plugin:@typescript-eslint/recommended`](https://typescript-eslint.io/linting/configs#recommended): Recommended rules for code correctness that you can drop in without additional configuration.
- [`plugin:@typescript-eslint/recommended-requiring-type-checking`](https://typescript-eslint.io/linting/configs#recommended-requiring-type-checking): Additional recommended rules that require type information.
- [`plugin:@typescript-eslint/strict`](https://typescript-eslint.io/linting/configs#strict): Additional strict rules that can also catch bugs but are more opinionated than recommended rules.

Those configurations worked well for most projects.
However, some users correctly noted two flaws in that approach:

- Strict rules that didn't require type checking were lumped in with those that did.
- _Stylistic_ best practices were lumped in with rules that actually find bugs.

As a result, we've reworked the configurations provided by typescript-eslint into the two sections:

- Functional rule configurations, for best best practices and code correctness:
  - `plugin:@typescript-eslint/recommended`: Recommended rules that you can drop in without additional configuration.
  - `plugin:@typescript-eslint/recommended-type-checked`: Additional recommended rules that require type information.
  - `plugin:@typescript-eslint/strict`: Additional strict rules that can also catch bugs but are more opinionated than recommended rules _(without type information)_.
  - `plugin:@typescript-eslint/strict-type-checked`: Additional strict rules that do require type information.
- Stylistic rule configurations, for consistent and predictable syntax usage:
  - `plugin:@typescript-eslint/stylistic`: Stylistic rules you can drop in without additional configuration.
  - `plugin:@typescript-eslint/stylistic-type-checked`: Additional stylistic rules that require type information.

> `plugin:@typescript-eslint/recommended-requiring-type-checking` is now an alias for `plugin:@typescript-eslint/recommended-type-checked`.
> The alias will be removed in a future major version.

As of v6, we recommend that projects enable two configs from the above:

- If you are _not_ using typed linting, enable `stylistic` and either `recommended` or `strict`, depending on how intensely you'd like your lint rules to scrutinize your code.
- If you _are_ using typed linting, enable `stylistic-type-checked` and either `recommended-type-checked` or `strict-type-checked`, depending on how intensely you'd like your lint rules to scrutinize your code.

See [Configs: Have recommended/strict configs include lesser configs, and simplify type checked names](https://github.com/typescript-eslint/typescript-eslint/discussions/6019) for the discussion leading up to these configuration changes.

#### Updated Configurations List

See [](https://github.com/typescript-eslint/typescript-eslint/discussions/6014) for

### Rule Breaking Changes

- [feat(eslint-plugin): deprecate no-type-alias](https://github.com/typescript-eslint/typescript-eslint/pull/6229): Deprecates [`@typescript-eslint/no-type-alias`](https://typescript-eslint.io/rules/no-this-alias), as it does not enforce any best practices we recommend.
- [feat(eslint-plugin): [prefer-nullish-coalescing]: add support for assignment expressions](https://github.com/typescript-eslint/typescript-eslint/pull/5234): Enhances the [`@typescript-eslint/prefer-nullish-coalescing`](https://typescript-eslint.io/prefer-nullish-coalescing) rule to also check `||=` expressions.

### Tooling Breaking Changes

- [feat(typescript-estree): deprecate createDefaultProgram](https://github.com/typescript-eslint/typescript-eslint/pull/5890): Renames `createDefaultProgram` to `deprecated__createDefaultProgram`, with associated `@deprecated` TSDoc tags and warnings.
- [feat: drop support for node v12](https://github.com/typescript-eslint/typescript-eslint/pull/5918)
- [feat: bump minimum supported TS version to 4.2.4](https://github.com/typescript-eslint/typescript-eslint/pull/5915)
- [chore: drop support for ESLint v6](https://github.com/typescript-eslint/typescript-eslint/pull/5972)

## Developer-Facing Breaking Changes

typescript-eslint v6 comes with a suite of cleanups and improvements for developers as well.
If you author any ESLint plugins or other tools that interact with TypeScript syntax, then we recommend you try out typescript-eslint v6 soon.
It includes some breaking changes that you may need to accommodate for.

:::tip
If you're having trouble working with the changes, please let us know!
:::

### AST Breaking Changes

These PRs changed the AST shapes generated by typescript-eslint when parsing code.
If you author any ESLint rules that refer to the syntax mentioned by them, these are relevant to you.

- [feat: made BaseNode.parent non-optional](https://github.com/typescript-eslint/typescript-eslint/pull/5252): makes the `node.parent` property on AST nodes non-optional (`TSESTree.Node` instead of `TSESTree.Node | undefined`).
- [fix(ast-spec): correct some incorrect ast types](https://github.com/typescript-eslint/typescript-eslint/pull/6257): applies the following changes to correct erroneous types of AST node properties:
  - `ArrayExpressions`'s `elements` property can now include `null` (i.e. is now `(Expression | SpreadElement | null)[]`), for the case of sparse arrays (e.g. `[1, , 3]`).
  - `MemberExpression`'s `object` property is now `Expression`, not `LeftHandSideExpression`.
  - `ObjectLiteralElement` no longer allows for `MethodDefinition`.
- [fix(typescript-estree): wrap import = declaration in an export node](https://github.com/typescript-eslint/typescript-eslint/pull/5885): Exported `TSImportEqualsDeclaration` nodes are now wrapped in an `ExportNamedDeclaration` node instead of having `.isExport = true` property.
- [fix(ast-spec): remove more invalid properties](https://github.com/typescript-eslint/typescript-eslint/pull/6243): applies the following changes to remove invalid properties from AST nodes:
  - `MethodDefinitionBase` no longer has a `typeParameters` property.
  - `TSIndexSignature`, `TSMethodSignature`, and `TSPropertySignatureBase` no longer have an `export` property.
  - `TSPropertySignatureBase` no longer has an `initializer` property.
- [fix(typescript-estree): account for namespace nesting in AST conversion](https://github.com/typescript-eslint/typescript-eslint/pull/6272): Namespaces with qualified names like `Abc.Def` now use a `TSQualifiedName` node, instead of a nested body structure.

### Other Developer-Facing Breaking Changes

- [feat: remove semantically invalid properties from TSEnumDeclaration, TSInterfaceDeclaration and TSModuleDeclaration](https://github.com/typescript-eslint/typescript-eslint/pull/4863): Removes some properties from those AST node types that should generally not have existed to begin with.
- [fix(utils): removed TRuleListener generic from the createRule](https://github.com/typescript-eslint/typescript-eslint/pull/5036): Makes `createRule`-created rules more portable in the type system.
- [feat(utils): remove (ts-)eslint-scope types](https://github.com/typescript-eslint/typescript-eslint/pull/5256): Removes no-longer-useful `TSESLintScope` types from the `@typescript-eslint/utils` package.
- [feat(scope-manager): ignore ECMA version](https://github.com/typescript-eslint/typescript-eslint/pull/5889): `@typescript-eslint/scope-manager` no longer includes properties referring to `ecmaVersion`, `isES6`, or other ECMA versioning options. It instead now always assumes ESNext.
- [feat(experimental-utils): console.warn on import of experimental-utils](https://github.com/typescript-eslint/typescript-eslint/pull/6179): The `@typescript-eslint/experimental-utils` package has since been renamed to `@typescript-eslint/utils`. The old package name now includes a `console.warn` message to indicate you should switch to the new package name.
- [feat: remove partial type-information program](https://github.com/typescript-eslint/typescript-eslint/pull/6066): When user configurations don't provide a `parserOptions.project`, parser services will no longer include a `program` with incomplete type information. `program` will be `null` instead.
  - As a result, the `errorOnTypeScriptSyntacticAndSemanticIssues` option will no longer be allowed if `parserOptions.project` is not provided.
- [chore(typescript-estree): remove visitor-keys backwards compat export](https://github.com/typescript-eslint/typescript-eslint/pull/6242): `visitorKeys` can now only be imported from `@typescript-eslint/visitor-keys`. Previously it was also re-exported by `@typescript-eslint/utils`.
- [feat: add package.json exports for public packages](https://github.com/typescript-eslint/typescript-eslint/pull/6458): `@typescript-eslint/*` packages now use `exports` to prevent importing internal file paths.

## Other Changes

## TODO: We'll thank everyone who contributed :)
