<h1 align="center">ESLint Plugin TSLint</h1>

<p align="center">ESLint plugin wraps a TSLint configuration and lints the whole source using TSLint.</p>

<p align="center">
    <a href="https://dev.azure.com/typescript-eslint/TypeScript%20ESLint/_build/latest?definitionId=1&branchName=master"><img src="https://img.shields.io/azure-devops/build/typescript-eslint/TypeScript%20ESLint/1/master.svg?label=%F0%9F%9A%80%20Azure%20Pipelines&style=flat-square" alt="Azure Pipelines"/></a>
    <a href="https://github.com/typescript-eslint/typescript-eslint/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/typescript-estree.svg?style=flat-square" alt="GitHub license" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/eslint-plugin-tslint"><img src="https://img.shields.io/npm/v/@typescript-eslint/eslint-plugin-tslint.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/eslint-plugin-tslint"><img src="https://img.shields.io/npm/dm/@typescript-eslint/eslint-plugin-tslint.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square" alt="Commitizen friendly" /></a>
</p>

## Installation

```sh
npm i @typescript-eslint/eslint-plugin-tslint --save-dev
```

## Usage

Configure in your eslint config file:

```js
{
  "plugins": [
    "@typescript-eslint/tslint"
  ],
  "parserOptions": {
      "project": "tsconfig.json",
  },
  "rules": {
    "@typescript-eslint/tslint/config": ["warn", {
      "lintFile": "", // path to tslint.json of your project
      "rules": {
        // tslint rules (will be used if `lintFile` is not specified)
      },
      "rulesDirectory": [
        // array of paths to directories with rules, e.g. 'node_modules/tslint/lib/rules' (will be used if `lintFile` is not specified)
      ]
    }],
  }
}
```

**Note:** The ability to automatically fix problems with `--fix` is unavailable for tslint rules loaded with this plugin.

## Rules

Plugin contains only single rule `@typescript-eslint/tslint/config`.

## Examples

- [unlight/node-package-starter/.eslintrc.js](https://github.com/unlight/node-package-starter/blob/master/.eslintrc.js)

### TSLint Plugins

- https://github.com/Glavin001/tslint-clean-code
- https://github.com/Microsoft/tslint-microsoft-contrib
- https://github.com/SonarSource/SonarTS
- https://github.com/ajafff/tslint-consistent-codestyle
