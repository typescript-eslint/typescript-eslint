# `no-duplicate-enum-values`

Disallow duplicate enum member values.

Although TypeScript supports duplicate enum member values, people usually expect members to have unique values within the same enum. Duplicate values can lead to bugs that are hard to track down.

## Rule Details

This rule disallows defining an enum with multiple members initialized to the same value. Now it only enforces on enum members initialized with String or Number literals. Members without initializer or initialized with an expression are not checked by this rule.

<!--tabs-->

### ❌ Incorrect

```ts
enum E {
  A = 0,
  B = 0,
}
```

```ts
enum E {
  A = 'A'
  B = 'A'
}
```

### ✅ Correct

```ts
enum E {
  A = 0,
  B = 1,
}
```

```ts
enum E {
  A = 'A'
  B = 'B'
}
```

This rule is not configurable.

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
