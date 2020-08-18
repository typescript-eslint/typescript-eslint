# Enforce or disallow the use of the record type (`prefer-record`)

TypeScript supports defining object show keys can be flexible using an index signature. TypeScript also has a builtin type named `Record` to create an empty object defining only an index signature. For example, the following types are equal:

```ts
interface Foo {
  [key: string]: unknown;
}

type Foo = {
  [key: string]: unknown;
};

type Foo = Record<string, unknown>;
```

## Options

- `"record"`: Set to `"always"` to only allow the `Record` type. Set to `"never"` to only allow index signatures. (Defaults to `"always"`)

For example:

```CJSON
{
    "@typescript-eslint/consistent-type-definitions": ["error", "never"]
}
```

## Rule details

This rule enforces a consistent way to define records.

Examples of **incorrect** code with `always` option.

```ts
interface Foo {
  [key: string]: unknown;
}

type Foo = {
  [key: string]: unknown;
};
```

Examples of **correct** code with `always` option.

```ts
type Foo = Record<string, unknown>;
```

Examples of **incorrect** code with `never` option.

```ts
type Foo = Record<string, unknown>;
```

Examples of **correct** code with `never` option.

```ts
interface Foo {
  [key: string]: unknown;
}

type Foo = {
  [key: string]: unknown;
};
```
