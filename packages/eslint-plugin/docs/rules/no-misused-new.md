# Enforce valid definition of `new` and `constructor` (`no-misused-new`)

Warns on apparent attempts to define constructors for interfaces or `new` for classes.

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
class C {
  new(): C;
}

interface I {
  new (): I;
  constructor(): void;
}
```

### ✅ Correct

```ts
class C {
  constructor() {}
}
interface I {
  new (): C;
}
```

## Options

```json
{
  "@typescript-eslint/no-misused-new": "error"
}
```

## Related To

- TSLint: [no-misused-new](https://palantir.github.io/tslint/rules/no-misused-new/)

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

- Rule: [no-misused-new.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-misused-new.ts)
- Documentation: [no-misused-new.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-misused-new.md)
- Tests: [no-misused-new.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-misused-new.test.ts)
