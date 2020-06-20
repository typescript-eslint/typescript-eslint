<h1 align="center">ESLint Plugin TSLint</h1>

<p align="center">ESLint plugin wraps a TSLint configuration and lints the whole source using TSLint.</p>

<p align="center">
    <img src="https://github.com/typescript-eslint/typescript-eslint/workflows/CI/badge.svg" alt="CI" />
    <a href="https://www.npmjs.com/package/@typescript-eslint/eslint-plugin-tslint"><img src="https://img.shields.io/npm/v/@typescript-eslint/eslint-plugin-tslint.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/eslint-plugin-tslint"><img src="https://img.shields.io/npm/dm/@typescript-eslint/eslint-plugin-tslint.svg?style=flat-square" alt="NPM Downloads" /></a>
</p>

## Installation

```sh
yarn add -D @typescript-eslint/eslint-plugin-tslint
```

## Usage

Configure in your ESLint config file:

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

**Note:** The ability to automatically fix problems with `--fix` is unavailable for TSLint rules loaded with this plugin.

## Rules

Plugin contains only single rule `@typescript-eslint/tslint/config`.

## Examples

- [`unlight/node-package-starter/.eslintrc.js`](https://github.com/unlight/node-package-starter/blob/master/.eslintrc.js)

### TSLint Plugins

- https://github.com/Glavin001/tslint-clean-code
- https://github.com/Microsoft/tslint-microsoft-contrib
- https://github.com/SonarSource/SonarTS
- https://github.com/ajafff/tslint-consistent-codestyle

## Contributing

[See the contributing guide here](../../CONTRIBUTING.md)
