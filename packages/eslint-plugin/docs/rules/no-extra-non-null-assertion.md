# Disallow extra non-null assertion (`no-extra-non-null-assertion`)

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
const foo: { bar: number } | null = null;
const bar = foo!!!.bar;
```

```ts
function foo(bar: number | undefined) {
  const bar: number = bar!!!;
}
```

```ts
function foo(bar?: { n: number }) {
  return bar!?.n;
}
```

### ✅ Correct

```ts
const foo: { bar: number } | null = null;
const bar = foo!.bar;
```

```ts
function foo(bar: number | undefined) {
  const bar: number = bar!;
}
```

```ts
function foo(bar?: { n: number }) {
  return bar?.n;
}
```

## How to Use

```json
{
  "@typescript-eslint/no-extra-non-null-assertion": ["error"]
}
```

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

- Rule: [no-extra-non-null-assertion.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-extra-non-null-assertion.ts)
- Documentation: [no-extra-non-null-assertion.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-extra-non-null-assertion.md)
- Tests: [no-extra-non-null-assertion.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-extra-non-null-assertion.test.ts)
