# `no-unnecessary-generic-modifier`

Disallows generic type parameter modifiers that do nothing.

## Rule Details

All types `extend unknown` in TypeScript.
Constraining a generic type parameter with `extends unknown` is redundant.

Additionally, generic type parameters default to `unknown` if not specified or inferrable.
Defaulting a generic type parameter with `= unknown` is also redundant.

The only exception to those two rules is the case of arrow functions in `.tsx` files, where either an `= unknown` or `extends unknown` is necessary to indicate to TypeScript that a generic type parameter is not the start of a JSX element.
In that case, this rule prefers `= unknown` for being more terse.

<!--tabs-->

### ❌ Incorrect

```ts
type Identity<T = unknown> = T;
type Identity<T extends unknown> = T;
type Identity<T extends unknown = unknown> = T;

function identity<T = unknown>(value: T) {
  return value;
}

class IdentityValue<T extends unknown> {
  value: T;
}

interface IdentityValue<T extends unknown> {
  value: T;
}

// In a .ts file, but not a .tsx file
const identity = <T = unknown>(value: T) => value;

// In a .ts or .tsx file
const identity = <T extends unknown>(value: T) => value;
```

### ✅ Correct

```ts
type Identity<T = unknown> = T;
type Identity<T extends unknown> = T;
type Identity<T extends unknown = unknown> = T;

function identity<T = unknown>(value: T) {
  return value;
}

class IdentityValue<T extends unknown> {
  value: T;
}

interface IdentityValue<T extends unknown> {
  value: T;
}

// In a .ts file, but not a .tsx file
const identity = <T>(value: T) => value;

// In a .tsx file
const identity = <T = unknown>(value: T) => value;
```

## Further Reading

- [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [Top Types](https://en.wikipedia.org/wiki/Top_type)

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information
