---
description: 'Disallow `require` statements except in import statements.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-var-requires** for documentation.

In other words, the use of forms such as `var foo = require("foo")` are banned. Instead use ES6 style imports or `import foo = require("foo")` imports.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
var foo = require('foo');
const foo = require('foo');
let foo = require('foo');
```

### ✅ Correct

```ts
import foo = require('foo');
require('foo');
import foo from 'foo';
```

## Options

### `allowPackageJson`

When this is set to `true`, the rule will allow `require` variables that import `package.json` files. This is because `package.json` commonly lives outside of the TS root directory, so statically importing it would lead to root directory conflicts, especially with `resolveJsonModule` enabled.

With `{allowPackageJson: true}`:

<!--tabs-->

### ❌ Incorrect

```ts
const foo = require('../data.json');
```

### ✅ Correct

```ts
const foo = require('../package.json');
```

## When Not To Use It

If you don't care about using newer module syntax, then you will not need this rule.

## Related To

- [`no-require-imports`](./no-require-imports.md)
