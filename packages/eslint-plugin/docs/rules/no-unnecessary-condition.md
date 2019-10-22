# Condition expressions must be necessary

Any expression being used as a condition must be able to evaluate as truthy or falsy in order to be considered "necessary". Conversely, any expression that always evaluates to truthy or always evaluates to falsy, as determined by the type of the expression, is considered unnecessary and will be flagged by this rule.

The following expressions are checked:

- Arguments to the `&&`, `||` and `?:` (ternary) operators
- Conditions for `if`, `for`, `while`, and `do-while` statements.

Examples of **incorrect** code for this rule:

```ts
function head<T>(items: T[]) {
  // items can never be nullable, so this is unnecessary
  if (items) {
    return items[0].toUpperCase();
  }
}

function foo(arg: 'bar' | 'baz') {
  // arg is never nullable or empty string, so this is unnecessary
  if (arg) {
  }
}
```

Examples of **correct** code for this rule:

```ts
function head<T>(items: T[]) {
  // Necessary, since items.length might be 0
  if (items.length) {
    return items[0].toUpperCase();
  }
}

function foo(arg: string) {
  // Necessary, since foo might be ''.
  if (arg) {
  }
}
```

## Options

Accepts an object with the following options:

- `ignoreRhs` (default `false`) - doesn't check if the right-hand side of `&&` and `||` is a necessary condition. For example, the following code is valid with this option on:

```ts
function head<T>(items: T[]) {
  return items.length && items[0].toUpperCase();
}
```

## When Not To Use It

The main downside to using this rule is the need for type information.

## Related To

- ESLint: [no-constant-condition](https://eslint.org/docs/rules/no-constant-condition) - this rule is essentially a stronger version.

- [strict-boolean-expression](./strict-boolean-expressions.md) - a stricter alternative to this rule.
