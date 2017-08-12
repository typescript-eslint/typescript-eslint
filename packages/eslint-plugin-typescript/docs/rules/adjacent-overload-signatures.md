# Enforces member overloads to be consecutive.

Grouping overloaded members (methods and functions) together can improve readability of the code.

## Rule Details

This rule aims to standardise the way overloaded members are organized.

The following patterns are considered warnings:

```ts
declare namespace Foo {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function bar(): void;
    export function foo(sn: string | number): void;
}

type Foo = {
  foo(s: string): void;
  foo(n: number): void;
  bar(): void;
  foo(sn: string | number): void;
}

interface Foo {
  foo(s: string): void;
  foo(n: number): void;
  bar(): void;
  foo(sn: string | number): void;
}

class Foo {
  foo(s: string): void;
  foo(n: number): void;
  bar(): void {}
  foo(sn: string | number): void {}
}
```

The following patterns are not warnings:

```ts
declare namespace Foo {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    export function bar(): void;    
}

type Foo = {
  foo(s: string): void;
  foo(n: number): void;  
  foo(sn: string | number): void;
  bar(): void;
}

interface Foo {
  foo(s: string): void;
  foo(n: number): void;  
  foo(sn: string | number): void;
  bar(): void;
}

class Foo {
  foo(s: string): void;
  foo(n: number): void;  
  foo(sn: string | number): void {}
  bar(): void {}
}
```

## When Not To Use It

If you don't care about the general structure of the code, then you will not need this rule.

## Compatibility

* TSLint: [adjacent-overload-signatures](https://palantir.github.io/tslint/rules/adjacent-overload-signatures/)