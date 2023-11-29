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

## When Not To Use It

If your project frequently uses older CommonJS `require`s, then this rule might not be applicable to you.
If only a subset of your project uses `require`s then you might consider using [ESLint disable comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1) for those specific situations instead of completely disabling this rule.

## Related To

- [`no-require-imports`](./no-require-imports.md)
