<h1 align="center">Typed ESLint Config</h1>

<p align="center">A utility function which provides types for `.eslintrc` files.</p>

<p align="center">
    <a href="https://dev.azure.com/typescript-eslint/TypeScript%20ESLint/_build/latest?definitionId=1&branchName=master"><img src="https://img.shields.io/azure-devops/build/typescript-eslint/TypeScript%20ESLint/1/master.svg?label=%F0%9F%9A%80%20Azure%20Pipelines&style=flat-square" alt="Azure Pipelines"/></a>
    <a href="https://github.com/typescript-eslint/typed-config/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/typed-config.svg?style=flat-square" alt="GitHub license" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/typed-config"><img src="https://img.shields.io/npm/v/@typescript-eslint/typed-config.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/typed-config"><img src="https://img.shields.io/npm/dm/@typescript-eslint/typed-config.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square" alt="Commitizen friendly" /></a>
</p>

<br>

## About

## Installation

```sh
npm install @typescript-eslint/typed-config --save-dev
```

## Usage

Create a `.eslintrc.js` configuration file, and use the function:

```js
const typedConfig = require('@typescript-eslint/typed-config');

module.exports = typedConfig({});
```

## Supported TypeScript Version

Please see https://github.com/typescript-eslint/typescript-eslint for the supported TypeScript version.

**Please ensure that you are using a supported version before submitting any issues/bug reports.**

## Reporting Issues

Please use the @typescript-eslint/typed-config issue template when creating your issue and fill out the information requested as best you can. This will really help us when looking into your issue.
