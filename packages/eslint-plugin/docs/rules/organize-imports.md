# Enforce consistent import ordering (organize-imports)

## Rule Details

This rule enforces a consistent import ordering that matches the TypeScript command `Organize Imports`.

Examples of **incorrect** code for this rule with the default options:

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import { b, a } from 'foo';
```

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import a from 'b';
import b from 'a';
```

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import a from 'a';
import d from 'd';
import { b, c } from 'bc';
```

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import a from '../a';
import b from 'b';
import c from './c';
```

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import { a, b } from '../../ab';
import c from './c';
import { d, e } from '../de';
```

Examples of **correct** code for this rule with the default options:

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import { a, b } from 'foo';
```

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import b from 'a';
import a from 'b';
```

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import a from 'a';
import { b, c } from 'bc';
import d from 'd';
```

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import b from 'b';
import a from '../a';
import c from './c';
```

```js
/* eslint @typescript-eslint/organize-imports: "error" */

import { a, b } from '../../ab';
import { d, e } from '../de';
import c from './c';
```

## When Not To Use It

If you don't use TypeScript's "Organize Imports" command you might prefer a different import ordering strategy.

## Compatibility

- TSLint: [ordered-imports](https://palantir.github.io/tslint/rules/ordered-imports/)
