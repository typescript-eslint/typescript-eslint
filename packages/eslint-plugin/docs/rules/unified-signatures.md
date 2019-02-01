# Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter. (unified-signatures)

Please describe the origin of the rule here.


## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```ts
function f(x: number): void;
function f(x: string): void;
```
```ts
f(): void;
f(...x: number[]): void;
```

Examples of **correct** code for this rule:

```ts
function f(x: number | stting): void;
```
```ts
function f(x?: ...number[]): void;
```

## Related to

 - TSLint: ['unified-signatures`](https://palantir.github.io/tslint/rules/unified-signatures/)