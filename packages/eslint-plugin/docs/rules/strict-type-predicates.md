# Disallow always true (or false) type predicates (`strict-type-predicates`)

Warns for type predicates that are always true or always false. Works for
`typeof` comparisons to constants (e.g. `typeof foo === 'string'`), and equality
comparison to `null`/`undefined`. (TypeScript won’t let you compare `1 === 2`,
but it has an exception for `1 === undefined`.) Does not yet work for
`instanceof`. Does not warn for `if (x.y)` where `x.y` is always truthy. For
that, see [`strict-boolean-expressions`](./strict-boolean-expressions.md).

This rule requires `strictNullChecks` to be enabled.

Examples of **incorrect** code for this rule:

```ts
const numberOrNull: number | null = 0;
// Implicitly checks for `!== undefined`, which is always false.
if (numberOrNull != null) {
  return;
}

const numberOrUndefined: number | undefined = 0;
// Implicitly checks for `!== null`, which is always false.
if (numberOrNull != undefined) {
  return;
}

const number: number = 0;
// Always false.
if (typeof number === 'string') {
  return;
}
```

Examples of **correct** code for this rule:

```ts
const numberOrNull: number | null = 0;
if (numberOrNull !== null) {
  return;
}

const numberOrUndefined: number | undefined = 0;
if (numberOrNull !== undefined) {
  return;
}

const number: number = 0;
// Always false.
if (typeof number === 'number') {
  return;
}
```

## Related To

- TSLint: [strict-type-predicates](https://palantir.github.io/tslint/rules/strict-type-predicates)
