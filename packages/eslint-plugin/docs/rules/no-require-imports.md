---
description: 'Disallow invocation of `require()`.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-require-imports** for documentation.

Prefer the newer ES6-style imports over `require()`.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
const lib1 = require('lib1');
const { lib2 } = require('lib2');
import lib3 = require('lib3');
```

### ✅ Correct

```ts
import * as lib1 from 'lib1';
import { lib2 } from 'lib2';
import * as lib3 from 'lib3';
```

## Options

### `allowPackageJson`

When this is set to `true`, the rule will allow `require` imports that import `package.json` files. This is because `package.json` commonly lives outside of the TS root directory, so statically importing it would lead to root directory conflicts, especially with `resolveJsonModule` enabled.

With `{allowPackageJson: true}`:

<!--tabs-->

### ❌ Incorrect

```ts
console.log(require('../data.json').version);
```

### ✅ Correct

```ts
console.log(require('../package.json').version);
```

## When Not To Use It

If you don't care about using newer module syntax, then you will not need this rule.

## Related To

- [`no-var-requires`](./no-var-requires.md)
