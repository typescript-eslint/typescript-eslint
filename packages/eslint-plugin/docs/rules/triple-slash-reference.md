---
description: 'Disallow certain triple slash directives in favor of ES6-style import declarations.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/triple-slash-reference** for documentation.

TypeScript's `///` triple-slash references are a way to indicate that types from another module are available in a file.
Use of triple-slash reference type directives is generally discouraged in favor of ECMAScript Module `import`s.
This rule reports on the use of `/// <reference path="..." />`, `/// <reference types="..." />`, or `/// <reference lib="..." />` directives.

## Options

With `{ "path": "never", "types": "never", "lib": "never" }` options set, the following will all be **incorrect** usage:

```ts option='{ "path": "never", "types": "never", "lib": "never" }' showPlaygroundButton
/// <reference path="foo" />
/// <reference types="bar" />
/// <reference lib="baz" />
```

Examples of **incorrect** code for the `{ "types": "prefer-import" }` option. Note that these are only errors when **both** styles are used for the **same** module:

```ts option='{ "types": "prefer-import" }' showPlaygroundButton
/// <reference types="foo" />
import * as foo from 'foo';
```

```ts option='{ "types": "prefer-import" }' showPlaygroundButton
/// <reference types="foo" />
import foo = require('foo');
```

With `{ "path": "always", "types": "always", "lib": "always" }` options set, the following will all be **correct** usage:

```ts option='{ "path": "always", "types": "always", "lib": "always" }' showPlaygroundButton
/// <reference path="foo" />
/// <reference types="bar" />
/// <reference lib="baz" />
```

Examples of **correct** code for the `{ "types": "prefer-import" }` option:

```ts option='{ "types": "prefer-import" }' showPlaygroundButton
import * as foo from 'foo';
```

```ts option='{ "types": "prefer-import" }' showPlaygroundButton
import foo = require('foo');
```

## When Not To Use It

Most modern TypeScript projects generally use `import` statements to bring in types.
It's rare to need a `///` triple-slash reference outside of auto-generated code.
If your project is a rare one with one of those use cases, this rule might not be for you.
You might consider using [ESLint disable comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1) for those specific situations instead of completely disabling this rule.

## When Not To Use It

If you want to use all flavors of triple slash reference directives.
