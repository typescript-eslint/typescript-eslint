# `no-misused-new`

Enforce valid definition of `new` and `constructor`.

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

```jsonc
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-misused-new": "error"
  }
}
```

This rule is not configurable.

## Related To

- TSLint: [no-misused-new](https://palantir.github.io/tslint/rules/no-misused-new/)

## Attributes

- Configs:
  - [x] ✅ Recommended
  - [x] 🔒 Strict
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
