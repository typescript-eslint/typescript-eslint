---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: Why enforcing TypeScript imports use the `type` modifier when possible benefits some project setups.
slug: consistent-type-exports-and-imports-why-and-how
tags: [typescript, imports, exports, types, transpiling]
title: 'Consistent Type Exports and Imports: Why and How'
---

TypeScript 3.8 [added type-only imports and exports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html):

```ts
import type { SomeThing } from './some-module.js';
export type { SomeThing };
```

The key difference with `export type` and `import type` is that they are _only in the type system_.
Attempting to use a _value_ imported as only a _type_ in runtime code will cause a TypeScript error:

```ts twoslash
import type { SomeThing } from './some-module.js';

new SomeThing();
//  ~~~~~~~~~
// 'SomeThing' cannot be used as a value
// because it was imported using 'import type'.
```

This brings up two questions:

- Why would you want to use these type-only imports and exports?
- How can you enforce a project use them whenever necessary?

Let's Dig In!

<!--truncate-->

## Functional Benefits

### Module Side Effects

Some modules in code may cause _side effects_: code that is run when the module is imported and causes changes outside the module.
Common examples of side effects include calling to global APIs like `fetch` or creating DOM stylesheets.

When projects include modules that cause side effects, the order of module imports matters.
For example, some projects import the types of side-effect-causing modules in code that needs to run before those side effects.

### Isolated Module Transpilation

Import statements that only import types are generally removed when the built-in TypeScript compiler transpiles TypeScript syntax to JavaScript syntax.
The built-in TypeScript compiler is able to do so because it includes a type checker that knows which imports are of types and/or values.

But, some projects use transpilers such as Babel, SWC or Vite that don't have access to type information.
Those untyped transpilers can't know whether an import is of a type, a value, or both:

```ts
// Is SomeThing a class? A type? A variable?
// Just from this file, we don't know! 😫
export { SomeThing } from './may-include-side-effects.js';
```

If that `./may-include-side-effects.js` module includes side effects, keeping or removing the import can have very different runtime behaviors in the project.
Indicating in code which values are type-only can be necessary for transpilers that don't have access to TypeScript's type system to know whether to keep or remove the import.

```ts
// Now we know this file's SomeThing is only used as a type.
// We can remove this export in transpiled JavaScript syntax.
export type { SomeThing } from './may-include-side-effects.js';
```

## Enforcing With typescript-eslint

typescript-eslint provides two ESLint rules that can standardize using (or not using) type-only exports and imports:

- [`@typescript-eslint/consistent-type-exports`](https://typescript-eslint.io/rules/consistent-type-exports): Enforce consistent usage of type exports.
- [`@typescript-eslint/consistent-type-imports`](https://typescript-eslint.io/rules/consistent-type-imports): Enforce consistent usage of type imports.

You can enable them in your [ESLint configuration](https://eslint.org/docs/latest/user-guide/configuring):

```json
{
  "rules": {
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": "warn"
  }
}
```

The two rules can auto-fix code to use `type`s as necessary when ESLint is run on the command-line with `--fix` or configured in an editor extension such as the [VSCode ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

You can read more about the rules' configuration options in their docs pages.
See [our Getting Started docs](https://typescript-eslint.io/getting-started) for more information on linting your TypeScript code with typescript-eslint.

## Supporting typescript-eslint

If you enjoyed this blog post and/or or use typescript-eslint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖
