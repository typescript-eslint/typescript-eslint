# Disallow generic `Array` constructors (`no-array-constructor`)

## Rule Details

This rule extends the base [`eslint/no-array-constructor`](https://eslint.org/docs/rules/no-array-constructor) rule.
It adds support for the generically typed `Array` constructor (`new Array<Foo>()`).

<!--tabs-->

### ❌ Incorrect

```ts
/*eslint no-array-constructor: "error"*/

Array(0, 1, 2);
new Array(0, 1, 2);
```

### ✅ Correct

```ts
/*eslint no-array-constructor: "error"*/

Array<number>(0, 1, 2);
new Array<Foo>(x, y, z);

Array(500);
new Array(someOtherArray.length);
```

## How to use

```jsonc
{
  // note you must disable the base rule as it can report incorrect errors
  "no-array-constructor": "off",
  "@typescript-eslint/no-array-constructor": ["error"]
}
```

## Options

See [`eslint/no-array-constructor` options](https://eslint.org/docs/rules/no-array-constructor#options).

<sup>

Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/main/docs/rules/no-array-constructor.md)

</sup>

## Source

- Rule: [no-array-constructor.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-array-constructor.ts)
- Documentation: [no-array-constructor.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-array-constructor.md)
- Tests: [no-array-constructor.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-array-constructor.test.ts)

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information
