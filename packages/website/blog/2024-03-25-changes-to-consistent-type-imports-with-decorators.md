---
authors:
  - image_url: /img/team/bradzacher.jpg
    name: Brad Zacher
    title: typescript-eslint Maintainer
    url: https://github.com/bradzacher
description: Changes to consistent-type-imports when used with decorators, experimentalDecorators, and emitDecoratorMetadata
slug: changes-to-consistent-type-imports-with-decorators
tags:
  [
    consistent-type-imports,
    experimentalDecorators,
    emitDecoratorMetadata,
    typescript-eslint,
  ]
title: Changes to `consistent-type-imports` with Legacy Decorators and Decorator Metadata
---

We've made some changes to the [`consistent-type-imports` rule](/rules/consistent-type-imports) to fix some long-standing issues when used alongside `experimentalDecorators: true` and `emitDecoratorMetadata: true`. These changes increase safety and prevent invalid fixes when using decorator metadata.

<!-- truncate -->

## Experimental Decorator Metadata

TypeScript's [`experimentalDecorators` compiler option](https://aka.ms/tsconfig#experimentalDecorators) (referred to as "legacy decorators" from here on) turns on support for an old version of the [JavaScript TC39 decorator proposal](https://github.com/tc39/proposal-decorators) that was never standardized. TypeScript's legacy decorators are similar to the current proposal, but differ in that they use [metadata reflection](https://rbuckton.github.io/reflect-metadata/) when TypeScript's [`emitDecoratorMetadata` compiler option](https://aka.ms/tsconfig#emitDecoratorMetadata) is turned on.

When using legacy decorators with decorator metadata and a class is annotated with decorators, TypeScript will emit runtime metadata for the class (see the example below). That decorator metadata will capture property types, method parameter types, and method return types. Decorator metadata provides a bridge between the types (which are not available at compile time) and the runtime code.

The downside of generating this runtime code that it is derived using type information: meaning that the runtime code emitted changes based on the cross-file type information that TypeScript has computed. Doing so violates a key [TypeScript design goal](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals) of not changing runtime behavior based on type information.

To illustrate what this means consider the following snippet:

```ts
import Foo from 'foo';
import decorator from 'decorator';

class Clazz {
  @decorator
  method(arg: Foo) {}
}
```

TypeScript will transpile this code to the following:

<!-- prettier-ignore -->
```ts
var _a;
import { __decorate, __metadata } from "tslib";
import Foo from 'foo';
import decorator from 'decorator';
class Clazz {
    method(arg) { }
}
__decorate([
    decorator,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", /* See below for what this value will be */),
    __metadata("design:returntype", void 0)
], Clazz.prototype, "method", null);
```

If the imported name `Foo` resolves to...

- a type then TS will emit `[Function]`, `[Object]`, `[String]`, `[Number]`, or `[Boolean]` depending on what that type resolves to.
- an enum then TS will emit one of `[String]`, `[Number]`, or `[Object]` depending on the type of the enum's members
  - `[Object]` is used for an enum that has both string and number values.
- a class declaration:
  - and the import **_is NOT_** annotated as `import type` then TS will emit `[Foo]`.
  - and the import **_IS_** annotated as `import type` then TS will emit `[Function]`.

In addition to requiring runtime type information, those metadata emit rules are confusing for developers to reason about.
They necessitate understanding edge cases specific to TypeScript's handling of decorators and type information.

## `consistent-type-imports` caused runtime breakage

The important piece is that last dot point above - the handling of imported names that resolve to class declarations. If the import is not annotated as `import type` then TS emits a runtime reference to the imported name. This runtime reference is implicit and requires type information to derive - you cannot derive its existence purely based on single-file AST analysis.

The [`consistent-type-imports` rule](/rules/consistent-type-imports) was introduced to allow users to enforce that any imported names are annotated as `import type` if they are not used in a value location. How the rule makes this decision is based solely on the single file it's looking at. But another way the rule does not use any type information from TS and instead it scans the code using a technique called "scope analysis" so that it can find all references to the imported names and determine if each reference is a value reference.

:::tip
See [ASTs and typescript-eslint](../asts-and-typescript-eslint) to understand how rules look at the syntax of files.
:::

The issue arises with legacy decorators and decorator metadata - syntactically the only reference to `Foo` is a type reference. However the emitted code contains a hidden reference to `Foo`. When the rule relies upon the code it sees then it will report an error and attempt to mark `Foo` as `import type`. If the user applies this fix then that will cause their runtime code to change (`arg`'s metadata goes from `Foo` to `Function`) which can have downstream runtime impacts and cause broken code!

## Past (Broken) Solution

In the past we tried to solve this problem by enforcing that imported names that are used in decorator metadata are specifically _not_ marked as type-only imports to ensure that values are always correctly emitted in the runtime code.

However this solution had a hidden pitfall; if the user also used `isolatedModules: true` then TS will enforce that all imported types are explicitly marked as `import type` for compatibility with single-file build tools. This lead to an unresolvable situation where `consistent-type-imports` would enforce that an imported name _must not be_ marked with `import type` so that we could ensure we don't break decorator metadata, and simultaneously TS would enforce that that same imported name _must be_ marked with `import type`.

There have been a few attempts to fix this issue but the resolution we came to was that the only solution was to add type information to the rule so that it could correctly understand all of the above type-aware constraints. Adding type information to an existing rule is something we try to avoid because it is a major breaking change that restricts the rule to just users that leverage [type-aware linting](/getting-started/typed-linting).

Adding type-information to the rule to handle this edge case would not be a positive change for users or the ecosystem:

1. Many users are unable to configure typed linting and/or unwilling to take its performance hit. Requiring type-aware linting for this rule to serve a very small subset of impacted users would reduce the linting ability of many more un-impacted users.
1. It requires a specific combinations of compiler options to trigger it means that not everyone is impacted by the problem - so we'd be preventing a lot of un-impacted users from using the rule.
1. With the release of [TypeScript v5.0 and its stable decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators) `experimentalDecorators` are now the legacy syntax. Whilst [TypeScript v5.2 added support for the latest stable decorator metadata proposal](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#decorator-metadata) this proposal does not include type metadata - so it doesn't suffer the same drawbacks as its legacy counterpart.

## Today's Solution - the Compromise

Ultimately we determined the best solution was to just opt-out of handling this use-case entirely. This means that we can avoid accidentally reporting the wrong thing and fixing to code that either fails to compile or alters the emitted runtime metadata.

Now, if you have **both** `experimentalDecorators: true` and `emitDecoratorMetadata: true`, then the `consistent-type-imports` rule will **_not_** report any errors within any files _that contain decorators_.

All files without decorators will continue to report as expected. Similarly all projects that use `experimentalDecorators: false` and/or `emitDecoratorMetadata: false` will continue to report as expected.

### Configuring the linter to expect `experimentalDecorators: true` and `emitDecoratorMetadata: true`

If you are using [type-aware linting](/linting/typed-linting) then we will automatically infer your setup from your tsconfig and you should not need to configure anything manually.

Otherwise you can explicitly tell our tooling to analyze your code as if the compiler option was turned on by setting both [`parserOptions.emitDecoratorMetadata = true`](/packages/parser/#emitdecoratormetadata) and [`parserOptions.experimentalDecorators = true`](/packages/parser/#experimentaldecorators). For example:

```js title="eslint.config.js"
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  // Added lines start
  {
    languageOptions: {
      parserOptions: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    },
  },
);
```

## Alternatives for Impacted Users

If you are working in a workspace that is impacted by this change and want to correctly have your imports consistently marked with `type`, we suggest using the [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax) compiler option which will use type information to correctly enforce that types are marked with `type` and values are not when they are used in decorator metadata.
