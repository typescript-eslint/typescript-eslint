---
description: 'Enforce consistent usage of type imports.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/consistent-type-imports** for documentation.

Type-only imports allow you to specify that an import can only be used in a type location, allowing certain optimizations within compilers.

## Rule Details

This rule aims to standardize the use of type imports style.

## Options

### `prefer`

This option defines the expected import kind for type-only imports. Valid values for `prefer` are:

- `type-imports` will enforce that you always use `import type Foo from '...'` except referenced by metadata of decorators. It is default.
- `no-type-imports` will enforce that you always use `import Foo from '...'`.

Examples of **correct** code with `{prefer: 'type-imports'}`, and **incorrect** code with `{prefer: 'no-type-imports'}`.

```ts
import type { Foo } from 'Foo';
import type Bar from 'Bar';
type T = Foo;
const x: Bar = 1;
```

Examples of **incorrect** code with `{prefer: 'type-imports'}`, and **correct** code with `{prefer: 'no-type-imports'}`.

```ts
import { Foo } from 'Foo';
import Bar from 'Bar';
type T = Foo;
const x: Bar = 1;
```

### `disallowTypeAnnotations`

If `true`, type imports in type annotations (`import()`) are not allowed.
Default is `true`.

Examples of **incorrect** code with `{disallowTypeAnnotations: true}`:

```ts
type T = import('Foo').Foo;
const x: import('Bar') = 1;
```

## When Not To Use It

- If you specifically want to use both import kinds for stylistic reasons, you can disable this rule.
