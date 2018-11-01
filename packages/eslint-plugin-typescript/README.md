# eslint-plugin-typescript

TypeScript support for ESLint. (This is still in the very early stages, so please be patient.)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `typescript-eslint-parser`:

```
$ npm install typescript-eslint-parser --save-dev
```

Last, install `eslint-plugin-typescript`:

```
$ npm install eslint-plugin-typescript --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-typescript` globally.

## Usage

Add `typescript-eslint-parser` to the `parser` field and `typescript` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "parser": "typescript-eslint-parser",
    "plugins": [
        "typescript"
    ]
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

## Supported Rules

<!-- Please run `npm run docs` to update this section -->
<!-- begin rule list -->
* [`typescript/adjacent-overload-signatures`](./docs/rules/adjacent-overload-signatures.md) — Require that member overloads be consecutive
* [`typescript/class-name-casing`](./docs/rules/class-name-casing.md) — Require PascalCased class and interface names (`class-name` from TSLint)
* [`typescript/explicit-function-return-type`](./docs/rules/explicit-function-return-type.md) — Require explicit return types on functions and class methods
* [`typescript/explicit-member-accessibility`](./docs/rules/explicit-member-accessibility.md) — Require explicit accessibility modifiers on class properties and methods (`member-access` from TSLint)
* [`typescript/generic-type-naming`](./docs/rules/generic-type-naming.md) — Enforces naming of generic type variables
* [`typescript/interface-name-prefix`](./docs/rules/interface-name-prefix.md) — Require that interface names be prefixed with `I` (`interface-name` from TSLint)
* [`typescript/member-delimiter-style`](./docs/rules/member-delimiter-style.md) — Require a specific member delimiter style for interfaces and type literals
* [`typescript/member-naming`](./docs/rules/member-naming.md) — Enforces naming conventions for class members by visibility.
* [`typescript/member-ordering`](./docs/rules/member-ordering.md) — Require a consistent member declaration order (`member-ordering` from TSLint)
* [`typescript/no-angle-bracket-type-assertion`](./docs/rules/no-angle-bracket-type-assertion.md) — Enforces the use of `as Type` assertions instead of `<Type>` assertions (`no-angle-bracket-type-assertion` from TSLint)
* [`typescript/no-array-constructor`](./docs/rules/no-array-constructor.md) — Disallow generic `Array` constructors
* [`typescript/no-empty-interface`](./docs/rules/no-empty-interface.md) — Disallow the declaration of empty interfaces (`no-empty-interface` from TSLint)
* [`typescript/no-explicit-any`](./docs/rules/no-explicit-any.md) — Disallow usage of the `any` type (`no-any` from TSLint)
* [`typescript/no-inferrable-types`](./docs/rules/no-inferrable-types.md) — Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean. (`no-inferrable-types` from TSLint)
* [`typescript/no-namespace`](./docs/rules/no-namespace.md) — Disallow the use of custom TypeScript modules and namespaces
* [`typescript/no-non-null-assertion`](./docs/rules/no-non-null-assertion.md) — Disallows non-null assertions using the `!` postfix operator (`no-non-null-assertion` from TSLint)
* [`typescript/no-parameter-properties`](./docs/rules/no-parameter-properties.md) — Disallow the use of parameter properties in class constructors. (`no-parameter-properties` from TSLint)
* [`typescript/no-triple-slash-reference`](./docs/rules/no-triple-slash-reference.md) — Disallow `/// <reference path="" />` comments (`no-reference` from TSLint)
* [`typescript/no-type-alias`](./docs/rules/no-type-alias.md) — Disallow the use of type aliases (`interface-over-type-literal` from TSLint)
* [`typescript/no-unused-vars`](./docs/rules/no-unused-vars.md) — Prevent TypeScript-specific constructs from being erroneously flagged as unused
* [`typescript/no-use-before-define`](./docs/rules/no-use-before-define.md) — Disallow the use of variables before they are defined
* [`typescript/no-var-requires`](./docs/rules/no-var-requires.md) — Disallows the use of require statements except in import statements (`no-var-requires` from TSLint)
* [`typescript/prefer-namespace-keyword`](./docs/rules/prefer-namespace-keyword.md) — Require the use of the `namespace` keyword instead of the `module` keyword to declare custom TypeScript modules. (`no-internal-module` from TSLint)
* [`typescript/type-annotation-spacing`](./docs/rules/type-annotation-spacing.md) — Require consistent spacing around type annotations
<!-- end rule list -->
