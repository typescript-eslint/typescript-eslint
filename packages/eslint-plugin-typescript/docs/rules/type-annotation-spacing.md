# Enforces spacing around type annotations (type-annotation-spacing)

Type annotations in TypeScript tend to have a very specific format, where the colon appears directly after the identifier or function, followed by a space, followed by the type. For example:

```ts
var foo: string = "bar";

function foo(a: string): string {
    // code
}
```

This convention is carried through TypeScript documentation and is the most common convention used for TypeScript code.

## Rule Details

This rule aims to enforce specific spacing patterns around type annotations. As such, it will warn when there is a space before the colon or a space is missing after the colon of a type annotation.

The following patterns are considered warnings:

```ts
var foo:string = "bar";

function foo(a : string):string {
    // code
}
```

The following patterns are not warnings:

```js
var foo: string = "bar";

function foo(a: string): string {
    // code
}
```

## When Not To Use It

If you don't want to enforce spacing for your type annotations, you can safely turn this rule off.
