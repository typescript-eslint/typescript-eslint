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
If you feel passionately about any of the choices we've made here -positively or negatively- then do let us know on [the typescript-eslint Discord's `v6` channel](https://discord.com/channels/1026804805894672454/1084245444676292688)!

## Trying Out v6

Please do try out the typescript-eslint v6 beta!
Its documentation site is hosted on a preview deploy link: **[v6--typescript-eslint.netlify.app](https://v6--typescript-eslint.netlify.app)**.

### As A New User

If you don't yet use typescript-eslint, you can go through our [configuration steps on the v6 _Getting Started_ docs](https://v6--typescript-eslint.netlify.app/getting-started).
It'll walk you through setting up typescript-eslint in a project.

### As An Existing User

If you already use typescript-eslint, you'll need to first replace your package's previous versions of `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` with `@rc-v6` versions:

```shell
npm i @typescript-eslint/eslint-plugin@rc-v6 @typescript-eslint/parser@rc-v6 --save-dev
```

We highly recommend then basing your ESLint configuration on the reworked typescript-eslint [recommended configurations mentioned later in this post](#configuration-breaking-changes) — especially if it's been a while since you've reworked your linter config.

## User-Facing Breaking Changes

These are the changes that users of typescript-eslint -generally, any developer running ESLint on TypeScript code- should pay attention to when upgrading typescript-eslint from v5 to v6.

> ⏳ indicates a change that has been scheduled for v6 but not yet released.
> We'll update this blog post as the corresponding pull requests land.

### Reworked Configuration Names

The biggest configuration change in typescript-eslint v6 is that we've reworked the names of our [provided user configuration files](https://typescript-eslint.io/linting/configs).
typescript-eslint v5 provided three recommended configurations:

- [`plugin:@typescript-eslint/recommended`](https://typescript-eslint.io/linting/configs#recommended): Recommended rules for code correctness that you can drop in without additional configuration.
- [`plugin:@typescript-eslint/recommended-requiring-type-checking`](https://typescript-eslint.io/linting/configs#recommended-requiring-type-checking): Additional recommended rules that require type information.
- [`plugin:@typescript-eslint/strict`](https://typescript-eslint.io/linting/configs#strict): Additional strict rules that can also catch bugs but are more opinionated than recommended rules.

Those configurations worked well for most projects.
However, some users correctly noted two flaws in that approach:

- Strict rules that didn't require type checking were lumped in with those that did.
- _Stylistic_ best practices were lumped in with rules that actually find bugs.

As a result, we've reworked the configurations provided by typescript-eslint into these two groups:

- Functional rule configurations, for best best practices and code correctness:
  - **`plugin:@typescript-eslint/recommended`**: Recommended rules that you can drop in without additional configuration.
  - **`plugin:@typescript-eslint/recommended-type-checked`**: Additional recommended rules that require type information.
  - **`plugin:@typescript-eslint/strict`**: Additional strict rules that can also catch bugs but are more opinionated than recommended rules _(without type information)_.
  - **`plugin:@typescript-eslint/strict-type-checked`**: Additional strict rules that do require type information.
- Stylistic rule configurations, for consistent and predictable syntax usage:
  - **`plugin:@typescript-eslint/stylistic`**: Stylistic rules you can drop in without additional configuration.
  - **`plugin:@typescript-eslint/stylistic-type-checked`**: Additional stylistic rules that require type information.

> `plugin:@typescript-eslint/recommended-requiring-type-checking` is now an alias for `plugin:@typescript-eslint/recommended-type-checked`.
> The alias will be removed in a future major version.

As of v6, we recommend that projects enable two configs from the above:

- If you are _not_ using typed linting, enable `stylistic` and either `recommended` or `strict`, depending on how intensely you'd like your lint rules to scrutinize your code.
- If you _are_ using typed linting, enable `stylistic-type-checked` and either `recommended-type-checked` or `strict-type-checked`, depending on how intensely you'd like your lint rules to scrutinize your code.

For example, a typical project that enables typed linting might have an ESLint configuration file like:

```js title=".eslintrc.cjs"
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  root: true,
};
```

See [_Configurations_ on the v6 docs site preview](https://v6--typescript-eslint.netlify.app/linting/configs) for the updated documentation on configurations provided by typescript-eslint.

For more information on these changes, see:

- [Configs: Have recommended/strict configs include lesser configs, and simplify type checked names](https://github.com/typescript-eslint/typescript-eslint/discussions/6019) for the discussion leading up to these configuration changes.
- [feat(eslint-plugin): rework configs: recommended, strict, stylistic; -type-checked](https://github.com/typescript-eslint/typescript-eslint/pull/5251) for the pull request implementing the changes.

### Updated Configuration Rules

Every new major version of typescript-eslint comes with changes to which rules are enabled in the preset configurations - and with which options.
Because this release also includes a reworking of the configurations themselves, the list of changes is too large to put in this blog post.
Instead see the table in [Changes to configurations for 6.0.0](https://github.com/typescript-eslint/typescript-eslint/discussions/6014) for a full list of the changes.

Please do try out the new rule configurations presets and let us know in that discussion!

:::tip
If your ESLint configuration contains many `rules` configurations, we suggest the following strategy to start anew:

1. Remove all your rules configurations
2. Extend from the preset configs that make sense for you
3. Run ESLint on your project
4. In your ESLint configuration, turn off any rules creating errors that don't make sense for your project - with comments explaining why
5. In your ESLint configuration and/or with inline `eslint-disable` comments, turn off any rules creating too many errors for you to fix - with _"TODO"_ comments linking to tracking issues/tickets to re-enable them

:::

Miscellaneous changes to all shared configurations include:

- [fix(eslint-plugin): remove valid-typeof disable in eslint-recommended](https://github.com/typescript-eslint/typescript-eslint/pull/5381): Removes the disabling of ESLint's `valid-typeof` rule from our preset configs.

### Rule Breaking Changes

Several rules were changed in significant enough ways to be considered breaking changes:

- Previously deprecated rules are deleted ([chore(eslint-plugin): remove deprecated rules for v6](https://github.com/typescript-eslint/typescript-eslint/pull/6112)):
  - `@typescript-eslint/no-duplicate-imports`
  - `@typescript-eslint/no-implicit-any-catch`
  - `@typescript-eslint/no-parameter-properties`
  - `@typescript-eslint/sort-type-union-intersection-members`
- [feat(eslint-plugin): [prefer-nullish-coalescing]: add support for assignment expressions](https://github.com/typescript-eslint/typescript-eslint/pull/5234): Enhances the [`@typescript-eslint/prefer-nullish-coalescing`](https://typescript-eslint.io/prefer-nullish-coalescing) rule to also check `||=` expressions.
- [fix(eslint-plugin): [prefer-function-type] check for merges with type checking](https://github.com/typescript-eslint/typescript-eslint/pull/6104): Fixes edge case bugs in the [`@typescript-eslint/prefer-function-type`](https://typescript-eslint.io/prefer-function-type) rule around function type merges, at the cost of making it require type information.
- ⏳ [feat(eslint-plugin): [prefer-optional-chain] use type checking for strict falsiness](https://github.com/typescript-eslint/typescript-eslint/pull/6240): Fixes edge case bugs in the [`@typescript-eslint/prefer-optional-chain`](https://typescript-eslint.io/prefer-optional-chain) rule around false positives, at the cost of making it require type information.

### Tooling Breaking Changes

- [feat(typescript-estree): deprecate createDefaultProgram](https://github.com/typescript-eslint/typescript-eslint/pull/5890): Renames `createDefaultProgram` to `deprecated__createDefaultProgram`, with associated `@deprecated` TSDoc tags and warnings.
- [feat: drop support for node v12](https://github.com/typescript-eslint/typescript-eslint/pull/5918)
- [feat: bump minimum supported TS version to 4.2.4](https://github.com/typescript-eslint/typescript-eslint/pull/5915): this matches [DefinitelyTyped's 2-year support window](https://github.com/DefinitelyTyped/DefinitelyTyped#support-window).
- [chore: drop support for ESLint v6](https://github.com/typescript-eslint/typescript-eslint/pull/5972)

## Developer-Facing Changes

typescript-eslint v6 comes with a suite of cleanups and improvements for developers as well.
If you author any ESLint plugins or other tools that interact with TypeScript syntax, then we recommend you try out typescript-eslint v6 soon.
It includes some breaking changes that you may need to accommodate for.

:::tip
If you're having trouble working with the changes, please let us know on [the typescript-eslint Discord's `v6` channel](https://discord.com/channels/1026804805894672454/1084245444676292688)!
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

- `getSymbolAtLocation`: passes an ESTree's equivalent TypeScript node to `checker.getSymbolAtLocation`
- `getTypeAtLocation`: passes an ESTree node's equivalent TypeScript node to `checker.getTypeAtLocation`

We hope these wrapper APIs make it more convenient to write lint rules that rely on the awesome power of TypeScript's type checking.
In the future, we may add more wrapper APIs, and may even add internal caching to those APIs to improve performance.

:::note
Rules can still retrieve their full backing TypeScript type checker with `services.program.getTypeChecker()`.
This can be necessary for TypeScript APIs not wrapped by the parser services.
:::

See [_Custom Rules_ on the v6 docs site preview](https://v6--typescript-eslint.netlify.app/custom-rules) for the updated documentation on creating custom rules with typescript-eslint.

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

### ⏳ Errors on Invalid AST Parsing

:::note
These changes only impact API consumers of typescript-eslint that work at parsing level.
If the extent of your API usage is writing custom rules, these changes don't impact you.
:::

The `@typescript-eslint/typescript-estree` parser is by default very forgiving of invalid ASTs.
If it encounters invalid syntax, it will still attempt create an AST if possible: even if required properties of nodes don't exist.

For example, this snippet of TypeScript code creates a `ClassDeclaration` whose `id` is `null`:

```ts
export class {}
```

Invalid parsed ASTs can cause problems for downstream tools expecting AST nodes to adhere to the ESTree spec.
ESLint rules in particular tend to crash when given invalid ASTs.

`@typescript-eslint/typescript-estree` will now throw an error when it encounters a known invalid AST such as the `export class {}` example.
This is generally the correct behavior for most parsing contexts so downstream tools don't have to work with a potentially invalid AST.

For consumers that don't want the updated behavior of throwing on invalid ASTs, a new `allowInvalidAST` option exists to disable the throwing behavior.
Keep in mind that with it enabled, ASTs produced by typescript-eslint might not match their TSESTree type definitions.

For more information, see:

- The backing issue: [Parsing: strictly enforce the produced AST matches the spec and enforce most "error recovery" parsing errors](https://github.com/typescript-eslint/typescript-eslint/issues/1852)
- The implementing pull request: [feat(typescript-estree): added allowInvalidAST option to throw on invalid tokens](https://github.com/typescript-eslint/typescript-eslint/pull/6247)

### Other Developer-Facing Breaking Changes

- [feat: remove semantically invalid properties from TSEnumDeclaration, TSInterfaceDeclaration and TSModuleDeclaration](https://github.com/typescript-eslint/typescript-eslint/pull/4863): Removes some properties from those AST node types that should generally not have existed to begin with.
- [fix(utils): removed TRuleListener generic from the createRule](https://github.com/typescript-eslint/typescript-eslint/pull/5036): Makes `createRule`-created rules more portable in the type system.
- [feat(utils): remove (ts-)eslint-scope types](https://github.com/typescript-eslint/typescript-eslint/pull/5256): Removes no-longer-useful `TSESLintScope` types from the `@typescript-eslint/utils` package.
- [fix: rename typeParameters to typeArguments where needed](https://github.com/typescript-eslint/typescript-eslint/pull/5384): corrects the names of AST properties that were called _parameters_ instead of _arguments_.
  - To recap the terminology:
    - An _argument_ is something you provide to a recipient, such as a type provided explicitly to a call expression.
    - A _parameter_ is how the recipient receives what you provide, such as a function declaration's generic type parameter.
  - ⏳ [Enhancement: Add test-only console warnings to deprecated AST properties](https://github.com/typescript-eslint/typescript-eslint/issues/6469): The properties will include a `console.log` that triggers only in test environments, to encourage developers to move off of them.
- [feat(scope-manager): ignore ECMA version](https://github.com/typescript-eslint/typescript-eslint/pull/5889): `@typescript-eslint/scope-manager` no longer includes properties referring to `ecmaVersion`, `isES6`, or other ECMA versioning options. It instead now always assumes ESNext.
- [feat: remove partial type-information program](https://github.com/typescript-eslint/typescript-eslint/pull/6066): When user configurations don't provide a `parserOptions.project`, parser services will no longer include a `program` with incomplete type information. `program` will be `null` instead.
- [feat(experimental-utils): console.warn on import of experimental-utils](https://github.com/typescript-eslint/typescript-eslint/pull/6179): The `@typescript-eslint/experimental-utils` package has since been renamed to `@typescript-eslint/utils`. The old package name now includes a `console.warn` message to indicate you should switch to the new package name.
  - As a result, the `errorOnTypeScriptSyntacticAndSemanticIssues` option will no longer be allowed if `parserOptions.project` is not provided.
- ⏳ [feat(typescript-estree): remove optionality from AST boolean properties](https://github.com/typescript-eslint/typescript-eslint/pull/6274): Switches most AST properties marked as `?: boolean` to `: boolean`, as well as some properties marked as `?:` optional to `| undefined`. This results in more predictable AST node object shapes.
- [chore(typescript-estree): remove visitor-keys backwards compat export](https://github.com/typescript-eslint/typescript-eslint/pull/6242): `visitorKeys` can now only be imported from `@typescript-eslint/visitor-keys`. Previously it was also re-exported by `@typescript-eslint/utils`.
- [feat: add package.json exports for public packages](https://github.com/typescript-eslint/typescript-eslint/pull/6458): `@typescript-eslint/*` packages now use `exports` to prevent importing internal file paths.

## Appreciation

We'd like to extend a sincere _thank you_ to everybody who pitched in to make typescript-eslint v6 possible.

- Ourselves on the maintenance team:
  - [Armano](https://github.com/armano2)
  - [Brad Zacher](https://github.com/bradzacher)
  - [James Henry](https://github.com/JamesHenry)
  - [Josh Goldberg](https://github.com/JoshuaKGoldberg)
  - [Joshua Chen](https://github.com/Josh-Cena)
- Community contributors whose PRs were merged into the 6.0.0 release:
  <!-- cspell:disable -->
  - [Bryan Mishkin](https://github.com/bmish)
  - [fisker Cheung](https://github.com/fisker)
  - [Juan García](https://github.com/juank1809)
  - [Kevin Ball](https://github.com/kball)
  - [Marek Dědič](https://github.com/marekdedic)
  - [Mateusz Burzyński](https://github.com/Andarist)
  <!-- cspell:enable -->

See the [v6.0.0 milestone](https://github.com/typescript-eslint/typescript-eslint/milestone/8) for the list of issues and associated merged pull requests.

## Supporting typescript-eslint

If you enjoyed this blog post and/or or use typescript-eslint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖
