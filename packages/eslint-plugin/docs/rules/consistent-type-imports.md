# Enforces consistent usage of type imports (`consistent-type-imports`)

## Rule Details

This rule aims to standardize the use of type imports style across the codebase.

```ts
import type { Foo } from './foo';
let foo: Foo;
```

```ts
import { Foo } from './foo';
let foo: Foo;
```

```ts
let foo: import('foo').Foo;
```

## Options

```ts
type Options =
  | 'type-imports'
  | 'no-type-imports'
  | {
      prefer: 'type-imports' | 'no-type-imports';
      disallowTypeAnnotations: boolean;
    };

const defaultOptions: Options = {
  prefer: 'type-imports',
  disallowTypeAnnotations: true,
};
```

### `prefer`

This option defines the expected import kind for type-only imports. Valid values for `prefer` are:

- `type-imports` will enforce that you always use `import type Foo from '...'`. It is default.
- `no-type-imports` will enforce that you always use `import Foo from '...'`.

### `disallowTypeAnnotations`

If `true`, type imports in type annotations (`import()`) is not allowed.
Default is `true`.

## When Not To Use It

If you specifically want to use both import kinds for stylistic reasons, you can disable this rule.
