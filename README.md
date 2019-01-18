<h1 align="center">TypeScript ESLint</h1>

<p align="center">Monorepo for all the tooling which enables ESLint to support TypeScript</p>

<p align="center">
    <a href="https://travis-ci.com/typescript-eslint/typescript-eslint"><img src="https://img.shields.io/travis/com/typescript-eslint/typescript-eslint.svg?style=flat-square" alt="Travis"/></a>
    <a href="https://github.com/typescript-eslint/typescript-eslint/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/typescript-estree.svg?style=flat-square" alt="GitHub license" /></a>
    <a href="https://www.npmjs.com/package/typescript-estree"><img src="https://img.shields.io/npm/v/typescript-estree.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/typescript-estree"><img src="https://img.shields.io/npm/dt/typescript-estree.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square" alt="Commitizen friendly" /></a>
</p>

<br>

## About

This repo contains several packages which allow ESLint users to lint their TypeScript code.

- `typescript-estree` - An entirely generic TypeScript parser which takes TypeScript source code and produces an <a href="https://github.com/estree/estree">ESTree</a>-compatible AST</p>

  - This package is also used to power the amazing opinionated code formatter [Prettier](https://prettier.io)'s own TypeScript use-case.

- `typescript-eslint-parser` - An ESLint-specific parser which leverages `typescript-estree` and is designed to be used as a replacement for ESLint's default parser, `espree`.

- `eslint-plugin-typescript` - An ESLint-specific plugin which, when used in conjunction with `typescript-eslint-parser`, allows for TypeScript-specific linting rules to run.

- `eslint-plugin-tslint` - An ESLint-specific plugin which runs an instance of TSLint within your ESLint setup to allow for users to more easily migrate from TSLint to ESLint.

## Supported TypeScript Version

We will always endeavor to support the latest stable version of TypeScript.

The version of TypeScript currently supported by this parser is `~3.2.1`. This is reflected in the `devDependency` requirement within the package.json file, and it is what the tests will be run against. We have an open `peerDependency` requirement in order to allow for experimentation on newer/beta versions of TypeScript.

If you use a non-supported version of TypeScript, the parser will log a warning to the console.

**Please ensure that you are using a supported version before submitting any issues/bug reports.**

## Contributing

COMING SOON!

## License

TypeScript ESTree inherits from the the original TypeScript ESLint Parser license, as the majority of the work began there. It is licensed under a permissive BSD 2-clause license.
