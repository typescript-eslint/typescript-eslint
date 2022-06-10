<h1 align="center">TypeScript ESLint</h1>

<p align="center">Monorepo for all the tooling which enables ESLint to support TypeScript</p>

<p align="center">
    <img src="https://github.com/typescript-eslint/typescript-eslint/workflows/CI/badge.svg" alt="CI" />
    <a href="https://opencollective.com/typescript-eslint"><img src="https://opencollective.com/typescript-eslint/all/badge.svg?label=financial+contributors&style=flat-square" alt="Financial Contributors on Open Collective" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/typescript-estree"><img src="https://img.shields.io/npm/dm/@typescript-eslint/typescript-estree.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="https://codecov.io/gh/typescript-eslint/typescript-eslint"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/typescript-eslint/typescript-eslint.svg?style=flat-square"></a>
</p>

<p align="center">
👇
</p>
<p align="center">
  <!-- markdownlint-disable MD033 -->
  See <strong><a href="https://typescript-eslint.io">typescript-eslint.io</a></strong> for documentation.
</p>
<p align="center">
👆
</p>

## Packages included in this project

See https://typescript-eslint.io/docs/development/architecture/packages for more details.

- [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin)
- [`@typescript-eslint/parser`](./packages/parser)
- [`@typescript-eslint/eslint-plugin-tslint`](./packages/eslint-plugin-tslint)
- [`@typescript-eslint/utils`](./packages/utils)
- [`@typescript-eslint/typescript-estree`](./packages/typescript-estree)
- [`@typescript-eslint/scope-manager`](./packages/scope-manager)

## Versioning

All of the packages are published with the same version number to make it easier to coordinate both releases and installations.

We publish a canary release on every successful merge to `main`, so **you never need to wait for a new stable version to make use of any updates**.

Additionally, we promote to the `latest` tag on NPM once per week, **on Mondays at 1 pm Eastern**.

The latest version under the `latest` tag is:

<a href="https://www.npmjs.com/package/@typescript-eslint/parser"><img src="https://img.shields.io/npm/v/@typescript-eslint/parser/latest.svg?style=flat-square" alt="NPM Version" /></a>

The latest version under the `canary` tag **(latest commit to `main`)** is:

<a href="https://www.npmjs.com/package/@typescript-eslint/parser"><img src="https://img.shields.io/npm/v/@typescript-eslint/parser/canary.svg?style=flat-square" alt="NPM Version" /></a>

(Note: The only exception to the automated publishes described above is when we are in the final phases of creating the next major version of the libraries - e.g. going from `1.x.x` to `2.x.x`. During these periods, we manually publish `canary` releases until we are happy with the release and promote it to `latest`.)

### Supported TypeScript Version

**The version range of TypeScript currently supported by this parser is `>=3.3.1 <4.8.0`.**

These versions are what we test against.

We will always endeavor to support the latest stable version of TypeScript.
Sometimes, but not always, changes in TypeScript will not require breaking changes in this project, and so we are able to support more than one version of TypeScript.
In some cases, we may even be able to support additional pre-releases (i.e. betas and release candidates) of TypeScript, but only if doing so does not require us to compromise on support for the latest stable version.

Note that our packages have an open `peerDependency` requirement in order to allow for experimentation on newer/beta versions of TypeScript.

If you use a non-supported version of TypeScript, the parser will log a warning to the console.
If you want to disable this warning, you can configure this in your `parserOptions`. See: [`@typescript-eslint/parser`](./packages/parser/) and [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/).

**Please ensure that you are using a supported version before submitting any issues/bug reports.**

### Supported ESLint Version

See the value of `eslint` declared in `@typescript-eslint/eslint-plugin`'s [package.json](./packages/eslint-plugin/package.json).

### Supported Node Version

This project makes an effort to support Active LTS and Maintenance LTS release statuses of Node according to [Node's release document](https://nodejs.org/en/about/releases).
Support for specific Current status releases are considered periodically.

## License

TypeScript ESLint inherits from the original TypeScript ESLint Parser license, as the majority of the work began there. It is licensed under a permissive BSD 2-clause license.

## How can I help?

I'm so glad you asked!

Although typescript-eslint's packages are already downloaded millions of times per month and power high profile projects across our industry, this is a 100% community-driven project.
From the second you install one of the packages from this monorepo, you are a part of that community.

**See an issue?**
Report it in as much detail as possible, ideally with a clear and minimal reproduction.

If you have the time and the inclination, you can even take it a step further and submit a PR to improve the project.

There are also financial ways to contribute, please see [Financial Contributors](#Financial-Contributors) for more details.

All positive contributions are welcome here!

> **[See the contributing guide here](./CONTRIBUTING.md)**.

Please be respectful and mindful of how many hours of unpaid work go into typescript-eslint.

## Code Contributors

This project exists thanks to every one of the awesome people who contribute code and documentation:

<a href="https://github.com/typescript-eslint/typescript-eslint/graphs/contributors"><img alt="Gallery of all contributors' profile photos" src="https://opencollective.com/typescript-eslint/contributors.svg?width=890&button=false" /></a>

🙏 An extra special thanks goes out to the wonderful people listed in [`CONTRIBUTORS.md`](./CONTRIBUTORS.md)

## Financial Contributors

In addition to submitting code and documentation updates, you can help us sustain our community by becoming a financial contributor [[Click here to contribute - every little bit helps!](https://opencollective.com/typescript-eslint/contribute)]

### Individuals

<a href="https://opencollective.com/typescript-eslint"><img alt="Gallery of all individual financial contributors' profile photos" src="https://opencollective.com/typescript-eslint/individuals.svg?width=890"></a>

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

<a href="https://www.netlify.com">
  <img src="https://www.netlify.com/img/global/badges/netlify-light.svg" alt="Deploys by Netlify" />
</a>
