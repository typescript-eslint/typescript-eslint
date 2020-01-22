# Enforces consistent spacing before and after commas (`comma-spacing`)

Spacing around commas improves readability of a list of items. Although most of the style guidelines for languages prescribe adding a space after a comma and not before it, it is subjective to the preferences of a project.

<!-- prettier-ignore -->
```ts
const foo = 1, bar = 2;
const foo = 1 ,bar = 2;
```

## Rule Details

This rule enforces consistent spacing before and after commas in variable declarations, array literals, object literals, function parameters, and sequences.

This rule does not apply in an `ArrayExpression` or `ArrayPattern` in either of the following cases:

- adjacent null elements
- an initial null element, to avoid conflicts with the [`array-bracket-spacing`](https://github.com/eslint/eslint/blob/master/docs/rules/array-bracket-spacing.md) rule

## Options

This rule has an object option:

- `"before": false` (default) disallows spaces before commas
- `"before": true` requires one or more spaces before commas
- `"after": true` (default) requires one or more spaces after commas
- `"after": false` disallows spaces after commas

### after

Examples of **incorrect** code for this rule with the default `{ "before": false, "after": true }` options:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/comma-spacing: ["error", { "before": false, "after": true }]*/

const foo = 1 ,bar = 2;
const arr = [1 , 2];
const obj = {"foo": "bar" ,"baz": "qur"};
foo(a ,b);
new Foo(a ,b);
function foo(a ,b){}
a ,b;
function foo<T ,T1>() {}
```

Examples of **correct** code for this rule with the default `{ "before": false, "after": true }` options:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/comma-spacing: ["error", { "before": false, "after": true }] */

const foo = 1, bar = 2
    , baz = 3;
const arr = [1, 2];
const arr = [1,, 3]
const obj = {"foo": "bar", "baz": "qur"};
foo(a, b);
new Foo(a, b);
function foo(a, b){}
a, b;
function foo<T, T1>() {}
function foo<T,>() {}
```

Example of **correct** code for this rule with initial null element for the default `{ "before": false, "after": true }` options:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/comma-spacing: ["error", { "before": false, "after": true }]*/
/*eslint array-bracket-spacing: ["error", "always"]*/

const arr = [ , 2, 3 ]
```

### before

Examples of **incorrect** code for this rule with the `{ "before": true, "after": false }` options:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/comma-spacing: ["error", { "before": true, "after": false }]*/

const foo = 1, bar = 2;
const arr = [1 , 2];
const obj = {"foo": "bar", "baz": "qur"};
new Foo(a,b);
function foo(a,b){}
a, b;
function foo<T,T1>() {}
```

Examples of **correct** code for this rule with the `{ "before": true, "after": false }` options:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/comma-spacing: ["error", { "before": true, "after": false }]*/

const foo = 1 ,bar = 2 ,
    baz = true;
const arr = [1 ,2];
const arr = [1 ,,3]
const obj = {"foo": "bar" ,"baz": "qur"};
foo(a ,b);
new Foo(a ,b);
function foo(a ,b){}
a ,b;
function foo<T ,T1>() {}
```

Examples of **correct** code for this rule with initial null element for the `{ "before": true, "after": false }` options:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/comma-spacing: ["error", { "before": true, "after": false }]*/
/*eslint array-bracket-spacing: ["error", "never"]*/

var arr = [,2 ,3]
```

## How to use

```cjson
{
  // note you must disable the base rule as it can report incorrect errors
  "comma-spacing": "off",
  "@typescript-eslint/comma-spacing": ["error"]
}
```

## When Not To Use It

If your project will not be following a consistent comma-spacing pattern, turn this rule off.

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/comma-spacing.md)</sup>
