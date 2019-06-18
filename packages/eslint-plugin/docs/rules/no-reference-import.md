# Disallow simultaneous use of `/// <reference type="" />` comments and ES6 style imports for the same module. (no-reference-import)

Use of triple-slash directives is discouraged in favor of the newer `import` style. In cases where both styles might occur, this rule prevents use of triple-slash references for modules which are otherwise imported.

Use `no-triple-slash-reference` instead if you intend to ban triple slash directives entirely.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
/// <reference types="foo" />
import * as foo from 'foo';
```

```ts
/// <reference types="foo" />
import foo = require('foo');
```

Examples of **correct** code for this rule:

```ts
import * as foo from 'foo';
```

```ts
import foo = require('foo');
```

## When To Use It

Any time you might use triple-slash directives and ES6 import declarations in the same file.

## When Not To Use It

If you intend to ban triple slash directives entirely.
