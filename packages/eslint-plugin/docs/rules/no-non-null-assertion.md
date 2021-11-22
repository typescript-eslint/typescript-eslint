# Disallows non-null assertions using the `!` postfix operator (`no-non-null-assertion`)

## Rule Details

Using non-null assertions cancels the benefits of the strict null-checking mode.

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
interface Foo {
  bar?: string;
}

const foo: Foo = getFoo();
const includesBaz: boolean = foo.bar!.includes('baz');
```

### ✅ Correct

```ts
interface Foo {
  bar?: string;
}

const foo: Foo = getFoo();
const includesBaz: boolean = foo.bar?.includes('baz') ?? false;
```

## When Not To Use It

If you don't care about strict null-checking, then you will not need this rule.

## Further Reading

- [`no-non-null-assertion`](https://palantir.github.io/tslint/rules/no-non-null-assertion/) in [TSLint](https://palantir.github.io/tslint/)

## Source

- Rule: [no-non-null-assertion.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-non-null-assertion.ts)
- Documentation: [no-non-null-assertion.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-non-null-assertion.md)
- Tests: [no-non-null-assertion.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-non-null-assertion.test.ts)

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
