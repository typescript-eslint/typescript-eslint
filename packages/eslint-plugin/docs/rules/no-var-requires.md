# Disallows the use of require statements except in import statements (`no-var-requires`)

In other words, the use of forms such as `var foo = require("foo")` are banned. Instead use ES6 style imports or `import foo = require("foo")` imports.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
var foo = require('foo');
const foo = require('foo');
let foo = require('foo');
```

Examples of **correct** code for this rule:

```ts
import foo = require('foo');
require('foo');
import foo from 'foo';
```

## Options

```ts
interface options {
  allowPackageDotJson?: boolean;
}
```

- `allowPackageDotJson` : allows to use require for `package.json` alone. default is `false`

configuration

```CJSON
{
    // Use type for object definitions
    "@typescript-eslint/no-var-requires": ["error", { allowPackageDotJson : true } ]
}
```

Examples of **incorrect** code for this rule:

```ts
var foo = require('foo');
const foo = require('package.jsons');
```

Examples of **correct** code for this rule:

```ts
import foo = require('package.json');
import foo = require('../package.json');
import foo = require('../packages/package.json');
```

## When Not To Use It

If you don't care about TypeScript module syntax, then you will not need this rule.

## Compatibility

- TSLint: [no-var-requires](https://palantir.github.io/tslint/rules/no-var-requires/)
