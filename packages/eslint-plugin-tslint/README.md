# ESLint Plugin TSLint

[![Travis](https://img.shields.io/travis/@typescript-eslint/eslint-plugin-tslint.svg?style=flat-square)](https://travis-ci.org/@typescript-eslint/eslint-plugin-tslint)
[![GitHub license](https://img.shields.io/npm/l/@typescript-eslint/eslint-plugin-tslint.svg?style=flat-square)](https://github.com/@typescript-eslint/eslint-plugin-tslint/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@typescript-eslint/eslint-plugin-tslint.svg?style=flat-square)](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin-tslint)
[![NPM Downloads](https://img.shields.io/npm/dt/@typescript-eslint/eslint-plugin-tslint.svg?style=flat-square)](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin-tslint)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

ESLint plugin wraps a TSLint configuration and lints the whole source using TSLint.

## INSTALL

```
npm i -D @typescript-eslint/eslint-plugin-tslint
```

## USAGE

Configure in your eslint config file:

```
"plugins": [
    "tslint"
],
"rules": {
    "tslint/config": ["warn", {
        lintFile: '/* path to tslint.json of your project */',
        rules: { /* tslint rules (will be used if `lintFile` is not specified) */ },
        rulesDirectory: [ /* array of paths to directories with rules, e.g. 'node_modules/tslint/lib/rules' (will be used if `lintFile` is not specified) */ ]
    }],
}
```

## RULES

Plugin contains only single rule `tslint/config`.

## EXAMPLES

- [unlight/node-package-starter/.eslintrc.js](https://github.com/unlight/node-package-starter/blob/master/.eslintrc.js)

### TSLint Plugins

- https://github.com/Glavin001/tslint-clean-code
- https://github.com/Microsoft/tslint-microsoft-contrib
- https://github.com/SonarSource/SonarTS
- https://github.com/ajafff/tslint-consistent-codestyle
