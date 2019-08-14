<h1 align="center">ESLint Plugin TypeScript</h1>

<p align="center">
    <a href="https://dev.azure.com/typescript-eslint/TypeScript%20ESLint/_build/latest?definitionId=1&branchName=master"><img src="https://img.shields.io/azure-devops/build/typescript-eslint/TypeScript%20ESLint/1/master.svg?label=%F0%9F%9A%80%20Azure%20Pipelines&style=flat-square" alt="Azure Pipelines"/></a>
    <a href="https://github.com/typescript-eslint/typescript-eslint/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/typescript-estree.svg?style=flat-square" alt="GitHub license" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/eslint-plugin"><img src="https://img.shields.io/npm/v/@typescript-eslint/eslint-plugin.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/eslint-plugin"><img src="https://img.shields.io/npm/dm/@typescript-eslint/eslint-plugin.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square" alt="Commitizen friendly" /></a>
</p>

## Installation

Make sure you have TypeScript and @typescript-eslint/parser installed, then install the plugin:

```sh
npm i @typescript-eslint/eslint-plugin --save-dev
```

It is important that you use the same version number for `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`.

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@typescript-eslint/eslint-plugin` globally.

## Usage

Add `@typescript-eslint/parser` to the `parser` field and `@typescript-eslint` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/rule-name": "error"
  }
}
```

You can also enable all the recommended rules for our plugin. Add `plugin:@typescript-eslint/recommended` in extends:

```json
{
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```

You can also use [eslint:recommended](https://eslint.org/docs/rules/) (the set of rules which are recommended for all projects by the ESLint Team) with this plugin. As noted in the root README, not all eslint core rules are compatible with TypeScript, so you need to add both `eslint:recommended` and `plugin:@typescript-eslint/eslint-recommended` (which will adjust the one from eslint appropriately for TypeScript) to your config:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ]
}
```

As of version 2 of this plugin, _by design_, none of the rules in the main `recommended` config require type-checking in order to run. This means that they are more lightweight and faster to run.

Some highly valuable rules simply require type-checking in order to be implemented correctly, however, so we provide an additional config you can extend from called `recommended-requiring-type-checking`. You wou apply this _in addition_ to the recommended configs previously mentioned, e.g.:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ]
}
```

Pro Tip: For larger codebases you may want to consider splitting our linting into two separate stages: 1. fast feedback rules which operate purely based on syntax (no type-checking), 2. rules which are based on semantics (type-checking).

NOTE: If you want to use rules which require type information, you will need to specify a path to your tsconfig.json file in the "project" property of "parserOptions". If you do not do this, you will get a runtime error which explains this.

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/restrict-plus-operands": "error"
  }
}
```

See [@typescript-eslint/parser's README.md](../parser/README.md) for more information on the available "parserOptions".

**Note: Make sure to use `eslint --ext .js,.ts` since by [default](https://eslint.org/docs/user-guide/command-line-interface#--ext) `eslint` will only search for .js files.**

## Usage with Prettier

Install [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) to disable our code formatting related rules:

```json
{
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint"
  ]
}
```

**Note: Make sure you have `eslint-config-prettier@4.0.0` or newer.**

## Usage with Airbnb

Airbnb has two configs, a base one [`eslint-config-airbnb-base`](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base) and one that includes rules for React [`eslint-config-airbnb`](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb).

First you'll need to install the config according to the instructions in one of the links above. `npx install-peerdeps --dev eslint-config-airbnb` or `npx install-peerdeps --dev eslint-config-airbnb-base` should work if you are using **npm 5+**.

Then you should add `airbnb` (or `airbnb-base`) to your `extends` section of `.eslintrc`. You might also want to turn on `plugin:@typescript-eslint/recommended` as well to enable all of the recommended rules.

```json
{
  "extends": ["airbnb-base", "plugin:@typescript-eslint/recommended"]
}
```

**Note: You can use Airbnb's rules alongside Prettier, see [Usage with Prettier](#usage-with-prettier)**

## Supported Rules

<!-- begin rule list -->

**Key**: :heavy_check_mark: = recommended, :wrench: = fixable, :thought_balloon: = requires type information

<!-- prettier-ignore -->
| Name                                                                                                      | Description                                                                                                                                         | :heavy_check_mark: | :wrench: | :thought_balloon: |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------- | ----------------- |
| [`@typescript-eslint/adjacent-overload-signatures`](./docs/rules/adjacent-overload-signatures.md)         | Require that member overloads be consecutive                                                                                                        | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/array-type`](./docs/rules/array-type.md)                                             | Requires using either `T[]` or `Array<T>` for arrays                                                                                                |                    | :wrench: |                   |
| [`@typescript-eslint/await-thenable`](./docs/rules/await-thenable.md)                                     | Disallows awaiting a value that is not a Thenable                                                                                                   | :heavy_check_mark: |          | :thought_balloon: |
| [`@typescript-eslint/ban-ts-ignore`](./docs/rules/ban-ts-ignore.md)                                       | Bans “// @ts-ignore” comments from being used                                                                                                       | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/ban-types`](./docs/rules/ban-types.md)                                               | Bans specific types from being used                                                                                                                 | :heavy_check_mark: | :wrench: |                   |
| [`@typescript-eslint/camelcase`](./docs/rules/camelcase.md)                                               | Enforce camelCase naming convention                                                                                                                 | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/class-name-casing`](./docs/rules/class-name-casing.md)                               | Require PascalCased class and interface names                                                                                                       | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/consistent-type-assertions`](./docs/rules/consistent-type-assertions.md)             | Enforces consistent usage of type assertions.                                                                                                       | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/consistent-type-definitions`](./docs/rules/consistent-type-definitions.md)           | Consistent with type definition either `interface` or `type`                                                                                        |                    | :wrench: |                   |
| [`@typescript-eslint/explicit-function-return-type`](./docs/rules/explicit-function-return-type.md)       | Require explicit return types on functions and class methods                                                                                        | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/explicit-member-accessibility`](./docs/rules/explicit-member-accessibility.md)       | Require explicit accessibility modifiers on class properties and methods                                                                            |                    |          |                   |
| [`@typescript-eslint/func-call-spacing`](./docs/rules/func-call-spacing.md)                               | Require or disallow spacing between function identifiers and their invocations                                                                      |                    | :wrench: |                   |
| [`@typescript-eslint/generic-type-naming`](./docs/rules/generic-type-naming.md)                           | Enforces naming of generic type variables                                                                                                           |                    |          |                   |
| [`@typescript-eslint/indent`](./docs/rules/indent.md)                                                     | Enforce consistent indentation                                                                                                                      |                    | :wrench: |                   |
| [`@typescript-eslint/interface-name-prefix`](./docs/rules/interface-name-prefix.md)                       | Require that interface names should or should not prefixed with `I`                                                                                 | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/member-delimiter-style`](./docs/rules/member-delimiter-style.md)                     | Require a specific member delimiter style for interfaces and type literals                                                                          | :heavy_check_mark: | :wrench: |                   |
| [`@typescript-eslint/member-naming`](./docs/rules/member-naming.md)                                       | Enforces naming conventions for class members by visibility                                                                                         |                    |          |                   |
| [`@typescript-eslint/member-ordering`](./docs/rules/member-ordering.md)                                   | Require a consistent member declaration order                                                                                                       |                    |          |                   |
| [`@typescript-eslint/no-array-constructor`](./docs/rules/no-array-constructor.md)                         | Disallow generic `Array` constructors                                                                                                               | :heavy_check_mark: | :wrench: |                   |
| [`@typescript-eslint/no-empty-function`](./docs/rules/no-empty-function.md)                               | Disallow empty functions                                                                                                                            | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/no-empty-interface`](./docs/rules/no-empty-interface.md)                             | Disallow the declaration of empty interfaces                                                                                                        | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/no-explicit-any`](./docs/rules/no-explicit-any.md)                                   | Disallow usage of the `any` type                                                                                                                    | :heavy_check_mark: | :wrench: |                   |
| [`@typescript-eslint/no-extra-parens`](./docs/rules/no-extra-parens.md)                                   | Disallow unnecessary parentheses                                                                                                                    |                    | :wrench: |                   |
| [`@typescript-eslint/no-extraneous-class`](./docs/rules/no-extraneous-class.md)                           | Forbids the use of classes as namespaces                                                                                                            |                    |          |                   |
| [`@typescript-eslint/no-floating-promises`](./docs/rules/no-floating-promises.md)                         | Requires Promise-like values to be handled appropriately.                                                                                           |                    |          | :thought_balloon: |
| [`@typescript-eslint/no-for-in-array`](./docs/rules/no-for-in-array.md)                                   | Disallow iterating over an array with a for-in loop                                                                                                 | :heavy_check_mark: |          | :thought_balloon: |
| [`@typescript-eslint/no-inferrable-types`](./docs/rules/no-inferrable-types.md)                           | Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean                                        | :heavy_check_mark: | :wrench: |                   |
| [`@typescript-eslint/no-magic-numbers`](./docs/rules/no-magic-numbers.md)                                 | Disallows magic numbers                                                                                                                             |                    |          |                   |
| [`@typescript-eslint/no-misused-new`](./docs/rules/no-misused-new.md)                                     | Enforce valid definition of `new` and `constructor`                                                                                                 | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/no-misused-promises`](./docs/rules/no-misused-promises.md)                           | Avoid using promises in places not designed to handle them                                                                                          | :heavy_check_mark: |          | :thought_balloon: |
| [`@typescript-eslint/no-namespace`](./docs/rules/no-namespace.md)                                         | Disallow the use of custom TypeScript modules and namespaces                                                                                        | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/no-non-null-assertion`](./docs/rules/no-non-null-assertion.md)                       | Disallows non-null assertions using the `!` postfix operator                                                                                        | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/no-parameter-properties`](./docs/rules/no-parameter-properties.md)                   | Disallow the use of parameter properties in class constructors                                                                                      |                    |          |                   |
| [`@typescript-eslint/no-require-imports`](./docs/rules/no-require-imports.md)                             | Disallows invocation of `require()`                                                                                                                 |                    |          |                   |
| [`@typescript-eslint/no-this-alias`](./docs/rules/no-this-alias.md)                                       | Disallow aliasing `this`                                                                                                                            | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/no-type-alias`](./docs/rules/no-type-alias.md)                                       | Disallow the use of type aliases                                                                                                                    |                    |          |                   |
| [`@typescript-eslint/no-unnecessary-qualifier`](./docs/rules/no-unnecessary-qualifier.md)                 | Warns when a namespace qualifier is unnecessary                                                                                                     |                    | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-unnecessary-type-arguments`](./docs/rules/no-unnecessary-type-arguments.md)       | Warns if an explicitly specified type argument is the default for that type parameter                                                               |                    | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-unnecessary-type-assertion`](./docs/rules/no-unnecessary-type-assertion.md)       | Warns if a type assertion does not change the type of an expression                                                                                 | :heavy_check_mark: | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-unused-vars`](./docs/rules/no-unused-vars.md)                                     | Disallow unused variables                                                                                                                           | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/no-use-before-define`](./docs/rules/no-use-before-define.md)                         | Disallow the use of variables before they are defined                                                                                               | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/no-useless-constructor`](./docs/rules/no-useless-constructor.md)                     | Disallow unnecessary constructors                                                                                                                   |                    |          |                   |
| [`@typescript-eslint/no-var-requires`](./docs/rules/no-var-requires.md)                                   | Disallows the use of require statements except in import statements                                                                                 | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/prefer-for-of`](./docs/rules/prefer-for-of.md)                                       | Prefer a ‘for-of’ loop over a standard ‘for’ loop if the index is only used to access the array being iterated                                      |                    |          |                   |
| [`@typescript-eslint/prefer-function-type`](./docs/rules/prefer-function-type.md)                         | Use function types instead of interfaces with call signatures                                                                                       |                    | :wrench: |                   |
| [`@typescript-eslint/prefer-includes`](./docs/rules/prefer-includes.md)                                   | Enforce `includes` method over `indexOf` method                                                                                                     | :heavy_check_mark: | :wrench: | :thought_balloon: |
| [`@typescript-eslint/prefer-namespace-keyword`](./docs/rules/prefer-namespace-keyword.md)                 | Require the use of the `namespace` keyword instead of the `module` keyword to declare custom TypeScript modules                                     | :heavy_check_mark: | :wrench: |                   |
| [`@typescript-eslint/prefer-readonly`](./docs/rules/prefer-readonly.md)                                   | Requires that private members are marked as `readonly` if they're never modified outside of the constructor                                         |                    | :wrench: | :thought_balloon: |
| [`@typescript-eslint/prefer-regexp-exec`](./docs/rules/prefer-regexp-exec.md)                             | Prefer RegExp#exec() over String#match() if no global flag is provided                                                                              | :heavy_check_mark: |          | :thought_balloon: |
| [`@typescript-eslint/prefer-string-starts-ends-with`](./docs/rules/prefer-string-starts-ends-with.md)     | Enforce the use of `String#startsWith` and `String#endsWith` instead of other equivalent methods of checking substrings                             | :heavy_check_mark: | :wrench: | :thought_balloon: |
| [`@typescript-eslint/promise-function-async`](./docs/rules/promise-function-async.md)                     | Requires any function or method that returns a Promise to be marked async                                                                           |                    |          | :thought_balloon: |
| [`@typescript-eslint/require-array-sort-compare`](./docs/rules/require-array-sort-compare.md)             | Enforce giving `compare` argument to `Array#sort`                                                                                                   |                    |          | :thought_balloon: |
| [`@typescript-eslint/require-await`](./docs/rules/require-await.md)                                       | Disallow async functions which have no `await` expression                                                                                           | :heavy_check_mark: |          | :thought_balloon: |
| [`@typescript-eslint/restrict-plus-operands`](./docs/rules/restrict-plus-operands.md)                     | When adding two variables, operands must both be of type number or of type string                                                                   |                    |          | :thought_balloon: |
| [`@typescript-eslint/semi`](./docs/rules/semi.md)                                                         | Require or disallow semicolons instead of ASI                                                                                                       |                    | :wrench: |                   |
| [`@typescript-eslint/strict-boolean-expressions`](./docs/rules/strict-boolean-expressions.md)             | Restricts the types allowed in boolean expressions                                                                                                  |                    |          | :thought_balloon: |
| [`@typescript-eslint/triple-slash-reference`](./docs/rules/triple-slash-reference.md)                     | Sets preference level for triple slash directives versus ES6-style import declarations                                                              | :heavy_check_mark: |          |                   |
| [`@typescript-eslint/type-annotation-spacing`](./docs/rules/type-annotation-spacing.md)                   | Require consistent spacing around type annotations                                                                                                  | :heavy_check_mark: | :wrench: |                   |
| [`@typescript-eslint/typedef`](./docs/rules/typedef.md)                                                   | Requires type annotations to exist                                                                                                                  |                    |          |                   |
| [`@typescript-eslint/unbound-method`](./docs/rules/unbound-method.md)                                     | Enforces unbound methods are called with their expected scope                                                                                       | :heavy_check_mark: |          | :thought_balloon: |
| [`@typescript-eslint/unified-signatures`](./docs/rules/unified-signatures.md)                             | Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter                                           |                    |          |                   |

<!-- end rule list -->
