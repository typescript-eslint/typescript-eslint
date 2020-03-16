# Enforce consistent spacing before and after keywords (`keyword-spacing`)

Keywords are syntax elements of JavaScript, such as `try` and `if`.
These keywords have special meaning to the language and so often appear in a different color in code editors.
As an important part of the language, style guides often refer to the spacing that should be used around keywords.
For example, you might have a style guide that says keywords should be always surrounded by spaces, which would mean `if-else` statements must look like this:

```js
if (foo) {
    // ...
} else {
    // ...
}
```

Of course, you could also have a style guide that disallows spaces around keywords.

However, if you want to enforce the style of spacing between the `function` keyword and the following opening parenthesis, please refer to [space-before-function-paren](space-before-function-paren.md).

## Rule Details

This rule extends the base [`eslint/keyword-spacing`](https://eslint.org/docs/rules/keyword-spacing) rule.
It supports all options and features of the base rule.
This version adds support for generic type parameters on function calls.

## How to use

```cjson
{
  // note you must disable the base rule as it can report incorrect errors
  "keyword-spacing": "off",
  "@typescript-eslint/keyword-spacing": ["error"]
}
```

## Options

See [`eslint/keyword-spacing` options](https://eslint.org/docs/rules/keyword-spacing#options).

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/keyword-spacing.md)</sup>
