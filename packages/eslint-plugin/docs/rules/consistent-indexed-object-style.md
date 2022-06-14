# `consistent-indexed-object-style`

Requires or disallows the `Record` type.

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

- `"record"`: Set to `"record"` to only allow the `Record` type. Set to `"index-signature"` to only allow index signatures. (Defaults to `"record"`)

For example:

```json
{
  "@typescript-eslint/consistent-indexed-object-style": [
    "error",
    "index-signature"
  ]
}
```

## Rule Details

This rule enforces a consistent way to define records.

### `record`

Examples of code with `record` option.

<!--tabs-->

#### ❌ Incorrect

```ts
interface Foo {
  [key: string]: unknown;
}

type Foo = {
  [key: string]: unknown;
};
```

#### ✅ Correct

```ts
type Foo = Record<string, unknown>;
```

### `index-signature`

Examples of code with `index-signature` option.

<!--tabs-->

#### ❌ Incorrect

```ts
type Foo = Record<string, unknown>;
```

#### ✅ Correct

```ts
interface Foo {
  [key: string]: unknown;
}

type Foo = {
  [key: string]: unknown;
};
```
