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

* [`typescript/type-annotation-spacing`](./docs/rules/type-annotation-spacing.md) — enforces one space after the colon and zero spaces before the colon of a type annotation.
* [`typescript/explicit-member-accessibility`](./docs/rules/explicit-member-accessibility.md) — enforces accessibility modifiers on class properties and methods. (`member-access` from TSLint)
* [`typescript/interface-name-prefix`](./docs/rules/interface-name-prefix.md) — enforces interface names are prefixed. (`interface-name` from TSLint)
* [`typescript/no-triple-slash-reference`](./docs/rules/no-triple-slash-reference.md) — enforces `/// <reference />` is not used. (`no-reference` from TSLint)
* [`typescript/no-explicit-any`](./docs/rules/no-explicit-any.md) — enforces the `any` type is not used. (`no-any` from TSLint)
* [`typescript/no-angle-bracket-type-assertion`](./docs/rules/no-angle-bracket-type-assertion.md) — enforces the use of `as Type` assertions instead of `<Type>` assertions. (`no-angle-bracket-type-assertion` from TSLint)
* [`typescript/no-namespace`](./docs/rules/no-namespace.md) — disallows the use of custom TypeScript modules and namespaces.
* [`typescript/no-use-before-define`](./docs/rules/no-use-before-define.md) — disallows the use of variables before they are defined.
* [`typescript/prefer-namespace-keyword`](./docs/rules/prefer-namespace-keyword.md) — enforces the use of the keyword `namespace` over `module` to declare custom TypeScript modules. (`no-internal-module` from TSLint)
* [`typescript/no-type-alias`](./docs/rules/no-type-alias.md) — disallows the use of type aliases. (`interface-over-type-literal` from TSLint)
* [`typescript/member-ordering`](./docs/rules/member-ordering.md) — enforces a standard member declaration order. (`member-ordering` from TSLint)
* [`typescript/no-unused-vars`](./docs/rules/no-unused-vars.md) — prevents TypeScript-specific constructs from being erroneously flagged as unused
* [`typescript/adjacent-overload-signatures`](./docs/rules/adjacent-overload-signatures.md) — enforces member overloads to be consecutive.
* [`typescript/no-parameter-properties`](./docs/rules/no-parameter-properties.md) - disallows parameter properties in class constructors. (`no-parameter-properties` from TSLint)
* [`typescript/class-name-casing`](./docs/rules/adjacent-overload-signatures.md) - enforces PascalCased class and interface names. (`class-name` from TSLint)
* [`typescript/member-delimiter-style`](./docs/rules/member-delimiter-style.md) - enforces a member delimiter style in interfaces and type literals.
* [`typescript/no-empty-interface`](./docs/rules/no-empty-interface.md) - disallows the declaration of empty interfaces. (`no-empty-interface` from TSLint)
