<h1 align="center">TypeScript ESLint</h1>

<p align="center">Monorepo for all the tooling which enables ESLint to support TypeScript</p>

<p align="center">
    <a href="https://dev.azure.com/typescript-eslint/TypeScript%20ESLint/_build/latest?definitionId=1&branchName=master"><img src="https://img.shields.io/azure-devops/build/typescript-eslint/TypeScript%20ESLint/1/master.svg?label=%F0%9F%9A%80%20Azure%20Pipelines&style=flat-square" alt="Azure Pipelines"/></a>
    <a href="https://github.com/typescript-eslint/typescript-eslint/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/typescript-estree.svg?style=flat-square" alt="GitHub license" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/typescript-estree"><img src="https://img.shields.io/npm/dm/@typescript-eslint/typescript-estree.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="https://codecov.io/gh/typescript-eslint/typescript-eslint"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/typescript-eslint/typescript-eslint.svg?style=flat-square"></a>
    <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square" alt="Commitizen friendly" /></a>
</p>

<br>

## Getting Started

The following sections will give you an overview of what this project is, why it exists and how it works at a high level.

**It is very important that you are familiar with these concepts before reporting issues**, so please read them and let us know if you have any feedback.

If you are ready to get started you can jump to the package READMEs from here: [#how-do-i-configure-my-project-to-use-typescript-eslint](#how-do-i-configure-my-project-to-use-typescript-eslint)

<br>

## What are ESLint and TypeScript, and how do they compare?

**ESLint** is an awesome linter for JavaScript code.

- Behind the scenes it uses a parser to turn your source code into a data format called an Abstract Syntax Tree (AST). This data format is then used by plugins to create assertions called lint rules around what your code should look or behave like.

**TypeScript** is an awesome static code analyzer for JavaScript code, and some additional syntax that it provides on top of the underlying JavaScript language.

- Behind the scenes it uses a parser to turn your source code into a data format called an Abstract Syntax Tree (AST). This data format is then used by other parts of the TypeScript Compiler to do things like give you feedback on issues, allow you to refactor easily etc.

They sound similar, right? They are! Both projects are ultimately striving to help you write the best JavaScript code you possibly can.

<br>

## Why does this project exist?

As covered by the previous section, both ESLint and TypeScript rely on turning your source code into a data format called an AST in order to do their jobs.

However, it turns out that ESLint and TypeScript use _different_ ASTs to each other.

The reason for this difference is not so interesting or important, and is simply the result of different evolutions, priorities and timelines of the projects.

This project, `typescript-eslint`, exists primarily because of this major difference between the projects.

`typescript-eslint` exists so that you can use ESLint and TypeScript together, without needing to worry about implementation detail differences wherever possible.

<br>

## What about TSLint?

TSLint is a fantastic tool. It is a linter that was written specifically to work based on the TypeScript AST format mentioned above. This has advantages and disadvantages, as with most decisions we are faced with in software engineering!

One advantage is there is no tooling required to reconcile differences between AST formats, but the major disadvantage is that the tool is therefore unable to reuse any of the previous work which has been done in the JavaScript ecosystem around linting, and it has to reimplement everything from scratch. Everything from rules to auto-fixing capabilities and more.

Palantir, the backers behind TSLint announced earlier this year that **they would be deprecating TSLint in favor of supporting `typescript-eslint`** in order to benefit the community. You can read more about that here: https://medium.com/palantir/tslint-in-2019-1a144c2317a9

The TypeScript Team themselves also announced their plans to move the TypeScript codebase from TSLint to `typescript-eslint`, and they have been big supporters of this project.

<br>

## How does `typescript-eslint` work and why do you have multiple packages?

As mentioned above, TypeScript produces a different AST format to the one that ESLint requires to work.

This means that by default, the TypeScript AST is not compatible with the 1000s of rules which have been written by and for ESLint users over the many years the project has been going.

TypeScript, in part, has a different AST format because it is a _superset_ of JavaScript. In other words, it contains all of JavaScript syntax, plus some additional things.

For example:

```ts
var x: number = 1;
```

This is not valid JavaScript code, because it contains a so called type-annotation. When the TypeScript Compiler parses this code to produce a TypeScript AST, that `: number` syntax will be represented in the tree, and this is simply not something that ESLint can understand without additional help.

However, we can leverage the fact that ESLint has been designed with these use-cases in mind!

It turns out that ESLint is not just comprised of one library, instead it is comprised of a few important moving parts. One of those moving parts is **the parser**. ESLint ships with a parser built in (called [`espree`](https://github.com/eslint/espree)), and so if you only ever write standard JavaScript, you don't need to care about this implementation detail.

The great thing is, though, if we want to support non-standard JavaScript syntax, all we need to do is provide ESLint with an alternative parser to use - that is a first-class use-case offered by ESLint.

Knowing we can do this is just the start of course, we then need to set about creating a parser which is capable of parsing TypeScript source code, and delivering an AST which is compatible with the one ESLint expects (with some additions for things such as `: number` as mentioned above).

The [`@typescript-eslint/parser`](./packages/parser/) package in this monorepo is in fact the custom ESLint parser implementation we provide to ESLint in this scenario.

The flow and transformations that happen look a little something like this:

- ESLint invokes the `parser` specified in your ESLint config ([`@typescript-eslint/parser`](./packages/parser/))

- [`@typescript-eslint/parser`](./packages/parser/) deals with all the ESLint specific configuration, and then invokes [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/), an agnostic package that is only concerned with taking TypeScript source code and producing an appropriate AST.

- [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/) works by invoking the TypeScript Compiler on the given source code in order to produce a TypeScript AST, and then converting that AST into a format that ESLint expects.

**Note**: This AST format is actually more broadly used than just for ESLint. It even has its own spec and is known as **[ESTree](https://github.com/estree/estree)**, which is why our package is called `typescript-estree`.

> Because [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/) has a very specific purpose, it is reusable for tools with similar requirements to ESLint. It is therefore also used to power the amazing opinionated code formatter [Prettier](https://prettier.io)'s own TypeScript use-case.

That just about covers the parsing piece! But what about the rules? This is where our plugins come into play.

<br>

## Can I use _all_ of the existing ESLint plugins and rules without any changes?

The short answer is, no.

The great news is, **there are many, many rules which will "just work"** without you having to change anything about them or provide any custom alternatives.

However, it is super important to be mindful all of the things we have covered in this README so far.

- TypeScript and ESLint have similar purposes

  - This means that there will be cases where TypeScript actually solves a problem for us that we previously relied on ESLint for. These two solutions could have similar aims, but different results, or be incompatible in other ways. The best way to deal with situations like this is often to disable the relevant ESLint rule and go with the TypeScript Compiler.

- TypeScript is a superset of JavaScript
  - Even with the AST conversion in place in the parser, there can be things in the final AST which ESLint does not natively understand. If ESLint rules have been written in such a way that they make particular assumptions about ASTs, this can sometimes result in rules crashing. This can be mitigated in a number of ways - we can work with rule authors to make their code more robust, or we can provide alternative rules via our own [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin/).

<br>

## Can we write rules which leverage type information?

Yes!

One of the huge benefits of using TypeScript is the fact that type information can be used to assert expected behaviors.

When the transformation steps outlined above take place, we keep references to the original TypeScript AST and associated parser services, and so ESLint rules authors can access them in their rules.

We already do this in numerous rules within [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin/), for example `no-unnecessary-type-assertion` and `no-inferrable-types`.

<br>

## What about Babel and `babel-eslint`?

Babel does now support parsing (but not type-checking) TypeScript source code. This is as an alternative to using the TypeScript Compiler. It also supports many other syntaxes, via plugins, which are not supported by the TypeScript Compiler. As mentioned above, `typescript-eslint` is powered by the TypeScript Compiler, so we support whatever it does.

The key trade-off can be summarized as: `babel-eslint` supports additional syntax which TypeScript itself does not, but `typescript-eslint` supports creating rules based on type information, which is not available to babel because there is no type-checker.

Because they are therefore separate projects powered by different underlying tooling, they are currently not intended to be used together.

Some of the people involved in `typescript-eslint` are also involved in Babel and `babel-eslint`, and in this project we are working hard to align on the AST format for non-standard JavaScript syntax. This is an ongoing effort.

<br>

## How can I help?

I'm so glad you asked!

As you can see at the [top of this repo](#typescript-eslint), these packages are already downloaded millions of times per month, and power high profile projects across our industry.

Nevertheless, this is a 100% community driven project. From the second you install one of the packages from this monorepo, you are a part of that community.

Please be respectful and mindful of how many hours of unpaid work go into building out all of the functionality we have introduced (in brief detail) above.

We can always do better, but providing the glue between two different tools is always extra difficult because both sides come with their own assumptions and priorities.

See an issue? Report it in as much detail as possible, ideally with a clear and minimal reproduction. Think about what information you would need to start solving the problem yourself and take it from there.

If you have the time and the inclination, you can even take it a step further and submit a PR to improve the project.

All positive contributions are welcome here!

<br>

## How do I configure my project to use `typescript-eslint`?

Please follow the links below for the packages you care about.

If you are interested in using TypeScript and ESLint together, you will want to check out [`@typescript-eslint/parser`](./packages/parser/) and [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin/) at the very least:

- [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/) - An entirely generic TypeScript parser which takes TypeScript source code and produces an <a href="https://github.com/estree/estree">ESTree</a>-compatible AST</p>

  - This package is also used to power the amazing opinionated code formatter [Prettier](https://prettier.io)'s own TypeScript use-case.

- [`@typescript-eslint/parser`](./packages/parser/) - An ESLint-specific parser which leverages `typescript-estree` and is designed to be used as a replacement for ESLint's default parser, `espree`.

- [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin/) - An ESLint-specific plugin which, when used in conjunction with `@typescript-eslint/parser`, allows for TypeScript-specific linting rules to run.

- [`@typescript-eslint/eslint-plugin-tslint`](./packages/eslint-plugin-tslint) - An ESLint-specific plugin which runs an instance of TSLint within your ESLint setup to allow for users to more easily migrate from TSLint to ESLint.

<br>

## Package Versions

All of the packages are published with the same version number to make it easier to coordinate both releases and installations.

Additionally, we also publish a canary release on every successful merge to master, so you never need to wait for a new stable version to make use of any updates.

The `latest` (stable) version is:

<a href="https://www.npmjs.com/package/@typescript-eslint/parser"><img src="https://img.shields.io/npm/v/@typescript-eslint/parser/latest.svg?style=flat-square" alt="NPM Version" /></a>

The `canary` (latest master) version is:

<a href="https://www.npmjs.com/package/@typescript-eslint/parser"><img src="https://img.shields.io/npm/v/@typescript-eslint/parser/canary.svg?style=flat-square" alt="NPM Version" /></a>

<br>

## Supported TypeScript Version

We will always endeavor to support the latest stable version of TypeScript. Sometimes, but not always, changes in TypeScript will not require breaking changes in this project, and so we are able to support more than one version of TypeScript.

**The version range of TypeScript currently supported by this parser is `>=3.2.1 <3.5.0`.**

This is reflected in the `devDependency` requirement within the package.json file, and it is what the tests will be run against. We have an open `peerDependency` requirement in order to allow for experimentation on newer/beta versions of TypeScript.

If you use a non-supported version of TypeScript, the parser will log a warning to the console. If you want to disable this warning, you can configure this in your `parserOptions`. See: [`@typescript-eslint/parser`](./packages/parser/) and [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/).

**Please ensure that you are using a supported version before submitting any issues/bug reports.**

<br>

## License

TypeScript ESLint inherits from the the original TypeScript ESLint Parser license, as the majority of the work began there. It is licensed under a permissive BSD 2-clause license.

<br>

## Contributors

Thanks goes to the wonderful people listed in [`CONTRIBUTORS.md`](./CONTRIBUTORS.md).

<br>

## Contributing Guide

COMING SOON!
