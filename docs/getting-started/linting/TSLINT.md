---
id: tslint
title: What about TSLint?
sidebar_label: What about TSLint?
---

TSLint is a fantastic tool. It is a linter that was written specifically to work based on the TypeScript AST format
mentioned above. This has advantages and disadvantages, as with most decisions we are faced with in software engineering!

One advantage is there is no tooling required to reconcile differences between AST formats, but the major disadvantage
is that the tool is therefore unable to reuse any of the previous work which has been done in the JavaScript ecosystem
around linting, and it has to reimplement everything from scratch. Everything from rules to auto-fixing capabilities and more.

Palantir, the backers behind TSLint announced in 2019 that **they would be deprecating TSLint in favor of supporting
`typescript-eslint`** in order to benefit the community. You can read more about that here: https://medium.com/palantir/tslint-in-2019-1a144c2317a9

The TypeScript Team themselves also announced their plans to move the TypeScript codebase from TSLint to `typescript-eslint`,
and they have been big supporters of this project. More details at https://github.com/microsoft/TypeScript/issues/30553

## Migrating from TSLint to ESLint

If you are looking for help in migrating from TSLint to ESLint, you can check out this project: [`tslint-to-eslint-config`]

You can look at [`the plugin ROADMAP.md`] for an up to date overview of how TSLint rules compare to the ones in this package.

There is also the ultimate fallback option of using both linters together for a while during your transition if you
absolutely have to by using TSLint _within_ ESLint. For this option, check out [`@typescript-eslint/eslint-plugin-tslint`].

## How does `typescript-eslint` work and why do you have multiple packages?

As mentioned above, TypeScript produces a different AST format to the one that ESLint requires to work.

This means that by default, the TypeScript AST is not compatible with the 1000s of rules which have been written by and
for ESLint users over the many years the project has been going.

TypeScript, in part, has a different AST format because it is a _superset_ of JavaScript. In other words, it contains
all of JavaScript syntax, plus some additional things.

For example:

```ts
var x: number = 1;
```

This is not valid JavaScript code, because it contains a so-called type annotation. When the TypeScript Compiler parses
this code to produce a TypeScript AST, the `: number` syntax will be represented in the tree, and this is simply not
something that ESLint can understand without additional help.

However, we can leverage the fact that ESLint has been designed with these use-cases in mind!

It turns out that ESLint is not just one library. Instead, it is composed of a few important moving parts. One of those
moving parts is **the parser**. ESLint ships with a built-in parser (called [`espree`](https://github.com/eslint/espree)),
and so if you only ever write standard JavaScript, you don't need to care about this implementation detail.

The great thing is, though, if we want to support non-standard JavaScript syntax, all we need to do is provide ESLint
with an alternative parser to use - that is a first-class use-case offered by ESLint.

Knowing we can do this is just the start, of course, we then need to set about creating a parser which is capable of
parsing TypeScript source code, and delivering an AST which is compatible with the one ESLint expects (with some
additions for things such as `: number`, as mentioned above).

The [`@typescript-eslint/parser`] package in this monorepo is, in fact, the custom ESLint parser implementation we
provide to ESLint in this scenario.

The flow and transformations that happen look a little something like this:

- ESLint invokes the `parser` specified in your ESLint config ([`@typescript-eslint/parser`])
- [`@typescript-eslint/parser`] deals with all the ESLint specific configuration and then invokes
  [`@typescript-eslint/typescript-estree`], an agnostic package that is only concerned with taking TypeScript source
  code and producing an appropriate AST.
- [`@typescript-eslint/typescript-estree`] works by invoking the TypeScript Compiler on the given source code in order to
  produce a TypeScript AST and then converting that AST into a format that ESLint expects.

:::note
This AST format is more broadly used than just for ESLint. It even has its own spec and is known as **[ESTree]**,
which is why our package is called `typescript-estree`.
:::

> Because [`@typescript-eslint/typescript-estree`] has a very specific purpose, it is reusable for tools with similar
> requirements to ESLint. It is therefore also used to power the amazing opinionated code formatter [Prettier]'s TypeScript use-case.

That just about covers the parsing piece! But what about the rules? This is where our plugins come into play.

[`@typescript-eslint/parser`]: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser
[`@typescript-eslint/typescript-estree`]: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/typescript-estree
[`@typescript-eslint/eslint-plugin-tslint`]: https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin-tslint
[`the plugin roadmap.md`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
[estree]: https://github.com/estree/estree
[prettier]: https://prettier.io
[`espree`]: https://github.com/eslint/espree
[`tslint-to-eslint-config`]: https://github.com/typescript-eslint/tslint-to-eslint-config
