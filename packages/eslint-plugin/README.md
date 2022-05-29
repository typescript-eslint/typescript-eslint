<h1 align="center">ESLint Plugin TypeScript</h1>

<p align="center">An ESLint plugin which provides lint rules for TypeScript codebases.</p>

<p align="center">
    <img src="https://github.com/typescript-eslint/typescript-eslint/workflows/CI/badge.svg" alt="CI" />
    <a href="https://www.npmjs.com/package/@typescript-eslint/eslint-plugin"><img src="https://img.shields.io/npm/v/@typescript-eslint/eslint-plugin.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@typescript-eslint/eslint-plugin"><img src="https://img.shields.io/npm/dm/@typescript-eslint/eslint-plugin.svg?style=flat-square" alt="NPM Downloads" /></a>
</p>

## Getting Started

- **[You can find our Getting Started docs here](https://typescript-eslint.io/docs/linting)**
- **[You can find our FAQ / Troubleshooting docs here](https://typescript-eslint.io/docs/linting/troubleshooting)**

These docs walk you through setting up ESLint, this plugin, and our parser. If you know what you're doing and just want to quick start, read on...

## Quick-start

### Installation

Make sure you have TypeScript and [`@typescript-eslint/parser`](../parser) installed:

```bash
$ yarn add -D typescript @typescript-eslint/parser
$ npm i --save-dev typescript @typescript-eslint/parser
```

Then install the plugin:

```bash
$ yarn add -D @typescript-eslint/eslint-plugin
$ npm i --save-dev @typescript-eslint/eslint-plugin
```

It is important that you use the same version number for `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`.

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@typescript-eslint/eslint-plugin` globally.

### Usage

Add `@typescript-eslint/parser` to the `parser` field and `@typescript-eslint` to the plugins section of your `.eslintrc` configuration file, then configure the rules you want to use under the rules section.

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

### Recommended Configs

You can also use [`eslint:recommended`](https://eslint.org/docs/rules/) (the set of rules which are recommended for all projects by the ESLint Team) with this plugin:

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"]
}
```

As of version 2 of this plugin, _by design_, none of the rules in the main `recommended` config require type-checking in order to run. This means that they are more lightweight and faster to run.

Some highly valuable rules require type-checking in order to be implemented correctly, however, so we provide an additional config you can extend from called `recommended-requiring-type-checking`. You would apply this _in addition_ to the recommended configs previously mentioned, e.g.:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ]
}
```

Pro Tip: For larger codebases you may want to consider splitting our linting into two separate stages: 1. fast feedback rules which operate purely based on syntax (no type-checking), 2. rules which are based on semantics (type-checking).

**[You can read more about linting with type information here](https://typescript-eslint.io/docs/linting/type-linting)**

## Supported Rules

<!-- begin base rule list -->

**Key**: :white_check_mark: = recommended, :lock: = strict, :wrench: = fixable, :thought_balloon: = requires type information

| Name                                                                                                                    | Description                                                                                                  | :white_check_mark::lock: | :wrench: | :thought_balloon: |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------ | -------- | ----------------- |
| [`@typescript-eslint/adjacent-overload-signatures`](./docs/rules/adjacent-overload-signatures.md)                       | Require that member overloads be consecutive                                                                 | :white_check_mark:       |          |                   |
| [`@typescript-eslint/array-type`](./docs/rules/array-type.md)                                                           | Require using either `T[]` or `Array<T>` for arrays                                                          | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/await-thenable`](./docs/rules/await-thenable.md)                                                   | Disallow awaiting a value that is not a Thenable                                                             | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/ban-ts-comment`](./docs/rules/ban-ts-comment.md)                                                   | Disallow `@ts-<directive>` comments or require descriptions after directive                                  | :white_check_mark:       |          |                   |
| [`@typescript-eslint/ban-tslint-comment`](./docs/rules/ban-tslint-comment.md)                                           | Disallow `// tslint:<rule-flag>` comments                                                                    | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/ban-types`](./docs/rules/ban-types.md)                                                             | Disallow certain types                                                                                       | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/class-literal-property-style`](./docs/rules/class-literal-property-style.md)                       | Enforce that literals on classes are exposed in a consistent style                                           | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/consistent-indexed-object-style`](./docs/rules/consistent-indexed-object-style.md)                 | Require or disallow the `Record` type                                                                        | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/consistent-type-assertions`](./docs/rules/consistent-type-assertions.md)                           | Enforce consistent usage of type assertions                                                                  | :lock:                   |          |                   |
| [`@typescript-eslint/consistent-type-definitions`](./docs/rules/consistent-type-definitions.md)                         | Enforce type definitions to consistently use either `interface` or `type`                                    | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/consistent-type-exports`](./docs/rules/consistent-type-exports.md)                                 | Enforce consistent usage of type exports                                                                     |                          | :wrench: | :thought_balloon: |
| [`@typescript-eslint/consistent-type-imports`](./docs/rules/consistent-type-imports.md)                                 | Enforce consistent usage of type imports                                                                     |                          | :wrench: |                   |
| [`@typescript-eslint/explicit-function-return-type`](./docs/rules/explicit-function-return-type.md)                     | Require explicit return types on functions and class methods                                                 |                          |          |                   |
| [`@typescript-eslint/explicit-member-accessibility`](./docs/rules/explicit-member-accessibility.md)                     | Require explicit accessibility modifiers on class properties and methods                                     |                          | :wrench: |                   |
| [`@typescript-eslint/explicit-module-boundary-types`](./docs/rules/explicit-module-boundary-types.md)                   | Require explicit return and argument types on exported functions' and classes' public class methods          |                          |          |                   |
| [`@typescript-eslint/member-delimiter-style`](./docs/rules/member-delimiter-style.md)                                   | Require a specific member delimiter style for interfaces and type literals                                   |                          | :wrench: |                   |
| [`@typescript-eslint/member-ordering`](./docs/rules/member-ordering.md)                                                 | Require a consistent member declaration order                                                                |                          |          |                   |
| [`@typescript-eslint/method-signature-style`](./docs/rules/method-signature-style.md)                                   | Enforce using a particular method signature syntax                                                           |                          | :wrench: |                   |
| [`@typescript-eslint/naming-convention`](./docs/rules/naming-convention.md)                                             | Enforce naming conventions for everything across a codebase                                                  |                          |          | :thought_balloon: |
| [`@typescript-eslint/no-base-to-string`](./docs/rules/no-base-to-string.md)                                             | Require `.toString()` to only be called on objects which provide useful information when stringified         | :lock:                   |          | :thought_balloon: |
| [`@typescript-eslint/no-confusing-non-null-assertion`](./docs/rules/no-confusing-non-null-assertion.md)                 | Disallow non-null assertion in locations that may be confusing                                               | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/no-confusing-void-expression`](./docs/rules/no-confusing-void-expression.md)                       | Require expressions of type void to appear in statement position                                             |                          | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-duplicate-enum-values`](./docs/rules/no-duplicate-enum-values.md)                               | Disallow duplicate enum member values                                                                        | :lock:                   |          |                   |
| [`@typescript-eslint/no-dynamic-delete`](./docs/rules/no-dynamic-delete.md)                                             | Disallow using the `delete` operator on computed key expressions                                             | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/no-empty-interface`](./docs/rules/no-empty-interface.md)                                           | Disallow the declaration of empty interfaces                                                                 | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/no-explicit-any`](./docs/rules/no-explicit-any.md)                                                 | Disallow the `any` type                                                                                      | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/no-extra-non-null-assertion`](./docs/rules/no-extra-non-null-assertion.md)                         | Disallow extra non-null assertion                                                                            | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/no-extraneous-class`](./docs/rules/no-extraneous-class.md)                                         | Disallow classes used as namespaces                                                                          | :lock:                   |          |                   |
| [`@typescript-eslint/no-floating-promises`](./docs/rules/no-floating-promises.md)                                       | Require Promise-like statements to be handled appropriately                                                  | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-for-in-array`](./docs/rules/no-for-in-array.md)                                                 | Disallow iterating over an array with a for-in loop                                                          | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-inferrable-types`](./docs/rules/no-inferrable-types.md)                                         | Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean  | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/no-invalid-void-type`](./docs/rules/no-invalid-void-type.md)                                       | Disallow `void` type outside of generic or return types                                                      | :lock:                   |          |                   |
| [`@typescript-eslint/no-meaningless-void-operator`](./docs/rules/no-meaningless-void-operator.md)                       | Disallow the `void` operator except when used to discard a value                                             | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-misused-new`](./docs/rules/no-misused-new.md)                                                   | Enforce valid definition of `new` and `constructor`                                                          | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-misused-promises`](./docs/rules/no-misused-promises.md)                                         | Disallow Promises in places not designed to handle them                                                      | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-namespace`](./docs/rules/no-namespace.md)                                                       | Disallow custom TypeScript modules and namespaces                                                            | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-non-null-asserted-nullish-coalescing`](./docs/rules/no-non-null-asserted-nullish-coalescing.md) | Disallow non-null assertions in the left operand of a nullish coalescing operator                            | :lock:                   |          |                   |
| [`@typescript-eslint/no-non-null-asserted-optional-chain`](./docs/rules/no-non-null-asserted-optional-chain.md)         | Disallow non-null assertions after an optional chain expression                                              | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-non-null-assertion`](./docs/rules/no-non-null-assertion.md)                                     | Disallow non-null assertions using the `!` postfix operator                                                  | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-redundant-type-constituents`](./docs/rules/no-redundant-type-constituents.md)                   | Disallow members of unions and intersections that do nothing or override type information                    |                          |          | :thought_balloon: |
| [`@typescript-eslint/no-require-imports`](./docs/rules/no-require-imports.md)                                           | Disallow invocation of `require()`                                                                           |                          |          |                   |
| [`@typescript-eslint/no-this-alias`](./docs/rules/no-this-alias.md)                                                     | Disallow aliasing `this`                                                                                     | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-type-alias`](./docs/rules/no-type-alias.md)                                                     | Disallow type aliases                                                                                        |                          |          |                   |
| [`@typescript-eslint/no-unnecessary-boolean-literal-compare`](./docs/rules/no-unnecessary-boolean-literal-compare.md)   | Disallow unnecessary equality comparisons against boolean literals                                           | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-unnecessary-condition`](./docs/rules/no-unnecessary-condition.md)                               | Disallow conditionals where the type is always truthy or always falsy                                        | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-unnecessary-qualifier`](./docs/rules/no-unnecessary-qualifier.md)                               | Disallow unnecessary namespace qualifiers                                                                    |                          | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-unnecessary-type-arguments`](./docs/rules/no-unnecessary-type-arguments.md)                     | Disallow type arguments that are equal to the default                                                        | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-unnecessary-type-assertion`](./docs/rules/no-unnecessary-type-assertion.md)                     | Disallow type assertions that do not change the type of an expression                                        | :white_check_mark:       | :wrench: | :thought_balloon: |
| [`@typescript-eslint/no-unnecessary-type-constraint`](./docs/rules/no-unnecessary-type-constraint.md)                   | Disallow unnecessary constraints on generic types                                                            | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-unsafe-argument`](./docs/rules/no-unsafe-argument.md)                                           | Disallow calling a function with a value with type `any`                                                     | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-unsafe-assignment`](./docs/rules/no-unsafe-assignment.md)                                       | Disallow assigning a value with type `any` to variables and properties                                       | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-unsafe-call`](./docs/rules/no-unsafe-call.md)                                                   | Disallow calling a value with type `any`                                                                     | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-unsafe-member-access`](./docs/rules/no-unsafe-member-access.md)                                 | Disallow member access on a value with type `any`                                                            | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-unsafe-return`](./docs/rules/no-unsafe-return.md)                                               | Disallow returning a value with type `any` from a function                                                   | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-useless-empty-export`](./docs/rules/no-useless-empty-export.md)                                 | Disallow empty exports that don't change anything in a module file                                           |                          | :wrench: |                   |
| [`@typescript-eslint/no-var-requires`](./docs/rules/no-var-requires.md)                                                 | Disallow `require` statements except in import statements                                                    | :white_check_mark:       |          |                   |
| [`@typescript-eslint/non-nullable-type-assertion-style`](./docs/rules/non-nullable-type-assertion-style.md)             | Enforce non-null assertions over explicit type casts                                                         | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/parameter-properties`](./docs/rules/parameter-properties.md)                                       | Require or disallow parameter properties in class constructors                                               |                          |          |                   |
| [`@typescript-eslint/prefer-as-const`](./docs/rules/prefer-as-const.md)                                                 | Enforce the use of `as const` over literal type                                                              | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/prefer-enum-initializers`](./docs/rules/prefer-enum-initializers.md)                               | Require each enum member value to be explicitly initialized                                                  |                          |          |                   |
| [`@typescript-eslint/prefer-for-of`](./docs/rules/prefer-for-of.md)                                                     | Enforce the use of `for-of` loop over the standard `for` loop where possible                                 | :lock:                   |          |                   |
| [`@typescript-eslint/prefer-function-type`](./docs/rules/prefer-function-type.md)                                       | Enforce using function types instead of interfaces with call signatures                                      | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/prefer-includes`](./docs/rules/prefer-includes.md)                                                 | Enforce `includes` method over `indexOf` method                                                              | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/prefer-literal-enum-member`](./docs/rules/prefer-literal-enum-member.md)                           | Require all enum members to be literal values                                                                | :lock:                   |          |                   |
| [`@typescript-eslint/prefer-namespace-keyword`](./docs/rules/prefer-namespace-keyword.md)                               | Require using `namespace` keyword over `module` keyword to declare custom TypeScript modules                 | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/prefer-nullish-coalescing`](./docs/rules/prefer-nullish-coalescing.md)                             | Enforce using the nullish coalescing operator instead of logical chaining                                    | :lock:                   |          | :thought_balloon: |
| [`@typescript-eslint/prefer-optional-chain`](./docs/rules/prefer-optional-chain.md)                                     | Enforce using concise optional chain expressions instead of chained logical ands                             | :lock:                   |          |                   |
| [`@typescript-eslint/prefer-readonly`](./docs/rules/prefer-readonly.md)                                                 | Require private members to be marked as `readonly` if they're never modified outside of the constructor      |                          | :wrench: | :thought_balloon: |
| [`@typescript-eslint/prefer-readonly-parameter-types`](./docs/rules/prefer-readonly-parameter-types.md)                 | Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs               |                          |          | :thought_balloon: |
| [`@typescript-eslint/prefer-reduce-type-parameter`](./docs/rules/prefer-reduce-type-parameter.md)                       | Enforce using type parameter when calling `Array#reduce` instead of casting                                  | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/prefer-regexp-exec`](./docs/rules/prefer-regexp-exec.md)                                           | Enforce `RegExp#exec` over `String#match` if no global flag is provided                                      |                          | :wrench: | :thought_balloon: |
| [`@typescript-eslint/prefer-return-this-type`](./docs/rules/prefer-return-this-type.md)                                 | Enforce that `this` is used when only `this` type is returned                                                | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/prefer-string-starts-ends-with`](./docs/rules/prefer-string-starts-ends-with.md)                   | Enforce using `String#startsWith` and `String#endsWith` over other equivalent methods of checking substrings | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/prefer-ts-expect-error`](./docs/rules/prefer-ts-expect-error.md)                                   | Enforce using `@ts-expect-error` over `@ts-ignore`                                                           | :lock:                   | :wrench: |                   |
| [`@typescript-eslint/promise-function-async`](./docs/rules/promise-function-async.md)                                   | Require any function or method that returns a Promise to be marked async                                     |                          | :wrench: | :thought_balloon: |
| [`@typescript-eslint/require-array-sort-compare`](./docs/rules/require-array-sort-compare.md)                           | Require `Array#sort` calls to always provide a `compareFunction`                                             |                          |          | :thought_balloon: |
| [`@typescript-eslint/restrict-plus-operands`](./docs/rules/restrict-plus-operands.md)                                   | Require both operands of addition to have type `number` or `string`                                          | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/restrict-template-expressions`](./docs/rules/restrict-template-expressions.md)                     | Enforce template literal expressions to be of `string` type                                                  | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/sort-type-union-intersection-members`](./docs/rules/sort-type-union-intersection-members.md)       | Enforce members of a type union/intersection to be sorted alphabetically                                     |                          | :wrench: |                   |
| [`@typescript-eslint/strict-boolean-expressions`](./docs/rules/strict-boolean-expressions.md)                           | Disallow certain types in boolean expressions                                                                |                          | :wrench: | :thought_balloon: |
| [`@typescript-eslint/switch-exhaustiveness-check`](./docs/rules/switch-exhaustiveness-check.md)                         | Require switch-case statements to be exhaustive with union type                                              |                          |          | :thought_balloon: |
| [`@typescript-eslint/triple-slash-reference`](./docs/rules/triple-slash-reference.md)                                   | Disallow certain triple slash directives in favor of ES6-style import declarations                           | :white_check_mark:       |          |                   |
| [`@typescript-eslint/type-annotation-spacing`](./docs/rules/type-annotation-spacing.md)                                 | Require consistent spacing around type annotations                                                           |                          | :wrench: |                   |
| [`@typescript-eslint/typedef`](./docs/rules/typedef.md)                                                                 | Require type annotations in certain places                                                                   |                          |          |                   |
| [`@typescript-eslint/unbound-method`](./docs/rules/unbound-method.md)                                                   | Enforce unbound methods are called with their expected scope                                                 | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/unified-signatures`](./docs/rules/unified-signatures.md)                                           | Disallow two overloads that could be unified into one with a union or an optional/rest parameter             | :lock:                   |          |                   |

<!-- end base rule list -->

### Extension Rules

In some cases, ESLint provides a rule itself, but it doesn't support TypeScript syntax; either it crashes, or it ignores the syntax, or it falsely reports against it.
In these cases, we create what we call an extension rule; a rule within our plugin that has the same functionality, but also supports TypeScript.

<!-- begin extension rule list -->

**Key**: :white_check_mark: = recommended, :lock: = strict, :wrench: = fixable, :thought_balloon: = requires type information

| Name                                                                                                    | Description                                                                          | :white_check_mark::lock: | :wrench: | :thought_balloon: |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------ | -------- | ----------------- |
| [`@typescript-eslint/brace-style`](./docs/rules/brace-style.md)                                         | Enforce consistent brace style for blocks                                            |                          | :wrench: |                   |
| [`@typescript-eslint/comma-dangle`](./docs/rules/comma-dangle.md)                                       | Require or disallow trailing commas                                                  |                          | :wrench: |                   |
| [`@typescript-eslint/comma-spacing`](./docs/rules/comma-spacing.md)                                     | Enforce consistent spacing before and after commas                                   |                          | :wrench: |                   |
| [`@typescript-eslint/default-param-last`](./docs/rules/default-param-last.md)                           | Enforce default parameters to be last                                                |                          |          |                   |
| [`@typescript-eslint/dot-notation`](./docs/rules/dot-notation.md)                                       | Enforce dot notation whenever possible                                               | :lock:                   | :wrench: | :thought_balloon: |
| [`@typescript-eslint/func-call-spacing`](./docs/rules/func-call-spacing.md)                             | Require or disallow spacing between function identifiers and their invocations       |                          | :wrench: |                   |
| [`@typescript-eslint/indent`](./docs/rules/indent.md)                                                   | Enforce consistent indentation                                                       |                          | :wrench: |                   |
| [`@typescript-eslint/init-declarations`](./docs/rules/init-declarations.md)                             | Require or disallow initialization in variable declarations                          |                          |          |                   |
| [`@typescript-eslint/keyword-spacing`](./docs/rules/keyword-spacing.md)                                 | Enforce consistent spacing before and after keywords                                 |                          | :wrench: |                   |
| [`@typescript-eslint/lines-between-class-members`](./docs/rules/lines-between-class-members.md)         | Require or disallow an empty line between class members                              |                          | :wrench: |                   |
| [`@typescript-eslint/no-array-constructor`](./docs/rules/no-array-constructor.md)                       | Disallow generic `Array` constructors                                                | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/no-dupe-class-members`](./docs/rules/no-dupe-class-members.md)                     | Disallow duplicate class members                                                     |                          |          |                   |
| [`@typescript-eslint/no-empty-function`](./docs/rules/no-empty-function.md)                             | Disallow empty functions                                                             | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-extra-parens`](./docs/rules/no-extra-parens.md)                                 | Disallow unnecessary parentheses                                                     |                          | :wrench: |                   |
| [`@typescript-eslint/no-extra-semi`](./docs/rules/no-extra-semi.md)                                     | Disallow unnecessary semicolons                                                      | :white_check_mark:       | :wrench: |                   |
| [`@typescript-eslint/no-implied-eval`](./docs/rules/no-implied-eval.md)                                 | Disallow the use of `eval()`-like methods                                            | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/no-invalid-this`](./docs/rules/no-invalid-this.md)                                 | Disallow `this` keywords outside of classes or class-like objects                    |                          |          |                   |
| [`@typescript-eslint/no-loop-func`](./docs/rules/no-loop-func.md)                                       | Disallow function declarations that contain unsafe references inside loop statements |                          |          |                   |
| [`@typescript-eslint/no-loss-of-precision`](./docs/rules/no-loss-of-precision.md)                       | Disallow literal numbers that lose precision                                         | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-magic-numbers`](./docs/rules/no-magic-numbers.md)                               | Disallow magic numbers                                                               |                          |          |                   |
| [`@typescript-eslint/no-redeclare`](./docs/rules/no-redeclare.md)                                       | Disallow variable redeclaration                                                      |                          |          |                   |
| [`@typescript-eslint/no-restricted-imports`](./docs/rules/no-restricted-imports.md)                     | Disallow specified modules when loaded by `import`                                   |                          |          |                   |
| [`@typescript-eslint/no-shadow`](./docs/rules/no-shadow.md)                                             | Disallow variable declarations from shadowing variables declared in the outer scope  |                          |          |                   |
| [`@typescript-eslint/no-throw-literal`](./docs/rules/no-throw-literal.md)                               | Disallow throwing literals as exceptions                                             | :lock:                   |          | :thought_balloon: |
| [`@typescript-eslint/no-unused-expressions`](./docs/rules/no-unused-expressions.md)                     | Disallow unused expressions                                                          |                          |          |                   |
| [`@typescript-eslint/no-unused-vars`](./docs/rules/no-unused-vars.md)                                   | Disallow unused variables                                                            | :white_check_mark:       |          |                   |
| [`@typescript-eslint/no-use-before-define`](./docs/rules/no-use-before-define.md)                       | Disallow the use of variables before they are defined                                |                          |          |                   |
| [`@typescript-eslint/no-useless-constructor`](./docs/rules/no-useless-constructor.md)                   | Disallow unnecessary constructors                                                    | :lock:                   |          |                   |
| [`@typescript-eslint/object-curly-spacing`](./docs/rules/object-curly-spacing.md)                       | Enforce consistent spacing inside braces                                             |                          | :wrench: |                   |
| [`@typescript-eslint/padding-line-between-statements`](./docs/rules/padding-line-between-statements.md) | Require or disallow padding lines between statements                                 |                          | :wrench: |                   |
| [`@typescript-eslint/quotes`](./docs/rules/quotes.md)                                                   | Enforce the consistent use of either backticks, double, or single quotes             |                          | :wrench: |                   |
| [`@typescript-eslint/require-await`](./docs/rules/require-await.md)                                     | Disallow async functions which have no `await` expression                            | :white_check_mark:       |          | :thought_balloon: |
| [`@typescript-eslint/return-await`](./docs/rules/return-await.md)                                       | Enforce consistent returning of awaited values                                       |                          | :wrench: | :thought_balloon: |
| [`@typescript-eslint/semi`](./docs/rules/semi.md)                                                       | Require or disallow semicolons instead of ASI                                        |                          | :wrench: |                   |
| [`@typescript-eslint/space-before-blocks`](./docs/rules/space-before-blocks.md)                         | Enforce consistent spacing before blocks                                             |                          | :wrench: |                   |
| [`@typescript-eslint/space-before-function-paren`](./docs/rules/space-before-function-paren.md)         | Enforce consistent spacing before function parenthesis                               |                          | :wrench: |                   |
| [`@typescript-eslint/space-infix-ops`](./docs/rules/space-infix-ops.md)                                 | Require spacing around infix operators                                               |                          | :wrench: |                   |

<!-- end extension rule list -->

## Contributing

[See the contributing guide here](../../CONTRIBUTING.md).
