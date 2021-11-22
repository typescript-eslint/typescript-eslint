# Disallows awaiting a value that is not a Thenable (`await-thenable`)

This rule disallows awaiting a value that is not a "Thenable" (an object which has `then` method, such as a Promise).
While it is valid JavaScript to await a non-`Promise`-like value (it will resolve immediately), this pattern is often a programmer error, such as forgetting to add parenthesis to call a function that returns a Promise.

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
await 'value';

const createValue = () => 'value';
await createValue();
```

### ✅ Correct

```ts
await Promise.resolve('value');

const createValue = async () => 'value';
await createValue();
```

## When Not To Use It

If you want to allow code to `await` non-Promise values.
This is generally not preferred, but can sometimes be useful for visual consistency.

## Related To

- TSLint: ['await-promise'](https://palantir.github.io/tslint/rules/await-promise)

## Source

- Rule: [await-thenable.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/await-thenable.ts)
- Documentation: [await-thenable.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/await-thenable.md)
- Tests: [await-thenable.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/await-thenable.test.ts)

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [x] 💭 Requires type information
