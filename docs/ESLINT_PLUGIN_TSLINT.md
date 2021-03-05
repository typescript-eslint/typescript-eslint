---
id: eslint-plugin-tslint
title: ESLint plugin TSLint
sidebar_label: ESLint plugin TSLint
---

## Installation

```bash npm2yarn
npm install --save-dev @typescript-eslint/eslint-plugin-tslint
```

## Usage

Configure in your ESLint config file:

```js title=".eslintrc.js"
module.exports = {
  plugins: ['@typescript-eslint/tslint'],
  parserOptions: {
    project: 'tsconfig.json',
  },
  rules: {
    '@typescript-eslint/tslint/config': [
      'warn',
      {
        lintFile: '', // path to tslint.json of your project
        rules: {
          // tslint rules (will be used if `lintFile` is not specified)
        },
        rulesDirectory: [
          // array of paths to directories with rules, e.g. 'node_modules/tslint/lib/rules' (will be used if `lintFile` is not specified)
        ],
      },
    ],
  },
};
```

## Rules

Plugin contains only single rule `@typescript-eslint/tslint/config`.

## Examples

- [`unlight/node-package-starter/.eslintrc.js`](https://github.com/unlight/node-package-starter/blob/master/.eslintrc.js)

### TSLint Plugins

- https://github.com/Glavin001/tslint-clean-code
- https://github.com/Microsoft/tslint-microsoft-contrib
- https://github.com/SonarSource/SonarTS
- https://github.com/ajafff/tslint-consistent-codestyle
