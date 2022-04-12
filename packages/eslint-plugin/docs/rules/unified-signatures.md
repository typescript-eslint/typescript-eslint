# `unified-signatures`

Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter.

## Rule Details

This rule aims to keep the source code as maintainable as possible by reducing the amount of overloads.

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
function x(x: number): void;
function x(x: string): void;
```

```ts
function y(): void;
function y(...x: number[]): void;
```

### ✅ Correct

```ts
function x(x: number | string): void;
```

```ts
function y(...x: number[]): void;
```

## Options

```jsonc
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/unified-signatures": "warn"
  }
}
```

This rule is not configurable.

## Related To

- TSLint: [`unified-signatures`](https://palantir.github.io/tslint/rules/unified-signatures/)

## Attributes

- Configs:
  - [ ] ✅ Recommended
  - [x] ✔ Strict
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
