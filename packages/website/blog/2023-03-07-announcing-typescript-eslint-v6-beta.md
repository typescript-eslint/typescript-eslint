---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: Describing what an AST (Abstract Syntax Tree) is and why it's useful for ESLint and TypeScript tooling.
slug: announcing-typescript-eslint-v6-beta
tags: [breaking changes, typescript-eslint, v5, v6]
title: Announcing typescript-eslint v6 Beta
---

[typescript-eslint](https://typescript-eslint.io) is the tooling that enables standard JavaScript tools such as [ESLint](https://eslint.org) and [Prettier](https://prettier.io) to support TypeScript code.
We've been working on a set of breaking changes and general features that we're excited to get in front of users soon.
And now, after over two years of development, we're excited to say that typescript-eslint v6 is ready for public beta testing! 🎉

Our plan for typescript-eslint v6 is to:

1. Have users try out betas starting in early March of 2023
2. Respond to user feedback for the next 1-3 months
3. Release a stable version summer of 2023

Nothing mentioned in this blog post is set in stone.
If you feel passionately about any of the choices we've made here -positively or negatively- then do let us know on [the typescript-eslint Discord](https://hi.joshuakgoldberg.com)!

<!-- Todo: figuring out what to use as the feedback CTA -->

## Trying Out v6

Please do try out the typescript-eslint v6 beta!

If you don't yet use typescript-eslint, you can go through our [configuration steps]()

First replace your package's previous versions of `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` with `@rc-v6` versions:

```shell
npm i @typescript-eslint/eslint-plugin@rc-v6 @typescript-eslint/parser@rc-v6 --save-dev
```

We highly recommend then basing your ESLint configuration on the reworked typescript-eslint recommended configurations mentioned [later in this post](#configuration-breaking-changes 'reworked typescript-eslint recommended configurations mentioned later in this post') — especially if it's been a while since you've reworked your linter config.

At this point, you should be seeing ESLint reports however you'd previously

## User-Facing Features

### Relative `tsconfig.json` Projects

In typescript-eslint v5, in order to enable [typed linting](https://typescript-eslint.io/linting/typed-linting), your ESLint configuration must include a `parserOptions.project` property indicating which TSConfig(s) to use:

```js title=".eslintrc.cjs"
module.exports = {
  // ...
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  // ...
};
```

This works well for repositories that have a single TSConfig for all files, such as small repositories using a single `tsconfig.json` or larger monorepos that have a `tsconfig.eslint.json` specifically used for linting.
But what if your project uses different TSConfig options for different TypeScript files in nested subdirectories?
Specifying the right array of relative TSConfig paths to try for each file in order can be cumbersome or downright impossible.

We recently added the option to specify `parserOptions.project` as just `true` in ESLint configurations.
This indicates to typescript-eslint that each file should be linted with the closest `tsconfig.json` file on disk.

```js title=".eslintrc.cjs"
module.exports = {
  // ...
  parserOptions: {
    project: true,
  },
  // ...
};
```

We hope using `project = true` simplifies configurations for repositories with nontrivial ESLint configuration setups.
We intend to add additional options around automatic TSConfig lookups to allow additional file names or other convenient behaviors.

:::note
`parserOptions.project = true` is available in the latest versions of typescript-eslint v5.
But v6's internal refactors are big enough that we'd like users to also try this out too.
:::

## Developer-Facing Features

:::note
If you don't work on ESLint plugins or with custom ESLint rules, you can skip this section and go straight to _[User-Facing Breaking Changes](#user-facing-breaking-changes)_.
:::

### Type Checker Wrapper APIs

As described in our [ASTs and typescript-eslint](/blog/asts-and-typescript-eslint) post, ESLint rules don't natively work with AST nodes compatible with TypeScript's API.
Retrieving type information for an ESLint AST node in a custom rule requires code somewhat like:

```ts title="custom-rule-with-v5.ts"
{
  // ...
  create() {
    const services = util.getParserServices(context);
    const checker = services.program.getTypeChecker();
    const tsNode = services.esTreeNodeToTSNodeMap.get(esNode);
    const type = checker.getTypeAtLocation(node);

    // ...
  }
  // ...
}
```

How cumbersome, just to call to a single method (`getTypeAtLocation`) on the TypeScript API!

In typescript-eslint v6, we've added a set of wrapper APIs on the `services: ParserServices` object that act as shortcuts for commonly used TypeScript APIs including `getTypeAtLocation`:

```ts title="custom-rule-with-v6.ts"
{
  // ...
  create() {
    const services = util.getParserServices(context);
    const type = services.getTypeAtLocation(node);

    // ...
  }
  // ...
}
```

For now, the available wrapper APIs are:

- `getSymbolAtLocation`: directly passes an ESTree node to TypeScript's `checker.getSymbolAtLocation`
- `getTypeAtLocation`: directly passes an ESTree node to TypeScript's `checker.getTypeAtLocation`

We hope these wrapper APIs make it more convenient to write lint rules that rely on the awesome power of TypeScript's type checking.
In the future, we may add more wrapper APIs, and may even add internal caching to those APIs to improve performance.

:::note
Rules can still retrieve their full backing TypeScript type checker with `services.program.getTypeChecker()`.
This can be necessary for TypeScript APIs not wrapped by the parser services.
:::

TODO: set up a v6 netlify deployment so we can link to the docs there!

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

Every new major version of typescript-eslint comes with changes to which rules are enabled in the preset configurations - and with which options.
Because this release also includes a reworking of the configurations themselves, the list of changes is too large to put in this blog post.
Instead see [Changes to configurations for 6.0.0](https://github.com/typescript-eslint/typescript-eslint/discussions/6014) for a full list of the changes.

Please do try out the new rule configurations presets and let us know in that discussion!

:::tip
todo: give tip on how to clear user config rules before trying out
:::

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

## Developer-Facing Features

## TODO: We'll thank everyone who contributed :)
