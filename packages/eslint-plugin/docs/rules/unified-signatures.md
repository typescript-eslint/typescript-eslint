# Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter (`unified-signatures`)

Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter.

## Rule Details

This rule aims to keep the source code as maintainable as possible by reducing the amount of overloads.

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
function f(x: number | string): void;
```

```ts
function f(x?: ...number[]): void;
```

## Related To

- TSLint: [`unified-signatures`](https://palantir.github.io/tslint/rules/unified-signatures/)

## Source

- Rule: [unified-signatures.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/unified-signatures.ts)
- Documentation: [unified-signatures.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/unified-signatures.md)
- Tests: [unified-signatures.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/unified-signatures.test.ts)

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
