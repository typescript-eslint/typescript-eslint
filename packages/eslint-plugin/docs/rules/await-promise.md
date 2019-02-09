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

Examples of **correct** code for this rule:

```ts
await Promise.resolve('value');

const createValue = (async() = 'value');
await createValue();
```

## Options

The rule accepts an options object with the following property:

- `allowedPromiseNames` any extra names of classes or interfaces to be considered "awaitable" in `await` statements.

Classes and interfaces named `Promise` are always allowed in `await` statements.

### allowedPromiseNames

Examples of **incorrect** code for this rule with `{ allowedPromiseNames: ["Thenable"] }`:

```ts
class OtherClass {
  /* ... */
}

await new OtherClass();
```

Examples of **correct** code for this rule with `{ allowedPromiseNames: ["Thenable"] }`:

```ts
class Thenable {
  /* ... */
}

await new Thenable();
```

## When Not To Use It

If you want to allow code to `await` non-Promise values.
This is generally not preferred, but can sometimes be useful for visual consistency.

## Related to

- TSLint: ['await-promise'](https://palantir.github.io/tslint/rules/await-promise)
