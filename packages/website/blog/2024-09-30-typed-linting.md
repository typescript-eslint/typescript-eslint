---
authors: joshuakgoldberg
description: Explaining what linting with type information means, why it's so powerful, and some of the useful rules you can enable that use it.
slug: typed-linting
tags: [types, type information, typed linting]
title: 'Typed Linting: The Most Powerful TypeScript Linting Ever'
---

[Linting with type information](https://typescript-eslint.io/getting-started/typed-linting), also called "typed linting" or "type-aware linting", is the act of writing lint rules that use type information to understand your code.
Typed linting rules as provided by typescript-eslint are the most powerful JavaScript/TypeScript linting in common use today.

In this blog post, we'll give a high-level overview of how linting with type information works, why it's so much more powerful than traditional linting, and some of the useful rules you can enable that use it.

<!--truncate-->

## Recap: Type Information?

Traditional JavaScript lint rules operate on one file at a time.
They look at a description of code in each file and report complaints if that file seems to contain bad practices.
That description is called an Abstract Syntax Tree, or AST.

:::tip
For a primer on ASTs and linting, see _[ASTs and typescript-eslint](./2022-12-05-asts-and-typescript-eslint.md)_.
:::

Each file's AST contains only information for that file, not any other files.
Lint rules that rely only on the file's AST don't have a way to understand code imported from other files, such as in ESM `import` statements.
Not being able to understand code from other files severely limits lint rules.

As an example, suppose you enable a lint rule like [`@typescript-eslint/no-deprecated`](/rules/no-deprecated) to prevent calling to code with a `@deprecated` JSDoc.
Using just the following file's AST, the lint rule would have no way of knowing whether `work` is deprecated:

```ts title="index.ts"
import { work } from './worker';

// Is this safe? Does calling work violate any rules? We don't know!
work();
```

_Type information_ refers to the information a type checker such as TypeScript generates to understand your code.
Type checkers read code, determine what types each value may be, and store that "type information".
TypeScript and tools that call to TypeScript's APIs can then use that type information to understand the project's code.

In the earlier example, type information would be able to inform a lint rule running in `index.ts` that the `work` import resolves to a function in another file:

```ts title="worker.ts"
/** @deprecated - Don't do this! */
export function work() {
  // ...
}
```

...which would allow the lint rule to report a complaint that the `work()` call is to a function marked as `@deprecated`.

typescript-eslint allows lint rules to retrieve type information using TypeScript's APIs.
In doing so, they can even make decisions on linted files using information outside each individual file.

## Common Uses for Typed Linting

Cross-file type information is a powerful addition to lint rules.
Knowing the types of pieces of your code allows lint rules to flag for risky behavior specific to certain types.
The following sections show several of the most common uses for lint rules that rely on type information.

### Unsafe `any`s

The `@typescript-eslint/no-unsafe-*` family of rules checks for risky uses of `any` typed values.
This is useful because the `any` type can easily slip into code and reduce type safety, despite being allowed by the TypeScript type checker.

For example, the following code that logs a member of an object parsed from a string produces no type errors in type checking.
`JSON.parse()` returns `any`, and arbitrary property accesses are allowed on values of type `any`.

However, [`@typescript-eslint/no-unsafe-member-access`](/rules/no-unsafe-member-access) would report `[key]` might not be a property on the object:

```ts
function getDataKey(rawData: string, key: string): string {
  return JSON.parse(rawData)[key];
  //                        ~~~~~
  // Unsafe member access [key] on an `any` value.
  // eslint(@typescript-eslint/no-unsafe-member-access)
}
```

The lint rule is right to report.
Calls to the `getDataKey` function can return a value that's not a `string`, despite the function's explicit return type annotation.
That can lead to unexpected behavior at runtime:

```ts
console.log(getDataKey(`{ "blue": "cheese" }`, 'bleu').toUpperCase());
// Uncaught TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

Without type information to indicate the types of `JSON.parse` and `key`, there would have been no way to determine that the `[key]` member access was unsafe.

### Method Call Scoping

<!-- - Catching [dangerous calls to unbound methods that fail to provide a `this`](/rules/no-unbound-method) -->

Runtime crashes caused by misuses of typed code are possible even with no `any`s.

For example, class method functions don't preserve their class scope when passed as standalone variables ("unbound").
TypeScript still allows them to be called without the proper `this` scope.

The global `localStorage` object in browsers has several properties that must be called with a `this` bound to `localStorage`.
The [`@typescript-eslint/unbound-method`](/rules/unbound-method) lint rule can report on unsafe references to those properties, such as accessing `getItem`:

```ts
const { getItem } = localStorage;
//      ~~~~~~~
// Avoid referencing unbound methods which may cause unintentional scoping of `this`.
// eslint(@typescript-eslint/unbound-method)
```

That's useful because calls to `getItem` that aren't bound to `localStorage` cause an exception at runtime:

```ts
getItem('...');
// Uncaught TypeError: Illegal invocation
```

Without type information to indicate the types of `localStorage` and its `getItem` property, there would have been no reliable way to determine that the `const { getItem }` access was unsafe.

### Async Race Conditions

Even if your code is 100% typed, has no `any`s, and doesn't misuse scopes, it's still possible to have bugs that can only easily be detected by typed linting.
Asynchronous code with `Promise`s in particular can introduce subtle issues that are completely type-safe.

Suppose your code is meant to run an asynchronous `readFromCache` function before reading from the file system:

```ts
import { fs } from 'node:fs/promises';
import { readFromCache } from './caching';

const filePath = './data.json';

readFromCache(filePath);

await fs.rm(filePath);
```

Do you see the potential bug?

If `readFromCache` is asynchronous (returns a `Promise`), then calling it and not awaiting its returned Promise could lead to race conditions in code.
Its asynchronous or delayed logic might not get to reading from the `filePath` before `fs.rm(filePath)` runs.

This is commonly referred to as a _"floating"_ Promise: one that is created but not appropriately handled.
The [`@typescript-eslint/no-floating-promises`](/rules/no-floating-promises) lint rule would report on that floating Promise:

```ts
readFromCache(filePath);
// Promises must be awaited, end with a call to .catch, end with a call to .then
// with a rejection handler or be explicitly marked as ignored with the `void` operator.
// eslint(@typescript-eslint/no-floating-promises
```

...and can give an editor suggestion to add a missing `await`:

```diff
- readFromCache(filePath);
+ await readFromCache(filePath);
```

Determining whether code is creating a floating Promise is only possible when the types of code are known.
Otherwise, lint rules would have no way of knowing which imports from other files could potentially create a Promise that needs to be handled.

### Custom Rules

Typed linting isn't restricted to just typescript-eslint rules.
It can be used in community ESLint plugins, as well as custom rules specific to your project.

One common example used by teams is to codemod from a deprecated API to its replacement.
Typed linting is often necessary to determine which pieces of code call to the old API.

As an example, consider the following `fetch()` POST call that sends data to an intake API.
Suppose the intake endpoint is migrating from sending `[string, string]` tuples to sending key-value pairs.
A typed lint rule could determine that the data is in the old format:

```ts
import { endpoints } from "~/api";

const rawData = ["key", "value"] as const;

await fetch(endpoints.intake, {
  data: JSON.stringify(rawData)
  //                   ~~~~~~~
  // Don't pass a tuple to endpoints.intake. Pass a key-value object instead.
  // eslint(@my-team/custom-rule)
  // ...
  method: "POST",
});
```

...and provide a code fix to automatically migrate to the new format:

```diff
import { endpoints } from "~/api";

const rawData = ["key", "value"] as const;

await fetch(endpoints.intake, {
- data: JSON.stringify(rawData)
+ data: JSON.stringify(Object.fromEntries(rawData))
  // ...
  method: "POST",
});
```

Knowing that the `fetch()` call was being sent to `endpoints.intake` and that the type of the data was a tuple takes typed linting.

That kind of migration codemod is one of the ways typed linting can be utilized for project- or team-specific rules.
See [Developers > Custom Rules](/developers/custom-rules) for more documentation on building your own ESLint rules with typescript-eslint.

## Enabling Typed Linting

You can add typed linting to your ESLint configuration by following the steps in [Linting with Type Information](/getting-started/typed-linting).
We recommend doing so by enabling [`parserOptions.projectService`](/packages/parser#projectservice):

```js title="eslint.config.js"
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
```

typescript-eslint will then use TypeScript APIs behind-the-scenes, to, for each file being linted:

1. Determine the appropriate TSConfig dictating how to generate that file's type information
2. Make APIs available to lint rules to retrieve type information for the file

Lint rules that opt into type information will then be able to use those APIs when linting your code.

## Drawbacks of Typed Linting

Linting with type information comes with two drawbacks: configuration complexity and a performance penalty.

For configuring typed linting, [`parserOptions.projectService`](/packages/parser#projectservice) solves configuration difficulties for most projects.
The more manual [`parserOptions.project`](/packages/parser#projectservice) is also available for more complex project setups.
See [Troubleshooting & FAQs > Typed Linting](/troubleshooting/typed-linting) for details on common issues.

For performance, it is inevitable that typed linting will slow your linting down to roughly the speed of type checking your project.
Typed lint rules call to the same TypeScript APIs as the command-line `tsc`.
If linting your project is much slower than running `tsc` on the same set of files, see [Troubleshooting & FAQs > Typed Linting > Performance](/troubleshooting/typed-linting/performance).

## Final Thoughts

In our experience, the additional bug catching and features added by typed linting are well worth the costs of configuration and performance.
Typed linting allows lint rules to act with much greater confidence on a wider area of checking, including avoiding unsafe `any` uses, enforcing proper `this` scopes, and catching asynchronous code mishaps.

If you haven't yet tried out typed linting using the typescript-eslint rules mentioned in this blog post, we'd strongly recommend going through our [Linting with Type Information](/getting-started/typed-linting) guide.
