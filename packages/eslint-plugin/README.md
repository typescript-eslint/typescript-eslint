# @typescript-eslint/eslint-plugin

[![NPM version](https://img.shields.io/npm/v/@typescript-eslint/eslint-plugin.svg)](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin)
[![NPM downloads](https://img.shields.io/npm/dm/@typescript-eslint/eslint-plugin.svg)](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin)
[![TravisCI](https://img.shields.io/travis/@typescript-eslint/eslint-plugin.svg)](https://travis-ci.com/@typescript-eslint/eslint-plugin)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```shellsession
$ npm i eslint --save-dev
```

Next, install `typescript` if you haven’t already:

```shellsession
$ npm i typescript@~3.1.1 --save-dev
```

Last, install `@typescript-eslint/eslint-plugin`:

```shellsession
$ npm install @typescript-eslint/eslint-plugin --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@typescript-eslint/eslint-plugin` globally.

## Usage

Add `@typescript-eslint/eslint-plugin/parser` to the `parser` field and `typescript` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "parser": "@typescript-eslint/eslint-plugin/parser",
  "plugins": ["typescript"]
}
```

Note: The plugin provides its own version of the `@typescript-eslint/eslint-plugin/parser` via `@typescript-eslint/eslint-plugin/parser`.
This helps us guarantee 100% compatibility between the plugin and the parser.

Then configure the rules you want to use under the rules section.

```json
{
  "parser": "@typescript-eslint/eslint-plugin/parser",
  "plugins": ["typescript"],
  "rules": {
    "typescript/rule-name": "error"
  }
}
```

You can also enable all the recommended rules at once. Add `plugin:typescript/recommended` in extends:

```json
{
  "extends": ["plugin:typescript/recommended"]
}
```

## Supported Rules

<!-- Please run `npm run docs` to update this section -->
<!-- begin rule list -->

**Key**: :heavy_check_mark: = recommended, :wrench: = fixable

<!-- prettier-ignore -->
| Name | Description | :heavy_check_mark: | :wrench: |
| ---- | ----------- | ------------------ | -------- |
| [`@typescript-eslint/adjacent-overload-signatures`](./docs/rules/adjacent-overload-signatures.md) | Require that member overloads be consecutive (`adjacent-overload-signatures` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/array-type`](./docs/rules/array-type.md) | Requires using either `T[]` or `Array<T>` for arrays (`array-type` from TSLint) | :heavy_check_mark: | :wrench: |
| [`@typescript-eslint/ban-types`](./docs/rules/ban-types.md) | Enforces that types will not to be used (`ban-types` from TSLint) | :heavy_check_mark: | :wrench: |
| [`@typescript-eslint/camelcase`](./docs/rules/camelcase.md) | Enforce camelCase naming convention | :heavy_check_mark: |  |
| [`@typescript-eslint/class-name-casing`](./docs/rules/class-name-casing.md) | Require PascalCased class and interface names (`class-name` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/explicit-function-return-type`](./docs/rules/explicit-function-return-type.md) | Require explicit return types on functions and class methods | :heavy_check_mark: |  |
| [`@typescript-eslint/explicit-member-accessibility`](./docs/rules/explicit-member-accessibility.md) | Require explicit accessibility modifiers on class properties and methods (`member-access` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/generic-type-naming`](./docs/rules/generic-type-naming.md) | Enforces naming of generic type variables |  |  |
| [`@typescript-eslint/indent`](./docs/rules/indent.md) | Enforce consistent indentation (`indent` from TSLint) | :heavy_check_mark: | :wrench: |
| [`@typescript-eslint/interface-name-prefix`](./docs/rules/interface-name-prefix.md) | Require that interface names be prefixed with `I` (`interface-name` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/member-delimiter-style`](./docs/rules/member-delimiter-style.md) | Require a specific member delimiter style for interfaces and type literals | :heavy_check_mark: | :wrench: |
| [`@typescript-eslint/member-naming`](./docs/rules/member-naming.md) | Enforces naming conventions for class members by visibility. |  |  |
| [`@typescript-eslint/member-ordering`](./docs/rules/member-ordering.md) | Require a consistent member declaration order (`member-ordering` from TSLint) |  |  |
| [`@typescript-eslint/no-angle-bracket-type-assertion`](./docs/rules/no-angle-bracket-type-assertion.md) | Enforces the use of `as Type` assertions instead of `<Type>` assertions (`no-angle-bracket-type-assertion` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-array-constructor`](./docs/rules/no-array-constructor.md) | Disallow generic `Array` constructors | :heavy_check_mark: | :wrench: |
| [`@typescript-eslint/no-empty-interface`](./docs/rules/no-empty-interface.md) | Disallow the declaration of empty interfaces (`no-empty-interface` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-explicit-any`](./docs/rules/no-explicit-any.md) | Disallow usage of the `any` type (`no-any` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-extraneous-class`](./docs/rules/no-extraneous-class.md) | Forbids the use of classes as namespaces (`no-unnecessary-class` from TSLint) |  |  |
| [`@typescript-eslint/no-inferrable-types`](./docs/rules/no-inferrable-types.md) | Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean. (`no-inferrable-types` from TSLint) | :heavy_check_mark: | :wrench: |
| [`@typescript-eslint/no-misused-new`](./docs/rules/no-misused-new.md) | Enforce valid definition of `new` and `constructor`. (`no-misused-new` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-namespace`](./docs/rules/no-namespace.md) | Disallow the use of custom TypeScript modules and namespaces (`no-namespace` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-non-null-assertion`](./docs/rules/no-non-null-assertion.md) | Disallows non-null assertions using the `!` postfix operator (`no-non-null-assertion` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-object-literal-type-assertion`](./docs/rules/no-object-literal-type-assertion.md) | Forbids an object literal to appear in a type assertion expression (`no-object-literal-type-assertion` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-parameter-properties`](./docs/rules/no-parameter-properties.md) | Disallow the use of parameter properties in class constructors. (`no-parameter-properties` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-this-alias`](./docs/rules/no-this-alias.md) | Disallow aliasing `this` (`no-this-assignment` from TSLint) |  |  |
| [`@typescript-eslint/no-triple-slash-reference`](./docs/rules/no-triple-slash-reference.md) | Disallow `/// <reference path="" />` comments (`no-reference` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-type-alias`](./docs/rules/no-type-alias.md) | Disallow the use of type aliases (`interface-over-type-literal` from TSLint) |  |  |
| [`@typescript-eslint/no-unused-vars`](./docs/rules/no-unused-vars.md) | Disallow unused variables (`no-unused-variable` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/no-use-before-define`](./docs/rules/no-use-before-define.md) | Disallow the use of variables before they are defined | :heavy_check_mark: |  |
| [`@typescript-eslint/no-var-requires`](./docs/rules/no-var-requires.md) | Disallows the use of require statements except in import statements (`no-var-requires` from TSLint) | :heavy_check_mark: |  |
| [`@typescript-eslint/prefer-interface`](./docs/rules/prefer-interface.md) | Prefer an interface declaration over a type literal (type T = { ... }) (`interface-over-type-literal` from TSLint) | :heavy_check_mark: | :wrench: |
| [`@typescript-eslint/prefer-namespace-keyword`](./docs/rules/prefer-namespace-keyword.md) | Require the use of the `namespace` keyword instead of the `module` keyword to declare custom TypeScript modules. (`no-internal-module` from TSLint) | :heavy_check_mark: | :wrench: |
| [`@typescript-eslint/restrict-plus-operands`](./docs/rules/restrict-plus-operands.md) | When adding two variables, operands must both be of type number or of type string. (`restrict-plus-operands` from TSLint) |  |  |
| [`@typescript-eslint/type-annotation-spacing`](./docs/rules/type-annotation-spacing.md) | Require consistent spacing around type annotations (`typedef-whitespace` from TSLint) | :heavy_check_mark: | :wrench: |

<!-- end rule list -->
