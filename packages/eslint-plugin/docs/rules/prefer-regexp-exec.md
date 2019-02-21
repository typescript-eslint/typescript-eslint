# Enforce to use `RegExp#exec` over `String#match` (prefer-regexp-exec)

`String#match` is outperformed by `RegExp#exec` and both work in the same way, except for /g flag.

## Rule Details

This rule is aimed at enforcing the more performant way for applying regular expressions on Strings.

Examples of **incorrect** code for this rule:

```ts
'something'.match(/thing/);

const text = 'something';
const search = /thing/;
text.match(search);
```

Examples of **correct** code for this rule:

```ts
'some things are just things'.match(/thing/g);
/thing/.exec('something');
```

## Options

There are no options.

```JSON
{
  "@typescript-eslint/prefer-regexp-exec": "error"
}
```

## When Not To Use It

If you don't mind performance, you can turn this rule off safely.
