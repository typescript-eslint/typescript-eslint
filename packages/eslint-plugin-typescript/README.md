# eslint-plugin-typescript

TypeScript support for ESLint. (This is still in the very early stages, so please be patient.)

### The below readme is for the upcoming 1.0.0 release. [Please see this tag for the current NPM version (0.14.0)](https://github.com/bradzacher/eslint-plugin-typescript/tree/0.14.0)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Last, install `eslint-plugin-typescript`:

```
$ npm install eslint-plugin-typescript --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-typescript` globally.

## Usage

Add `eslint-plugin-typescript/parser` to the `parser` field and `typescript` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "parser": "eslint-plugin-typescript/parser",
    "plugins": ["typescript"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "typescript/rule-name": "error"
    }
}
```

Note: The plugin provides its own version of the `typescript-eslint-parser` via `eslint-plugin-typescript/parser`.
This guarantees 100% compatibility between the plugin and the parser.

## Supported Rules

<!-- Please run `npm run docs` to update this section -->
<!-- begin rule list -->
**Key**: :heavy_check_mark: = recommended, :wrench: = fixable

| Name | Description | :heavy_check_mark: | :wrench: |
| ---- | ----------- | ------------------ | -------- |
| [`typescript/adjacent-overload-signatures`](./docs/rules/adjacent-overload-signatures.md) | Require that member overloads be consecutive (`adjacent-overload-signatures` from TSLint) |  |  |
| [`typescript/array-type`](./docs/rules/array-type.md) | Requires using either `T[]` or `Array<T>` for arrays (`array-type` from TSLint) |  | :wrench: |
| [`typescript/ban-types`](./docs/rules/ban-types.md) | Enforces that types will not to be used (`ban-types` from TSLint) |  | :wrench: |
| [`typescript/camelcase`](./docs/rules/camelcase.md) | Enforce camelCase naming convention |  |  |
| [`typescript/class-name-casing`](./docs/rules/class-name-casing.md) | Require PascalCased class and interface names (`class-name` from TSLint) | :heavy_check_mark: |  |
| [`typescript/explicit-function-return-type`](./docs/rules/explicit-function-return-type.md) | Require explicit return types on functions and class methods |  |  |
| [`typescript/explicit-member-accessibility`](./docs/rules/explicit-member-accessibility.md) | Require explicit accessibility modifiers on class properties and methods (`member-access` from TSLint) |  |  |
| [`typescript/generic-type-naming`](./docs/rules/generic-type-naming.md) | Enforces naming of generic type variables |  |  |
| [`typescript/interface-name-prefix`](./docs/rules/interface-name-prefix.md) | Require that interface names be prefixed with `I` (`interface-name` from TSLint) |  |  |
| [`typescript/member-delimiter-style`](./docs/rules/member-delimiter-style.md) | Require a specific member delimiter style for interfaces and type literals |  | :wrench: |
| [`typescript/member-naming`](./docs/rules/member-naming.md) | Enforces naming conventions for class members by visibility. |  |  |
| [`typescript/member-ordering`](./docs/rules/member-ordering.md) | Require a consistent member declaration order (`member-ordering` from TSLint) |  |  |
| [`typescript/no-angle-bracket-type-assertion`](./docs/rules/no-angle-bracket-type-assertion.md) | Enforces the use of `as Type` assertions instead of `<Type>` assertions (`no-angle-bracket-type-assertion` from TSLint) |  |  |
| [`typescript/no-array-constructor`](./docs/rules/no-array-constructor.md) | Disallow generic `Array` constructors |  | :wrench: |
| [`typescript/no-empty-interface`](./docs/rules/no-empty-interface.md) | Disallow the declaration of empty interfaces (`no-empty-interface` from TSLint) |  |  |
| [`typescript/no-explicit-any`](./docs/rules/no-explicit-any.md) | Disallow usage of the `any` type (`no-any` from TSLint) |  |  |
| [`typescript/no-inferrable-types`](./docs/rules/no-inferrable-types.md) | Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean. (`no-inferrable-types` from TSLint) |  | :wrench: |
| [`typescript/no-misused-new`](./docs/rules/no-misused-new.md) | Enforce valid definition of `new` and `constructor`. (`no-misused-new` from TSLint) |  |  |
| [`typescript/no-namespace`](./docs/rules/no-namespace.md) | Disallow the use of custom TypeScript modules and namespaces (`no-namespace` from TSLint) |  |  |
| [`typescript/no-non-null-assertion`](./docs/rules/no-non-null-assertion.md) | Disallows non-null assertions using the `!` postfix operator (`no-non-null-assertion` from TSLint) |  |  |
| [`typescript/no-object-literal-type-assertion`](./docs/rules/no-object-literal-type-assertion.md) | Forbids an object literal to appear in a type assertion expression (`no-object-literal-type-assertion` from TSLint) |  |  |
| [`typescript/no-parameter-properties`](./docs/rules/no-parameter-properties.md) | Disallow the use of parameter properties in class constructors. (`no-parameter-properties` from TSLint) |  |  |
| [`typescript/no-triple-slash-reference`](./docs/rules/no-triple-slash-reference.md) | Disallow `/// <reference path="" />` comments (`no-reference` from TSLint) |  |  |
| [`typescript/no-type-alias`](./docs/rules/no-type-alias.md) | Disallow the use of type aliases (`interface-over-type-literal` from TSLint) |  |  |
| [`typescript/no-unused-vars`](./docs/rules/no-unused-vars.md) | Prevent TypeScript-specific constructs from being erroneously flagged as unused | :heavy_check_mark: |  |
| [`typescript/no-use-before-define`](./docs/rules/no-use-before-define.md) | Disallow the use of variables before they are defined |  |  |
| [`typescript/no-var-requires`](./docs/rules/no-var-requires.md) | Disallows the use of require statements except in import statements (`no-var-requires` from TSLint) |  |  |
| [`typescript/prefer-interface`](./docs/rules/prefer-interface.md) | Prefer an interface declaration over a type literal (type T = { ... }) (`interface-over-type-literal` from TSLint) |  | :wrench: |
| [`typescript/prefer-namespace-keyword`](./docs/rules/prefer-namespace-keyword.md) | Require the use of the `namespace` keyword instead of the `module` keyword to declare custom TypeScript modules. (`no-internal-module` from TSLint) |  | :wrench: |
| [`typescript/type-annotation-spacing`](./docs/rules/type-annotation-spacing.md) | Require consistent spacing around type annotations (`typedef-whitespace` from TSLint) |  | :wrench: |
<!-- end rule list -->
