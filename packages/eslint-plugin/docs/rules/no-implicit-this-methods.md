# No implicit `this` type for methods

This rule requires that all class and object methods that use the `this` keyword must explicitly specify the `this` type, so that the typescript compiler will ensure that the function is always called with the right `this`. For example:

```ts
class Example {
  value = 'val';
  implicit() {
    return this.value.toUpperCase();
  }
  explicit(this: this) {
    return this.value.toUpperCase();
  }
}
const implicit = new Example().implicit;
implicit(); // Runtime error, but not a compiler error

const explicit = new Example().explicit;
explicit(); // Compile error
```

The compiler has a built-in `--noImplicitThis` option, but it allows `this` to be implicit in classes and object methods.

Examples of **incorrect** code for this rule:

```ts
class Test {
  val = 'val';
  method() {
    console.log(this.val);
  }
}

const obj = {
  val: 'val',
  method() {
    console.log(this.val);
  },
};
```

Examples of **correct** code for this rule:

```ts
class Test {
  val = 'val';
  // Explicit this type
  method1(this: this) {
    console.log(this.val);
  }
  // Doesn't use this
  method2() {
    console.log('val');
  }
}

const obj = {
  val: 'val',
  // Explicit this type
  method1(this: { val: string }) {
    console.log(this.val);
  },
  // Doesn't use this
  method2() {
    console.log('val');
  },
};
```

## When Not To Use It

If you don't like the boilerplate of explicit `this` annotations, and/or don't have issue with disconnecting methods from their `this` context.
