# Disallows inferring wide type on array reduce (`no-unsafe-array-reduce`)

## Rule Details

The type of {} is {}. Any object is assignable to {}. {} is assignable
to any indexed type (`{[key in string]: whatever}`)

A reduce call with an empty object initializer and no type signature,
will infer the {} type for the accumulator and result of the reduce
expression. Since anything is assignable to {}, this means the reduce
function is essentially unchecked. The result of the expression can then
also be assigned to an incompatible type without raising any errors.

This rule warns if a reduce call takes an empty object as the initial
value and has no type signatures.

Examples of **incorrect** code for this rule:

```ts
/* eslint @typescript-eslint/no-unsafe-array-reduce: ["error"] */

[].reduce((acc, cur) => acc, {});
```

Examples of **correct** code for this rule:

```ts
/* eslint @typescript-eslint/no-unsafe-array-reduce: ["error"] */

// Type parameter is fine
[].reduce<Dict>((acc, _) => acc, {});

// Typed accumulator is fine
[].reduce((acc: Dict, _) => acc, {});

// Typed init value is fine
[].reduce((acc, _) => acc, {} as Dict);
```
