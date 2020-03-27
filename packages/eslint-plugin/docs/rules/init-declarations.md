# require or disallow initialization in variable declarations (`init-declarations`)

In Typescript, variables can be assigned during declaration, or at any point afterwards using an assignment statement. For example, in the following code, `foo` is initialized during declaration, while `bar` is initialized later.

```ts
var foo: number = 1;
var bar: number;

if (foo) {
  bar = 1;
} else {
  bar = 2;
}
```

## Rule Details

This rule is aimed at enforcing or eliminating variable initializations during declaration. For example, in the following code, `foo` is initialized during declaration, while `bar` is not.

```ts
var foo: number = 1;
var bar;

bar: number = 2;
```

This rule aims to bring consistency to variable initializations and declarations.

Variables must be initialized at declaration (default)

```tson
{
    "@typescript-eslint/init-declarations": ["error", "always"],
}
```

Variables must not be initialized at declaration

```tson
{
    "@typescript-eslint/init-declarations": ["error", "never"]
}
```

## Options

```ts
{
  //Variables must not be initialized at declaration, except in for loops, where it is allowed
  // Only applicable when the string options is 'never'
  ignoreForLoopInit: Boolean;
}
```

```ts
export defaultOptions = {
  ignoreForLoopInit : false
}

```

### always

Examples of **incorrect** code for the default `"always"` option:

```ts
function foo() {
  var bar: string;
  let baz: string;
}
```

Examples of **correct** code for the default `"always"` option:

```ts
function foo() {
  var bar: number = 1;
  let baz: number = 2;
  const qux: number = 3;
}

declare const foo: number;

declare namespace myLib {
  let numberOfGreetings: number;
}

interface GreetingSettings {
  greeting: string;
  duration?: number;
  color?: string;
}

type GreetingLike = GreetingSettings;
```

### never

Examples of **incorrect** code for the `"never"` option:

```ts
function foo() {
  var bar: number = 1;
  let baz: number = 2;

  for (var i = 0; i < 1; i++) {}
}

let arr: string[] = ['arr', 'ar'];
```

Examples of **correct** code for the `"never"` option:

```ts
function foo() {
  var bar: number;
  let baz: number;
  const buzz: number = 1;
}
```

The `"never"` option ignores `const` variable initializations.

### ignoreForLoopInit

Examples of **correct** code for the `"never", { "ignoreForLoopInit": true }` options:

```ts
/*eslint @typescript-eslint/init-declarations: ["error", "never", { "ignoreForLoopInit": true }]*/

for (var i: number = 0; i < 1; i++) {}
```

## When Not To Use It

When you are indifferent as to how your variables are initialized.

This rule is fully compatible with base rule

<sup>Taken with ❤️ [from ESLint core](https://github.com/eslint/eslint/blob/master/docs/rules/init-declarations.md)</sup>
