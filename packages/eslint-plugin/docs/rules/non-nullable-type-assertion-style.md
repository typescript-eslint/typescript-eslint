# `non-nullable-type-assertion-style`

Enforces non-null assertions over explicit type casts.

This rule detects when an `as` cast is doing the same job as a `!` would, and suggests fixing the code to be an `!`.

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
const maybe = Math.random() > 0.5 ? '' : undefined;

const definitely = maybe as string;
const alsoDefinitely = <string>maybe;
```

### ✅ Correct

```ts
const maybe = Math.random() > 0.5 ? '' : undefined;

const definitely = maybe!;
const alsoDefinitely = maybe!;
```

## Options

```jsonc
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/non-nullable-type-assertion-style": "warn"
  }
}
```

This rule is not configurable.

## When Not To Use It

If you don't mind having unnecessarily verbose type casts, you can avoid this rule.

## Attributes

- Configs:
  - [ ] ✅ Recommended
  - [x] 🔒 Strict
- [x] 🔧 Fixable
- [x] 💭 Requires type information
