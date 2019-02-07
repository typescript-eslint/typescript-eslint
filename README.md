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

## Contributing

COMING SOON!

## License

TypeScript ESLint inherits from the the original TypeScript ESLint Parser license, as the majority of the work began there. It is licensed under a permissive BSD 2-clause license.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/all-contributors/all-contributors#emoji-key)):
Use `yarn all-contributors add <github-name> code && yarn all-contributors generate` to add yourself.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table cellspacing="0" cellpadding="1"><tr><td><a href="https://zacher.com.au"><img src="https://avatars1.githubusercontent.com/u/7462525?v=4" width="100px;" height="100px;" alt="Brad Zacher"/><br /><sub><b>Brad Zacher</b></sub></a><br /><a href="#maintenance-bradzacher" title="Maintenance">🚧</a> <a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=bradzacher" title="Code">💻</a></td><td><a href="https://jameshenry.blog"><img src="https://avatars1.githubusercontent.com/u/900523?v=4" width="100px;" height="100px;" alt="James Henry"/><br /><sub><b>James Henry</b></sub></a><br /><a href="#maintenance-JamesHenry" title="Maintenance">🚧</a> <a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=JamesHenry" title="Code">💻</a></td><td><a href="https://github.com/armano2"><img src="https://avatars1.githubusercontent.com/u/625469?v=4" width="100px;" height="100px;" alt="Armano"/><br /><sub><b>Armano</b></sub></a><br /><a href="#maintenance-armano2" title="Maintenance">🚧</a> <a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=armano2" title="Code">💻</a></td><td><a href="https://j-f1.github.io"><img src="https://avatars2.githubusercontent.com/u/25517624?v=4" width="100px;" height="100px;" alt="Jed Fox"/><br /><sub><b>Jed Fox</b></sub></a><br /><a href="#maintenance-j-f1" title="Maintenance">🚧</a> <a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=j-f1" title="Code">💻</a></td><td><a href="https://github.com/uniqueiniquity"><img src="https://avatars1.githubusercontent.com/u/9092011?v=4" width="100px;" height="100px;" alt="Benjamin Lichtman"/><br /><sub><b>Benjamin Lichtman</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=uniqueiniquity" title="Code">💻</a></td><td><a href="http://www.joshuakgoldberg.com"><img src="https://avatars1.githubusercontent.com/u/3335181?v=4" width="100px;" height="100px;" alt="Josh Goldberg"/><br /><sub><b>Josh Goldberg</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=JoshuaKGoldberg" title="Code">💻</a></td><td><a href="https://github.com/lukyth"><img src="https://avatars3.githubusercontent.com/u/7040242?v=4" width="100px;" height="100px;" alt="Kanitkorn Sujautra"/><br /><sub><b>Kanitkorn Sujautra</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=lukyth" title="Code">💻</a></td></tr><tr><td><a href="https://www.weirdpattern.com"><img src="https://avatars0.githubusercontent.com/u/19519411?v=4" width="100px;" height="100px;" alt="Patricio Trevino"/><br /><sub><b>Patricio Trevino</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=weirdpattern" title="Code">💻</a></td><td><a href="https://github.com/kaicataldo"><img src="https://avatars2.githubusercontent.com/u/7041728?v=4" width="100px;" height="100px;" alt="Kai Cataldo"/><br /><sub><b>Kai Cataldo</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=kaicataldo" title="Code">💻</a></td><td><a href="https://plus.google.com/u/0/+ToruNagashimax/"><img src="https://avatars2.githubusercontent.com/u/1937871?v=4" width="100px;" height="100px;" alt="Toru Nagashima"/><br /><sub><b>Toru Nagashima</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=mysticatea" title="Code">💻</a></td><td><a href="https://github.com/platinumazure"><img src="https://avatars0.githubusercontent.com/u/284282?v=4" width="100px;" height="100px;" alt="Kevin Partington"/><br /><sub><b>Kevin Partington</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=platinumazure" title="Code">💻</a></td><td><a href="https://mackie.world"><img src="https://avatars1.githubusercontent.com/u/2344137?v=4" width="100px;" height="100px;" alt="mackie"/><br /><sub><b>mackie</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=macklinu" title="Code">💻</a></td><td><a href="https://gplane.win"><img src="https://avatars1.githubusercontent.com/u/17216317?v=4" width="100px;" height="100px;" alt="Pig Fang"/><br /><sub><b>Pig Fang</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=g-plane" title="Code">💻</a></td><td><a href="https://twitter.com/ikatyang_"><img src="https://avatars1.githubusercontent.com/u/8341033?v=4" width="100px;" height="100px;" alt="Ika"/><br /><sub><b>Ika</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=ikatyang" title="Code">💻</a></td></tr><tr><td><a href="http://43081j.com/"><img src="https://avatars1.githubusercontent.com/u/5677153?v=4" width="100px;" height="100px;" alt="James Garbutt"/><br /><sub><b>James Garbutt</b></sub></a><br /><a href="https://github.com/typescript-eslint/typescript-eslint/commits?author=43081j" title="Code">💻</a></td></tr></table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

Use `yarn all-contributors add <github-name> code && yarn all-contributors generate` to add yourself.
