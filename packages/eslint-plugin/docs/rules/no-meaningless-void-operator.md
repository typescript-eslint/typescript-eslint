# Disallow the `void` operator except when used to discard a value (`no-meaningless-void-operator`)

Disallow the `void` operator when its argument is already of type `void`, `undefined`, or `never`.

## Rule Details

The `void` operator is a useful tool to convey the programmer's intent to discard a value. For example, it is recommended as one way of suppressing [`@typescript-eslint/no-floating-promises`](./no-floating-promises.md) instead of adding `.catch()` to a promise.

This rule helps an author catch API changes where previously a value was being discarded at a call site, but the callee changed so it no longer returns a value. When combined with [no-unused-expressions](https://eslint.org/docs/rules/no-unused-expressions), it also helps _readers_ of the code by ensuring consistency: a statement that looks like `void foo();` is **always** discarding a return value, and a statement that looks like `foo();` is **never** discarding a return value.

Examples of **incorrect** code for this rule:

```ts
void (() => {})();

function foo() {}
void foo();

function bar(x: never) {
  void x;
}
```

Examples of **correct** code for this rule:

```ts
(() => {})();

function foo() {}
foo(); // nothing to discard

function bar(x: number) {
  void x; // discarding a number
  return 2;
}
void bar(); // discarding a number
```
