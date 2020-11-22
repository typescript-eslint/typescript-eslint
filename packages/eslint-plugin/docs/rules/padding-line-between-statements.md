# require or disallow padding lines between statements (`padding-line-between-statements`)

This rule extends the base [`eslint/padding-line-between-statements`](https://eslint.org/docs/rules/padding-line-between-statements#require-or-disallow-padding-lines-between-statements-padding-line-between-statements) rule. It requires or disallows padding (i.e. blank lines) between two given types of statements. Padding generally helps readability.

## Changes from the Original Rule

- The `cjs-export` option was renamed to `exports`.
- The `cjs-import` option was renamed to `require`.
- Unknown `STATEMENT_TYPE`s (see the [Rule Details](#rule-details)) will be casted as if they are a keyword.
  - If `singleline-` is prepended to the `STATEMENT_TYPE`, then the unknown `STATEMENT_TYPE` will be treated only when `STATEMENT_TYPE` is single line.
  - If `multiline-` is prepended to the `STATEMENT_TYPE`, then the unknown `STATEMENT_TYPE` will be treated only when `STATEMENT_TYPE` is multiple lines.

## Rule Details

This rule follows the same structure as `eslint`'s, however we have a few changes:

- The `cjs-export` option was renamed to `exports`.
- The `cjs-import` option was renamed to `require`.
- Unknown `STATEMENT_TYPE`s (see the [Rule Details](#rule-details)) will be casted as if they are a keyword.
- If `singleline-` is prepended to the `STATEMENT_TYPE`, then the `STATEMENT_TYPE` will be treated only when `STATEMENT_TYPE` is single line.
- If `multiline-` is prepended to the `STATEMENT_TYPE`, then the `STATEMENT_TYPE` will be treated only when `STATEMENT_TYPE` is multiple lines.

### Syntax

```json
{
    "padding-line-between-statements": [
        "error",
        { "blankLine": LINEBREAK_TYPE, "prev": MODIFIER_TYPE STATEMENT_TYPE, "next": MODIFIER_TYPE STATEMENT_TYPE },
        { "blankLine": LINEBREAK_TYPE, "prev": MODIFIER_TYPE STATEMENT_TYPE, "next": MODIFIER_TYPE STATEMENT_TYPE },
        { "blankLine": LINEBREAK_TYPE, "prev": MODIFIER_TYPE STATEMENT_TYPE, "next": MODIFIER_TYPE STATEMENT_TYPE },
        { "blankLine": LINEBREAK_TYPE, "prev": MODIFIER_TYPE STATEMENT_TYPE, "next": MODIFIER_TYPE STATEMENT_TYPE },
        ...
    ]
}
```

- `LINEBREAK_TYPE` is one of the following.

  - `"any"` just ignores the statement pair.
  - `"never"` disallows blank lines.
  - `"always"` requires one or more blank lines. Note it does not count lines that comments exist as blank lines.

- `STATEMENT_TYPE` is one of the following, or an array of the following.

  - `"*"` is wildcard. This matches any statements.
  - `"block"` is lonely blocks.
  - `"block-like"` is block like statements. This matches statements that the last token is the closing brace of blocks; e.g. `{ }`, `if (a) { }`, and `while (a) { }`. Also matches immediately invoked function expression statements.
  - `"break"` is `break` statements.
  - `"case"` is `case` clauses in `switch` statements.
  - `"exports"` is `exports` statements of CommonJS; e.g. `module.exports = 0`, `module.exports.foo = 1`, and `exports.foo = 2`. This is a special case of assignment.
  - `"require"` is `require` statements of CommonJS; e.g. `const foo = require("foo")`. This is a special case of variable declarations.
  - `"class"` is `class` declarations.
  - `"const"` is `const` variable declarations, both single-line and multiline.
  - `"continue"` is `continue` statements.
  - `"debugger"` is `debugger` statements.
  - `"default"` is `default` clauses in `switch` statements.
  - `"directive"` is directive prologues. This matches directives; e.g. `"use strict"`.
  - `"do"` is `do-while` statements. This matches all statements that the first token is `do` keyword.
  - `"empty"` is empty statements.
  - `"export"` is `export` declarations.
  - `"expression"` is expression statements.
  - `"for"` is `for` loop families. This matches all statements that the first token is `for` keyword.
  - `"function"` is function declarations.
  - `"if"` is `if` statements.
  - `"iife"` is immediately invoked function expression statements. This matches calls on a function expression, optionally prefixed with a unary operator.
  - `"import"` is `import` declarations.
  - `"let"` is `let` variable declarations, both single-line and multiline.
  - `"return"` is `return` statements.
  - `"switch"` is `switch` statements.
  - `"throw"` is `throw` statements.
  - `"try"` is `try` statements.
  - `"var"` is `var` variable declarations, both single-line and multiline.
  - `"while"` is `while` loop statements.
  - `"with"` is `with` statements.
  - `"type"` is `type` statements.
  - `"interface"` is `interface` statements.

- `MODIFIER_TYPE` is one of the following
  - `"singleline-"` only treats single line `STATEMENT_TYPE`s.
  - `"multiline-"` only treats multi line `STATEMENT_TYPE`s.

## When Not To Use It

If you don't want to notify warnings about linebreaks, then it's safe to disable this rule.

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/padding-line-between-statements#require-or-disallow-padding-lines-between-statements-padding-line-between-statements)</sup>
