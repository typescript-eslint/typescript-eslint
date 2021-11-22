# Prefer usage of `as const` over literal type (`prefer-as-const`)

This rule recommends usage of `const` assertion when type primitive value is equal to type.

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
let bar: 2 = 2;
let foo = <'bar'>'bar';
let foo = { bar: 'baz' as 'baz' };
```

### ✅ Correct

```ts
let foo = 'bar';
let foo = 'bar' as const;
let foo: 'bar' = 'bar' as const;
let bar = 'bar' as string;
let foo = <string>'bar';
let foo = { bar: 'baz' };
```

<!--/tabs-->

## When Not To Use It

If you are using TypeScript < 3.4

## Source

- Rule: [prefer-as-const.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/prefer-as-const.ts)
- Documentation: [prefer-as-const.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-as-const.md)
- Tests: [prefer-as-const.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/prefer-as-const.test.ts)

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information
