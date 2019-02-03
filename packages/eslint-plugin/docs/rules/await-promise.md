# Disallows awaiting a value that is not a Promise (await-promise)

This rule disallows awaiting a value that is not a Promise.
While it is valid JavaScript to await a non-`Promise`-like value (it will resolve immediately), this pattern is often a programmer error, such as forgetting to add parenthesis to call a function that returns a Promise.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
await 'value';

const createValue = () => 'value';
await createValue();
```

```ts
// An array of Promises is not the same as an AsyncIterable
async function incorrect(arrayOfPromises: Array<Promise<string>>) {
  for await (const element of arrayOfPromises) {
  }
}
```

Examples of **correct** code for this rule:

```ts
await Promise.resolve('value');

const createValue = (async() = 'value');
await createValue();
```

```ts
async function overIterable(iterable: AsyncIterable<string>) {
  for await (const element of iterable) {
  }
}

async function overIterableIterator(iterable: AsyncIterableIterator<string>) {
  for await (const element of iterable) {
  }
}
```

## Options

The rule accepts an options object with the following property:

- `allowedPromiseNames` any extra names of classes or interfaces to be considered "awaitable" in `await` statements.

Classes named `Promise` may always be awaited.
`allowedPromiseNames` does not affect `for-await-of` statements.

### allowedPromiseNames

Examples of **incorrect** code for this rule with `{ allowedPromiseNames: ["Thenable"] }`:

```ts
class Thenable {
  /* ... */
}

await new Thenable();
```

Examples of **correct** code for this rule with `{ allowedPromiseNames: ["Thenable"] }`:

```ts
class OtherClass {
  /* ... */
}

await new OtherClass();
```

## When Not To Use It

If you want to allow code to `await` non-Promise values.
This is generally not preferred, but can sometimes be useful for visual consistency.

## Related to

- TSLint: ['await-promise'](https://palantir.github.io/tslint/rules/await-promise)
