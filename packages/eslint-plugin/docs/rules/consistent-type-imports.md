---
description: 'Enforce consistent usage of type imports.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/consistent-type-imports** for documentation.

TypeScript allows specifying a `type` keyword on imports to indicate that the export exists only in the type system, not at runtime.
This allows transpilers to drop imports without knowing the types of the dependencies.

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
