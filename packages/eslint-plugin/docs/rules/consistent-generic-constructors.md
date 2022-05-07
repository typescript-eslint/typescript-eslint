# `consistent-generic-constructors`

Enforce specifying generic type arguments on LHS or RHS of constructor call.

When constructing a generic class, you can specify the type arguments on either the left-hand side or the right-hand side:

```ts
// Left-hand side
const map: Map<string, number> = new Map();

// Right-hand side
const map = new Map<string, number>();
```

This rule ensures that type arguments appear consistently on one side of the declaration.

## Options

```jsonc
{
  "rules": {
    "@typescript-eslint/consistent-generic-constructors": ["error", "rhs"]
  }
}
```

This rule takes a string option:

- If it's set to `rhs` (default), only type arguments on the right-hand side are allowed.
- If it's set to `lhs`, only type arguments on the left-hand side are allowed.

## Rule Details

The rule never reports when there are type parameters on both sides, or neither sides of the declaration. It also doesn't report if the names of the two sides don't match.

### `rhs`

<!--tabs-->

#### ❌ Incorrect

```ts
const map: Map<string, number> = new Map();
const set: Set<string> = new Set<string>();
```

#### ✅ Correct

```ts
const map = new Map<string, number>();
const map: Map<string, number> = new MyMap();
const set = new Set<string>();
const set = new Set();
const set: Set<string> = new Set<string>();
```

### `lhs`

<!--tabs-->

#### ❌ Incorrect

```ts
const map = new Map<string, number>();
const set = new Set<string>();
```

#### ✅ Correct

```ts
const map: Map<string, number> = new Map();
const set: Set<string> = new Set();
const set = new Set();
const set: Set<string> = new Set<string>();
```

## When Not To Use It

You can turn this rule off if you don't want to enforce one kind of generic constructor style over the other.

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information
