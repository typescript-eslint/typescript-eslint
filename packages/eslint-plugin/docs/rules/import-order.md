# Enforce consistent import ordering (import-order)

## Rule Details

This rule enforces a consistent import ordering that matches the TypeScript command `Organise Imports`.

Examples of **incorrect** code for this rule with the default options:

<!-- prettier-ignore -->
```js
/*eslint @typescript-eslint/import-order: "error"*/

import { b, a } from 'foo'
```

<!-- prettier-ignore -->
```js
/*eslint @typescript-eslint/import-order: "error"*/

import a from 'b';
import b from 'a';
```

Examples of **correct** code for this rule with the default options:

<!-- prettier-ignore -->
```js
/*eslint @typescript-eslint/import-order: "error"*/

import a from 'a';
import { b, c } from 'bc';
import d from 'd';
```

<!-- prettier-ignore -->
```js
/*eslint @typescript-eslint/import-order: "error"*/

import b from 'a';
import a from 'b';
```

## When Not To Use It

If you don't use TypeScript's "Organize Imports" command you might prefer a different import ordering strategy.

## Compatibility

- TSLint: [ordered-imports](https://palantir.github.io/tslint/rules/ordered-imports/)
