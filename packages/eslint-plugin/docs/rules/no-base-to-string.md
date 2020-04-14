# Requires that `.toString()` is only called on objects which provide useful information when stringified (`no-base-to-string`)

JavaScript will call `toString()` on an object when it is converted to a string, such as when `+` adding to a string or in `${}` template literals.

The default Object `.toString()` returns `"[object Object]"`, so this rule requires stringified objects define a more useful `.toString()` method.

Note that `Function` provides its own `.toString()` that returns the function's code.
Functions are not flagged by this rule.

This rule has some overlap with [`restrict-plus-operands`](./restrict-plus-operands.md) and [`restrict-template-expressions`](./restrict-template-expressions.md).

## Rule Details

This rule prevents accidentally defaulting to the base Object `.toString()` method.

Examples of **incorrect** code for this rule:

```ts
// Passing an object or class instance to string concatenation:
'' + {};

class MyClass {}
const value = new MyClass();
value + '';

// Interpolation and manual .toString() calls too:
`Value: ${value}`;
({}.toString());
```

Examples of **correct** code for this rule:

```ts
// These types all have useful .toString()s
'Text' + true;
`Value: ${123}`;
`Arrays too: ${[1, 2, 3]}`;
(() => {}).toString();

// Defining a custom .toString class is considered acceptable
class CustomToString {
  toString() {
    return 'Hello, world!';
  }
}
`Value: ${new CustomToString()}`;

const literalWithToString = {
  toString: () => 'Hello, world!',
};

`Value: ${literalWithToString}`;
```

## Options

The rule accepts an options object with the following properties:

```ts
type Options = {
  // if true, interpolated expressions in tagged templates will not be checked
  ignoreTaggedTemplateExpressions?: boolean;
};

const defaults = {
  ignoreTaggedTemplateExpressions: false,
};
```

### `ignoreTaggedTemplateExpressions`

This allows to skip checking tagged templates, for cases where the tags do not necessarily stringify interpolated values.

Examples of additional **correct** code for this rule with `{ ignoreTaggedTemplateExpressions: true }`:

```ts
function tag() {}
tag`${{}}`;
```

## When Not To Use It

If you don't mind `"[object Object]"` in your strings, then you will not need this rule.

- [`Object.prototype.toString()` MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)
