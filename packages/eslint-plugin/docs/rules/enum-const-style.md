# Enforce const enum style (`enum-const-style`)

This rule enforces consistent usage of `const enum`.

## Rule Details

This rule aims to standardize usage of const enums.

## Options

### Default config: `never`

```JSON
{
  "enum-const-style": ["error", "never"]
}
```

Examples of **incorrect** code for this rule with `never` config:

```ts
enum Foo {
  ONE,
  TWO,
}
```

Examples of **correct** code for this rule with `never` config:

```ts
const enum Foo {
  ONE,
  TWO,
}
```

### `always` config

Only const enums are allowed

Examples of **incorrect** code for this rule with `always` config:

```ts
enum const Foo {
  ONE,
  TWO,
}
```

Examples of **correct** code for this rule with `always` config:

```ts
const Foo {
  ONE,
  TWO,
}
```

## When Not To Use It

If you don't want to regulate usage of `const enum`s.
