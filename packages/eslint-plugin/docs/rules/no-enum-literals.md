# Disallows usage of literals instead of enums

## Rule Details

It's possible to use number of string literals instead of enum values. This rule disallows using string or number literals instead of enum values.

Examples of **incorrect** code for this rule:

```ts
enum Foo {
  ONE,
  TWO,
}

function foo(f: Foo) {
  if (f === 1) {
  }

  let ff: Foo;

  ff = 1;
}
foo(1);

enum Bar {
  ONE = 'ONE',
  TWO = 'TWO',
}

function bar(b: Bar) {
  if (b === 'ONE') {
  }
}
```

Examples of **correct** code for this rule:

```ts
enum Foo {
  ONE,
  TWO,
}

function foo(f: Foo) {
  if (f === Foo.ONE) {
  }

  let ff: Foo;

  ff = Foo.TWO;
}
foo(1);

enum Bar {
  ONE = 'ONE',
  TWO = 'TWO',
}

function bar(b: Bar) {
  if (b === Bar.ONE) {
  }
}
```

## When Not To Use It

If you want to allow usage of literals instead of enums
