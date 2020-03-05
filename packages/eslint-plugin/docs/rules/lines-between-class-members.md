# Require or disallow an empty line between class members (`lines-between-class-members`)

This rule improves readability by enforcing lines between class members. It will not check empty lines before the first member and after the last member, since that is already taken care of by padded-blocks.

## Rule Details

Examples of **incorrect** code for this rule:

```js
/* eslint @typescript-eslint/lines-between-class-members: ["error", "always"]*/
class MyClass {
  foo() {
    //...
  }
  bar() {
    //...
  }
  baz(a: string): void;
  baz(a: string, b: number): void;
  baz(a: string, b?: number) {

  }
}
```

Examples of **correct** code for this rule:

```js
/* eslint @typescript-eslint/lines-between-class-members: ["error", "always"]*/
class MyClass {
  foo() {
    //...
  }

  bar() {
    //...
  }

  baz(a: string): void;
  baz(a: string, b: number): void;
  baz(a: string, b?: number) {

  }
}
```

**_This rule was taken from the ESLint core rule `lines-between-class-members`._**
**_Available options and test cases may vary depending on the version of ESLint installed in the system._**

### Options

This rule has a string option and an object option.

String option:

- `"always"`(default) require an empty line after class members
- `"never"` disallows an empty line after class members

Object option:

- `"exceptAfterSingleLine": false`(default) **do not** skip checking empty lines after single-line class members
- `"exceptAfterSingleLine": true` skip checking empty lines after single-line class members
- `"expectAfterOverload": true`(default) skip checking empty lines after overloading class members
- `"expectAfterOverload": false` **do not** skip checking empty lines after overloading class members

Examples of **incorrect** code for this rule with the string option:

```js
/* eslint @typescript-eslint/lines-between-class-members: ["error", "always"]*/
class Foo {
  bar() {}
  baz() {}
  qux(a: string): void;
  qux(a: string, b: number): void;
  qux(a: string, b?: number) {

  }
}

/* eslint @typescript-eslint/lines-between-class-members: ["error", "never"]*/
class Foo {
  bar() {}

  baz() {}

  qux(a: string): void;

  qux(a: string, b: number): void;

  qux(a: string, b?: number) {

  }
}
```

Examples of **correct** code for this rule with the string option:

```js
/* eslint @typescript-eslint/lines-between-class-members: ["error", "always"]*/
class Foo{
  bar(){}

  baz(){}

  qux(a: string): void;
  qux(a: string, b: number): void;
  qux(a: string, b?: number) {

  }
}

/* eslint @typescript-eslint/lines-between-class-members: ["error", "never"]*/
class Foo{
  bar(){}
  baz(){}
  qux(a: string): void;
  qux(a: string, b: string): void;
  qux(a: string, b?: string) {

  }
}
```

## `exceptAfterSingleLine: "true"`

Examples of **correct** code for this rule with the object option `{ "expectAfterSingleLine": true }`:

```js
/* eslint @typescript-eslint/lines-between-class-members: ["error", "always", { exceptAfterSingleLine: true }]*/
class Foo {
  bar() {} // single line class member
  baz() {
    // multi line class member
  }

  qux(a: string): void;
  qux(a: string, b: string): void;
  qux(a: string, b?: string) {

  }
}
```

## `exceptAfterOverload: "false"`

Examples of **correct** code for this rule with the object option `{ "exceptAfterOverload": false }`:

```js
/* eslint @typescript-eslint/lines-between-class-members: ["error", "always", { exceptAfterOverload: false }]*/
class Foo {
  bar() {} // single line class member

  baz() {
    // multi line class member
  }

  qux(a: string): void;

  qux(a: string, b: string): void;

  qux(a: string, b?: string) {

  }
}
```

## When Not To Use It

If you don't want to enforce empty lines between class members, you can disable this rule.

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/lines-between-class-members.md)</sup>
