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

## About

This repo contains several packages which allow ESLint users to lint their TypeScript code.

- [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/) - An entirely generic TypeScript parser which takes TypeScript source code and produces an <a href="https://github.com/estree/estree">ESTree</a>-compatible AST</p>

  - This package is also used to power the amazing opinionated code formatter [Prettier](https://prettier.io)'s own TypeScript use-case.

- [`@typescript-eslint/parser`](./packages/parser/) - An ESLint-specific parser which leverages `typescript-estree` and is designed to be used as a replacement for ESLint's default parser, `espree`.

- [`@typescript-eslint/eslint-plugin`](./packages/eslint-plugin/) - An ESLint-specific plugin which, when used in conjunction with `@typescript-eslint/parser`, allows for TypeScript-specific linting rules to run.

- [`@typescript-eslint/eslint-plugin-tslint`](./packages/eslint-plugin-tslint) - An ESLint-specific plugin which runs an instance of TSLint within your ESLint setup to allow for users to more easily migrate from TSLint to ESLint.

## Package Versions

All of the packages are published with the same version number to make it easier to coordinate both releases and installations.

Additionally, we also publish a canary release on every successful merge to master, so you never need to wait for a new stable version to make use of any updates.

The `latest` (stable) version is:

<a href="https://www.npmjs.com/package/@typescript-eslint/parser"><img src="https://img.shields.io/npm/v/@typescript-eslint/parser/latest.svg?style=flat-square" alt="NPM Version" /></a>

The `canary` (latest master) version is:

<a href="https://www.npmjs.com/package/@typescript-eslint/parser"><img src="https://img.shields.io/npm/v/@typescript-eslint/parser/canary.svg?style=flat-square" alt="NPM Version" /></a>

## Supported TypeScript Version

We will always endeavor to support the latest stable version of TypeScript. Sometimes, but not always, changes in TypeScript will not require breaking changes in this project, and so we are able to support more than one version of TypeScript.

**The version range of TypeScript currently supported by this parser is `>=3.2.1 <3.4.0`.**

This is reflected in the `devDependency` requirement within the package.json file, and it is what the tests will be run against. We have an open `peerDependency` requirement in order to allow for experimentation on newer/beta versions of TypeScript.

If you use a non-supported version of TypeScript, the parser will log a warning to the console. If you want to disable this warning, you can configure this in your `parserOptions`. See: [`@typescript-eslint/parser`](./packages/parser/) and [`@typescript-eslint/typescript-estree`](./packages/typescript-estree/).

**Please ensure that you are using a supported version before submitting any issues/bug reports.**

## License

TypeScript ESLint inherits from the the original TypeScript ESLint Parser license, as the majority of the work began there. It is licensed under a permissive BSD 2-clause license.

## Contributors

Thanks goes to the wonderful people listed in [`CONTRIBUTORS.md`](./CONTRIBUTORS.md).

## Contributing Guide

COMING SOON!
