# ESLint Plugin TSLint
[![Travis](https://img.shields.io/travis/JamesHenry/eslint-plugin-tslint.svg?style=flat-square)](https://travis-ci.org/JamesHenry/eslint-plugin-tslint) 
[![GitHub license](https://img.shields.io/npm/l/eslint-plugin-tslint.svg?style=flat-square)](https://github.com/JamesHenry/eslint-plugin-tslint/blob/master/LICENSE) 
[![NPM Version](https://img.shields.io/npm/v/eslint-plugin-tslint.svg?style=flat-square)](https://www.npmjs.com/package/eslint-plugin-tslint) 
[![NPM Downloads](https://img.shields.io/npm/dt/eslint-plugin-tslint.svg?style=flat-square)](https://www.npmjs.com/package/eslint-plugin-tslint) 
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) 
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release) 
[![greenkeeper.io](https://badges.greenkeeper.io/JamesHenry/mongoose-schema-to-typescript-interface.svg?style=flat-square)](https://greenkeeper.io)

ESLint plugin wraps a TSLint configuration and lints the whole source using TSLint.  

## INSTALL
```
npm i -D eslint-plugin-tslint
```

## USAGE
Configure in your eslint config file:
```
"plugins": [
    "tslint"
],
"rules": {
    "tslint/config": ["warn", {
        rules: { /* tslint rules */ },
        rulesDirectory: [ /* array of paths to directories with rules, e.g. 'node_modules/tslint/lib/rules' */ ],
        configFile: '/* path to tsconfig.json of your project */',
        compilerOptions: { /* ability to override TypeScript compilers options defined in tsconfig.json */ }
    }],
}
```

## RULES
Plugin contains only single rule `tslint/config`.

## EXAMPLES
* [unlight/node-package-starter/.eslintrc.js](https://github.com/unlight/node-package-starter/blob/master/.eslintrc.js)

### TSLint Plugins
* https://github.com/Glavin001/tslint-clean-code
* https://github.com/Microsoft/tslint-microsoft-contrib
* https://github.com/SonarSource/SonarTS
