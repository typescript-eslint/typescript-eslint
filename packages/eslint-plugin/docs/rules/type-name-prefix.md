# Require that type names be prefixed with `T` (type-name-prefix)

Type often represent an important software contract, so it can be helpful to prefix their names with `T`, same as
interfaces with `I`. The unprefixed name is then available for a class or functions that provides a standard
implementation of the type or interface.

## Rule Details

This rule enforces whether or not the `T` prefix is required for type names.

## Options

This rule has an object option:

- `{ "prefixWithT": "never" }`: (default) disallows all types being prefixed with `T`
- `{ "prefixWithT": "always" }`: requires all types be prefixed with `T`

## Examples

prefixWithT

### never

**Configuration:** `{ "prefixWithT": "never" }`

The following patterns are considered warnings:

```ts
type TAlign = 'left' | 'right';
type TType = 'primary' | 'secondary';
```

The following patterns are not warnings:

```ts
type Align = 'left' | 'right';
type Type = 'primary' | 'secondary';
```

### always

**Configuration:** `{ "prefixWithT": "always" }`

The following patterns are considered warnings:

```ts
type Align = 'left' | 'right';
type Type = 'primary' | 'secondary';
```

The following patterns are not warnings:

```ts
type TAlign = 'left' | 'right';
type TType = 'primary' | 'secondary';
```

## When Not To Use It

If you do not want to enforce type name prefixing.
