# Avoid returning a value when the function return type is void (`no-return-in-void-callback`)

This rule prevent returning non-void types in a callback that expects a void return type.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
function foo(callback: () => void) {
  callback();
}

foo(() => 'Hello');
foo(() => {
  return null;
});
```

Examples of **correct** code for this rule:

```ts
function foo(callback: () => void) {
  callback();
}
foo(() => {});

function bar(callbackOrString: (() => void) | string) {
  console.log(callbackOrString);
}
bar('Hello');

function baz(callback: () => string | void) {
  callback();
}
baz(() => 'Hello');
```

## When Not To Use It

If you want to keep compact arrow functions in case of functions that both does a side effect and returns a value. Example from
[TypeScript void function assignability](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-returning-non-void-assignable-to-function-returning-void):

```tsx
function callMeMaybe(callback: () => void) {
  callback();
}
let items = [1, 2];
callMeMaybe(() => items.push(3));
```

## Related to

- [`no-confusing-void-expressio`](./no-confusing-void-expression.md)
- [`no-misused-promises`](./no-misused-promises.md)
