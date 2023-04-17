---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: Why enforcing TypeScript imports use the `type` modifier when possible benefits some project setups.
slug: consistent-type-imports-and-exports-why-and-how
tags: [typescript, imports, exports, types, transpiling]
title: 'Consistent Type Imports and Exports: Why and How'
---

`import` and `export` statements are core features of the JavaScript language.
They were added as part of the [ECMAScript Modules (ESM)](https://nodejs.org/api/esm.html#modules-ecmascript-modules) specification, and now are generally available in most mainstream JavaScript environments, including all evergreen browsers and Node.js.

When writing TypeScript code with ESM, it can sometimes be desirable to import or export a type only in the type system.
Code may wish to refer to a _type_, but not actually import or export a corresponding _value_.

For that purpose, TypeScript 3.8 [added type-only imports and exports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) to the TypeScript language:

```ts
import type { SomeThing } from './some-module.js';
export type { SomeThing };
```

The key difference with `export type` and `import type` is that they _do not represent runtime code_.
Attempting to use a _value_ imported as only a _type_ in runtime code will cause a TypeScript error:

```ts twoslash
import type { SomeThing } from './some-module.js';

new SomeThing();
//  ~~~~~~~~~
// 'SomeThing' cannot be used as a value
// because it was imported using 'import type'.
```

TypeScript 4.5 also added [inline type qualifiers](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names), which allow for indicating that only some specifiers in a statement should be type-system-only:

```ts
import { type SomeType, SomeValue } from './some-module.js';
```

Type-only imports and exports are not emitted as runtime code when code is transpiled to JavaScript.
This brings up two questions:

- Why would you want to use these type-only imports and exports?
- How can you enforce a project use them whenever necessary?

Let's Dig In!

<!--truncate-->

## Benefits of Enforcing Type-only Imports/Exports

### Avoiding Unintentional Side Effects

Some modules in code may cause _side effects_: code that is run when the module is imported and causes changes outside the module.
Common examples of side effects include sending network requests via `fetch` or creating DOM stylesheets.

When projects include modules that cause side effects, the order of module imports matters.
For example, some projects import the types of side-effect-causing modules in code that needs to run before those side effects.

### Isolated Module Transpilation

Import statements that only import types are generally removed when the TypeScript compiler transpiles TypeScript syntax to JavaScript syntax.
The built-in TypeScript compiler is able to do so because it includes a type checker that knows which imports are of types and/or values.

But, some projects use transpilers such as Babel, SWC, or Vite that don't have access to type information.
These transpilers are sometimes referred to as _isolated module transpilers_ because they effectively transpile each module in isolation from other modules.
Isolated module transpilers can't know whether an import is of a type, a value, or both.

Take this file with exactly three lines of code:

```ts
// Is SomeThing a class? A type? A variable?
// Just from this file, we don't know! 😫
import { SomeThing } from './may-include-side-effects.js';
```

If that `./may-include-side-effects.js` module includes side effects, keeping or removing the import can have very different runtime behaviors in the project.
Indicating in code which values are type-only can be necessary for transpilers that don't have access to TypeScript's type system to know whether to keep or remove the import.

```ts
// Now we know this file's SomeThing is only used as a type.
// We can remove this import in transpiled JavaScript syntax.
import type { SomeThing } from './may-include-side-effects.js';
```

## Enforcing With typescript-eslint

typescript-eslint provides two ESLint rules that can standardize using (or not using) type-only exports and imports:

- [`@typescript-eslint/consistent-type-exports`](/rules/consistent-type-exports): Enforce consistent usage of type exports.
- [`@typescript-eslint/consistent-type-imports`](/rules/consistent-type-imports): Enforce consistent usage of type imports.

You can enable them in your [ESLint configuration](https://eslint.org/docs/latest/user-guide/configuring):

```json
{
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": "error"
  }
}
```

With those rules enabled, running ESLint on the following code would produce a lint complaint:

```ts
import { GetString } from './types.js';
// All imports in the declaration are only used as types. Use `import type`.

export function getAndLogValue(getter: GetString) {
  console.log('Value:', getter());
}
```

The two rules can auto-fix code to use `type`s as necessary when ESLint is run on the command-line with `--fix` or configured in an editor extension such as the [VSCode ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

For example, the `import` statement from earlier would be auto-fixed to:

```ts
import type { GetString } from './types.js';

export function getAndLogValue(getter: GetString) {
  console.log('Value:', getter());
}
```

## More Lint Rules

### `import` Plugin Rules

[`eslint-plugin-import`](https://github.com/import-js/eslint-plugin-import) is a handy plugin with rules that validate proper imports.
Although some of those rules are made redundant by TypeScript, many are still relevant for TypeScript code.

Two of those rules in particular can be helpful for consistent `type` imports:

- [`import/consistent-type-specifier-style`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/consistent-type-specifier-style.md): enforces consistent use of top-level vs inline `type` qualifier
- [`import/no-duplicates`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-duplicates.md#inline-type-imports): warns against unnecessary duplicate imports (and with the `inline-type-imports` option can work in tandem with `import/consistent-type-specifier-style`).

In conjunction with [`@typescript-eslint/consistent-type-imports`](/rules/consistent-type-imports), [`eslint-plugin-import`](https://github.com/import-js/eslint-plugin-import)'s rules can enforce your imports are always properly qualified and are written in a standard, predictable style (eg always top-level type qualifier or always inline type-qualifier).

### Verbatim Module Syntax

TypeScript 5.0 additionally adds a new [`--verbatimModuleSyntax`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0-beta/#verbatimmodulesyntax) compiler option.
`verbatimModuleSyntax` simplifies TypeScript's logic around whether to preserve imports.
From the TypeScript release notes:

> ...any imports or exports without a type modifier are left around.
> Anything that uses the type modifier is dropped entirely.
>
> ```ts
> // Erased away entirely.
> import type { A } from 'a';
>
> // Rewritten to 'import { b } from 'bcd';'
> import { b, type c, type d } from 'bcd';
>
> // Rewritten to 'import {} from 'xyz';'
> import { type xyz } from 'xyz';
> ```
>
> With this new option, what you see is what you get.

`verbatimModuleSyntax` is useful for simplifying transpilation logic around imports - though it does mean that transpiled code such as the may end up with unnecessary import statements.
The `import { type xyz } from 'xyz';` line from the previous code snippet is an example of this.
For the rare case of needing to import for side effects, leaving in those statements may be desirable - but for most cases you will not want to leave behind an unnecessary side effect import.

typescript-eslint now provides a [`@typescript-eslint/no-import-type-side-effects`](/rules/no-import-type-side-effects) rule to flag those cases.
If it detects an import that only imports specifiers with inline `type` qualifiers, it will suggest rewriting the import to use a top-level `type` qualifier:

```diff
- import { type A } from 'xyz';
+ import type { A } from 'xyz';
```

## Further Reading

You can read more about the rules' configuration options in their docs pages.
See [our Getting Started docs](/getting-started) for more information on linting your TypeScript code with typescript-eslint.

## Supporting typescript-eslint

If you enjoyed this blog post and/or or use typescript-eslint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖
