<h1 align="center">TypeScript ESLint</h1>

<p align="center">Monorepo for all the tooling which enables ESLint to support TypeScript</p>

<p align="center">
    <img src="https://github.com/typescript-eslint/typescript-eslint/workflows/CI/badge.svg" alt="CI" />
    <a href="https://opencollective.com/typescript-eslint"><img src="https://opencollective.com/typescript-eslint/all/badge.svg?label=financial+contributors&style=flat-square" alt="Financial Contributors on Open Collective" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/typescript-estree"><img src="https://img.shields.io/npm/dm/@typescript-eslint/typescript-estree.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="https://codecov.io/gh/typescript-eslint/typescript-eslint"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/typescript-eslint/typescript-eslint.svg?style=flat-square"></a>
</p>

<br>

## Table of Contents

- [Getting Started / Installation](#getting-started--installation)
- [What are ESLint and TypeScript, and how do they compare?](#what-are-eslint-and-typescript-and-how-do-they-compare)
- [Why does this project exist?](#why-does-this-project-exist)
- [What about TSLint?](#what-about-tslint)
- [How does `typescript-eslint` work and why do you have multiple packages?](#how-does-typescript-eslint-work-and-why-do-you-have-multiple-packages)
- [Can I use all of the existing ESLint plugins and rules without any changes?](#can-i-use-all-of-the-existing-eslint-plugins-and-rules-without-any-changes)
- [Can we write rules which leverage type information?](#can-we-write-rules-which-leverage-type-information)
- [What about Babel and `babel-eslint`?](#what-about-babel-and-babel-eslint)
- [How can I help?](#how-can-i-help)
- [Packages included in this project?](#packages-included-in-this-project)
- [Package Versions](#package-versions)
- [Supported TypeScript Version](#supported-typescript-version)
- [Supported ESLint version](#supported-eslint-version)
- [Supported Node version](#supported-node-version)
- [License](#license)
- [Contributors](#code-contributors)
- [Contributing Guide](#contributing-guide)

## Getting Started / Installation

- **[You can find our Getting Started docs here](./docs/getting-started/README.md)**
- **[You can find our Linting FAQ / Troubleshooting docs here](./docs/getting-started/linting/FAQ.md)**

The documentation below will give you an overview of what this project is, why it exists and how it works at a high level.

**It is crucial that you are familiar with these concepts before reporting issues**, so it is a good idea to read them before raising issues.

<br>

## What are ESLint and TypeScript, and how do they compare?

**ESLint** is an awesome linter for JavaScript code.

- Behind the scenes, it uses a parser to turn your source code into a data format called an Abstract Syntax Tree (AST). This data format is then used by plugins to create assertions called lint rules around what your code should look or behave like.

**TypeScript** is an awesome static code analyzer for JavaScript code, and some additional syntax that it provides on top of the underlying JavaScript language.

- Behind the scenes, it uses a parser to turn your source code into a data format called an Abstract Syntax Tree (AST). This data format is then used by other parts of the TypeScript Compiler to do things like give you feedback on issues, allow you to refactor easily, etc.

They sound similar, right? They are! Both projects are ultimately striving to help you write the best JavaScript code you possibly can.

<br>

## Why does this project exist?

As covered by the previous section, both ESLint and TypeScript rely on turning your source code into a data format called an AST in order to do their jobs.

However, it turns out that ESLint and TypeScript use _different_ ASTs to each other.

The reason for this difference is not so interesting or important and is simply the result of different evolutions, priorities, and timelines of the projects.

This project, `typescript-eslint`, exists primarily because of this major difference between the projects.

`typescript-eslint` exists so that you can use ESLint and TypeScript together, without needing to worry about implementation detail differences wherever possible.

<br>

## What about TSLint?

TSLint is a fantastic tool. It is a linter that was written specifically to work based on the TypeScript AST format mentioned above. This has advantages and disadvantages, as with most decisions we are faced with in software engineering!

One advantage is there is no tooling required to reconcile differences between AST formats, but the major disadvantage is that the tool is therefore unable to reuse any of the previous work which has been done in the JavaScript ecosystem around linting, and it has to reimplement everything from scratch. Everything from rules to auto-fixing capabilities and more.

Palantir, the backers behind TSLint announced in 2019 that **they would be deprecating TSLint in favor of supporting `typescript-eslint`** in order to benefit the community. You can read more about that here: https://medium.com/palantir/tslint-in-2019-1a144c2317a9

The TypeScript Team themselves also announced their plans to move the TypeScript codebase from TSLint to `typescript-eslint`, and they have been big supporters of this project. More details at https://github.com/microsoft/TypeScript/issues/30553

### Migrating from TSLint to ESLint

If you are looking for help in migrating from TSLint to ESLint, you can check out this project: https://github.com/typescript-eslint/tslint-to-eslint-config

You can look at [`the plugin ROADMAP.md`](./packages/eslint-plugin/ROADMAP.md) for an up to date overview of how TSLint rules compare to the ones in this package.

There is also the ultimate fallback option of using both linters together for a while during your transition if you absolutely have to by using TSLint _within_ ESLint. For this option, check out [`@typescript-eslint/eslint-plugin-tslint`](./packages/eslint-plugin-tslint/).

<br>

## How does `typescript-eslint` work and why do you have multiple packages?

As mentioned above, TypeScript produces a different AST format to the one that ESLint requires to work.

This means that by default, the TypeScript AST is not compatible with the 1000s of rules which have been written by and for ESLint users over the many years the project has been going.

TypeScript, in part, has a different AST format because it is a _superset_ of JavaScript. In other words, it contains all of JavaScript syntax, plus some additional things.

For example:

```ts
var x: number = 1;
```

This is not valid JavaScript code, because it contains a so-called type annotation. When the TypeScript Compiler parses this code to produce a TypeScript AST, the `: number` syntax will be represented in the tree, and this is simply not something that ESLint can understand without additional help.

However, we can leverage the fact that ESLint has been designed with these use-cases in mind!

It turns out that ESLint is not just one library. Instead, it is composed of a few important moving parts. One of those moving parts is **the parser**. ESLint ships with a built-in parser (called [`espree`](https://github.com/eslint/espree)), and so if you only ever write standard JavaScript, you don't need to care about this implementation detail.

The great thing is, though, if we want to support non-standard JavaScript syntax, all we need to do is provide ESLint with an alternative parser to use - that is a first-class use-case offered by ESLint.

Knowing we can do this is just the start, of course, we then need to set about creating a parser which is capable of parsing TypeScript source code, and delivering an AST which is compatible with the one ESLint expects (with some additions for things such as `: number`, as mentioned above).

The [`@typescript-eslint/parser`](./packages/parser/) package in this monorepo is, in fact, the custom ESLint parser implementation we provide to ESLint in this scenario.

The flow and transformations that happen look a little something like this:

- ESLint invokes the `parser` specified in your ESLint config ([`@typescript-eslint/parser`](./packages/parser/))

- [`@typescript-eslint/parser`](./packages/parser/) deals with all the ESLint specific configuration and then invokes [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/), an agnostic package that is only concerned with taking TypeScript source code and producing an appropriate AST.

- [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/) works by invoking the TypeScript Compiler on the given source code in order to produce a TypeScript AST and then converting that AST into a format that ESLint expects.

**Note**: This AST format is more broadly used than just for ESLint. It even has its own spec and is known as **[ESTree](https://github.com/estree/estree)**, which is why our package is called `typescript-estree`.

> Because [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/) has a very specific purpose, it is reusable for tools with similar requirements to ESLint. It is therefore also used to power the amazing opinionated code formatter [Prettier](https://prettier.io)'s TypeScript use-case.

That just about covers the parsing piece! But what about the rules? This is where our plugins come into play.

<br>

## Can I use _all_ of the existing ESLint plugins and rules without any changes?

The short answer is, no.

The great news is, **there are many, many rules which will "just work"** without you having to change anything about them or provide any custom alternatives.

However, it is super important to be mindful of all of the things we have covered in this README so far.

- TypeScript and ESLint have similar purposes

  - This means that there will be cases where TypeScript actually solves a problem for us that we previously relied on ESLint for. These two solutions could have similar aims, but different results, or be incompatible in other ways. The best way to deal with situations like this is often to disable the relevant ESLint rule and go with the TypeScript Compiler.

- TypeScript is a superset of JavaScript
  - Even with the AST conversion in place in the parser, there can be things in the final AST which ESLint does not natively understand. If ESLint rules have been written in such a way that they make particular assumptions about ASTs, this can sometimes result in rules crashing. This can be mitigated in several ways - we can work with rule authors to make their code more robust, or we can provide alternative rules via our own [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin/).

<br>

## Can we write rules which leverage type information?

Yes!

One of the huge benefits of using TypeScript is the fact that type information can be used to assert expected behaviors.

When the transformation steps outlined above take place, we keep references to the original TypeScript AST and associated parser services, and so ESLint rules authors can access them in their rules.

We already do this in numerous rules within [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin/), for example, `no-unnecessary-type-assertion` and `no-inferrable-types`.

<br>

## What about Babel and `babel-eslint`?

Babel does now support parsing (but not type-checking) TypeScript source code. This is as an alternative to using the TypeScript Compiler. It also supports many other syntaxes, via plugins, which are not supported by the TypeScript Compiler. As mentioned above, `typescript-eslint` is powered by the TypeScript Compiler, so we support whatever it does.

The key trade-off can be summarized as `babel-eslint` supports additional syntax which TypeScript itself does not, but `typescript-eslint` supports creating rules based on type information, which is not available to babel because there is no type-checker.

Because they are separate projects powered by different underlying tooling, they are currently not intended to be used together.

Some of the people involved in `typescript-eslint` are also involved in Babel and `babel-eslint`, and in this project, we are working hard to align on the AST format for non-standard JavaScript syntax. This is an ongoing effort.

<br>

## How can I help?

I'm so glad you asked!

As you can see at the [top of this repo](#typescript-eslint), these packages are already downloaded millions of times per month, and power high profile projects across our industry.

Nevertheless, this is a 100% community-driven project. From the second you install one of the packages from this monorepo, you are a part of that community.

Please be respectful and mindful of how many hours of unpaid work go into building out all of the functionality we have introduced (in brief detail) above.

We can always do better, but providing the glue between two different tools is always extra difficult because both sides come with their own assumptions and priorities.

See an issue? Report it in as much detail as possible, ideally with a clear and minimal reproduction. Think about what information you would need to start solving the problem yourself and take it from there.

If you have the time and the inclination, you can even take it a step further and submit a PR to improve the project.

There are also financial ways to contribute, please see [Financial Contributors](#Financial-Contributors) for more details.

All positive contributions are welcome here!

<br>

## Packages included in this project

Please follow the links below for the packages you care about.

- [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/) - An entirely generic TypeScript parser which takes TypeScript source code and produces an <a href="https://github.com/estree/estree">ESTree</a>-compatible AST</p>

  - This package is also used to power the amazing opinionated code formatter [Prettier](https://prettier.io)'s own TypeScript use-case.

- [`@typescript-eslint/parser`](./packages/parser/) - An ESLint-specific parser which leverages `typescript-estree` and is designed to be used as a replacement for ESLint's default parser, `espree`.

- [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin/) - An ESLint-specific plugin which, when used in conjunction with `@typescript-eslint/parser`, allows for TypeScript-specific linting rules to run.

- [`@typescript-eslint/eslint-plugin-tslint`](./packages/eslint-plugin-tslint) - An ESLint-specific plugin that runs an instance of TSLint within your ESLint setup to allow for users to more easily migrate from TSLint to ESLint.

<br>

## Package Versions

All of the packages are published with the same version number to make it easier to coordinate both releases and installations.

We publish a canary release on every successful merge to master, so **you never need to wait for a new stable version to make use of any updates**.

Additionally, we promote the to the `latest` tag on NPM once per week, **on Mondays at 1 pm Eastern**.

The latest version under the `latest` tag is:

<a href="https://www.npmjs.com/package/@typescript-eslint/parser"><img src="https://img.shields.io/npm/v/@typescript-eslint/parser/latest.svg?style=flat-square" alt="NPM Version" /></a>

The latest version under the `canary` tag **(latest commit to master)** is:

<a href="https://www.npmjs.com/package/@typescript-eslint/parser"><img src="https://img.shields.io/npm/v/@typescript-eslint/parser/canary.svg?style=flat-square" alt="NPM Version" /></a>

(Note: The only exception to the automated publishes described above is when we are in the final phases of creating the next major version of the libraries - e.g. going from `1.x.x` to `2.x.x`. During these periods, we manually publish `canary` releases until we are happy with the release and promote it to `latest`.)

<br>

## Supported TypeScript Version

**The version range of TypeScript currently supported by this parser is `>=3.3.1 <4.1.0`.**

These versions are what we test against.

We will always endeavor to support the latest stable version of TypeScript. Sometimes, but not always, changes in TypeScript will not require breaking changes in this project, and so we are able to support more than one version of TypeScript. In some cases, we may even be able to support additional pre-releases (i.e. betas and release candidates) of TypeScript, but only if doing so does not require us to compromise on support for the latest stable version.

Note that our packages have an open `peerDependency` requirement in order to allow for experimentation on newer/beta versions of TypeScript.

If you use a non-supported version of TypeScript, the parser will log a warning to the console. If you want to disable this warning, you can configure this in your `parserOptions`. See: [`@typescript-eslint/parser`](./packages/parser/) and [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/).

**Please ensure that you are using a supported version before submitting any issues/bug reports.**

<br>

## Supported ESLint version

See the value of `eslint` declared in `@typescript-eslint/eslint-plugin`'s [package.json](./packages/eslint-plugin/package.json).

## Supported Node version

This project makes an effort to support Active LTS and Maintenance LTS release statuses of Node according to [Node's release document](https://nodejs.org/en/about/releases/). Support for specific Current status releases are considered periodically.

## License

TypeScript ESLint inherits from the the original TypeScript ESLint Parser license, as the majority of the work began there. It is licensed under a permissive BSD 2-clause license.

<br>

## Code Contributors

This project exists thanks to every one of the awesome people who contribute code and documentation:

<a href="https://github.com/typescript-eslint/typescript-eslint/graphs/contributors"><img src="https://opencollective.com/typescript-eslint/contributors.svg?width=890&button=false" /></a>

🙏 An extra special thanks goes out to the wonderful people listed in [`CONTRIBUTORS.md`](./CONTRIBUTORS.md)

## Financial Contributors

In addition to submitting code and documentation updates, you can help us sustain our community by becoming a financial contributor [[Click here to contribute - every little bit helps!](https://opencollective.com/typescript-eslint/contribute)]

### Individuals

<a href="https://opencollective.com/typescript-eslint"><img src="https://opencollective.com/typescript-eslint/individuals.svg?width=890"></a>

### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Click here to contribute - every little bit helps!](https://opencollective.com/typescript-eslint/contribute)]

<a href="https://opencollective.com/typescript-eslint/organization/0/website"><img src="https://opencollective.com/typescript-eslint/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/1/website"><img src="https://opencollective.com/typescript-eslint/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/2/website"><img src="https://opencollective.com/typescript-eslint/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/3/website"><img src="https://opencollective.com/typescript-eslint/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/4/website"><img src="https://opencollective.com/typescript-eslint/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/5/website"><img src="https://opencollective.com/typescript-eslint/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/6/website"><img src="https://opencollective.com/typescript-eslint/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/7/website"><img src="https://opencollective.com/typescript-eslint/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/8/website"><img src="https://opencollective.com/typescript-eslint/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/typescript-eslint/organization/9/website"><img src="https://opencollective.com/typescript-eslint/organization/9/avatar.svg"></a>

<br>

<a href="https://www.netlify.com">
  <img src="https://www.netlify.com/img/global/badges/netlify-light.svg" alt="Deploys by Netlify" />
</a>

## Contributing Guide

[See the contributing guide here](./CONTRIBUTING.md)
