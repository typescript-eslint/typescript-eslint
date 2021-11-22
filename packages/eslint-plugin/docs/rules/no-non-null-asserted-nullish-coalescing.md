# Disallows using a non-null assertion in the left operand of the nullish coalescing operator (`no-non-null-asserted-nullish-coalescing`)

## Rule Details

The nullish coalescing operator is designed to provide a default value when dealing with `null` or `undefined`.
Using non-null assertions in the left operand of the nullish coalescing operator is redundant.

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
/* eslint @typescript-eslint/no-non-null-asserted-nullish-coalescing: "error" */

foo! ?? bar;
foo.bazz! ?? bar;
foo!.bazz! ?? bar;
foo()! ?? bar;

let x!: string;
x! ?? '';

let x: string;
x = foo();
x! ?? '';
```

### ✅ Correct

```ts
/* eslint @typescript-eslint/no-non-null-asserted-nullish-coalescing: "error" */

foo ?? bar;
foo ?? bar!;
foo!.bazz ?? bar;
foo!.bazz ?? bar!;
foo() ?? bar;

// This is considered correct code because there's no way for the user to satisfy it.
let x: string;
x! ?? '';
```

## When Not To Use It

If you are not using TypeScript 3.7 (or greater), then you will not need to use this rule, as the nullish coalescing operator is not supported.

## Further Reading

- [TypeScript 3.7 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html)
- [Nullish Coalescing Proposal](https://github.com/tc39/proposal-nullish-coalescing)

## Source

- Rule: [no-non-null-asserted-nullish-coalescing.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-non-null-asserted-nullish-coalescing.ts)
- Documentation: [no-non-null-asserted-nullish-coalescing.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-non-null-asserted-nullish-coalescing.md)
- Tests: [no-non-null-asserted-nullish-coalescing.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-non-null-asserted-nullish-coalescing.test.ts)

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
