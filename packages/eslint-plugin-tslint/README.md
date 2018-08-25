# eslint-plugin-tslint2
ESLint plugin wraps a TSLint configuration and lints the whole source using TSLint.

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

### TSLint Plugins
* https://github.com/Glavin001/tslint-clean-code
* https://github.com/Microsoft/tslint-microsoft-contrib

