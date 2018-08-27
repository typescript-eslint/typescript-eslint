# eslint-plugin-tslint2
ESLint plugin wraps a TSLint configuration and lints the whole source using TSLint.  
Fork of [eslint-plugin-tslint](https://github.com/JamesHenry/eslint-plugin-tslint), the main difference are:  
- Support rules which requires type information
- Support tsx (WIP)

## INSTALL
```
npm i -D eslint-plugin-tslint2
```

## USAGE
Configure in your eslint config file:
```
"plugins": [
    "tslint2"
],
"rules": {
    "tslint2/config": ["warn", {
        rules: { /* tslint rules */ },
        rulesDirectory: [ /* array of paths to directories with rules, e.g. 'node_modules/tslint/lib/rules' */ ],
        configFile: '/* path to tsconfig.json of your project */',
        compilerOptions: { /* ability to override TypeScript compilers options defined in tsconfig.json */ }
    }],
}
```

## RULES
Plugin contains only single rule `tslint2/config`.

## EXAMPLES
* [unlight/node-package-starter/.eslintrc.js](https://github.com/unlight/node-package-starter/blob/master/.eslintrc.js)

### TSLint Plugins
* https://github.com/Glavin001/tslint-clean-code
* https://github.com/Microsoft/tslint-microsoft-contrib
