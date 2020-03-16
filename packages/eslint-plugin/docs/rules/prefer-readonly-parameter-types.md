# Requires that function parameters are typed as readonly to prevent accidental mutation of inputs (`prefer-readonly-parameter-types`)

Mutating function arguments can lead to confusing, hard to debug behavior.
Whilst it's easy to implicitly remember to not modify function arguments, explicitly typing arguments as readonly provides clear contract to consumers.
This contract makes it easier for a consumer to reason about if a function has side-effects.

## Rule Details

This rule allows you to enforce that function parameters resolve to readonly types.
A type is considered readonly if:

- it is a primitive type (`string`, `number`, `boolean`, `symbol`, or an enum),
- it is a function signature type,
- it is a readonly array type whose element type is considered readonly.
- it is a readonly tuple type whose elements are all considered readonly.
- it is an object type whose properties are all marked as readonly, and whose values are all considered readonly.

Examples of **incorrect** code for this rule:

```ts
function array1(arg: string[]) {} // array is not readonly
function array2(arg: readonly string[][]) {} // array element is not readonly
function array3(arg: [string, number]) {} // tuple is not readonly
function array4(arg: readonly [string[], number]) {} // tuple element is not readonly
// the above examples work the same if you use ReadonlyArray<T> instead

function object1(arg: { prop: string }) {} // property is not readonly
function object2(arg: { readonly prop: string; prop2: string }) {} // not all properties are readonly
function object3(arg: { readonly prop: { prop2: string } }) {} // nested property is not readonly
// the above examples work the same if you use Readonly<T> instead

interface CustomArrayType extends ReadonlyArray<string> {
  prop: string; // note: this property is mutable
}
function custom1(arg: CustomArrayType) {}

interface CustomFunction {
  (): void;
  prop: string; // note: this property is mutable
}
function custom2(arg: CustomFunction) {}

function union(arg: string[] | ReadonlyArray<number[]>) {} // not all types are readonly

// rule also checks function types
interface Foo {
  (arg: string[]): void;
}
interface Foo {
  new (arg: string[]): void;
}
const x = { foo(arg: string[]): void; };
function foo(arg: string[]);
type Foo = (arg: string[]) => void;
interface Foo {
  foo(arg: string[]): void;
}
```

Examples of **correct** code for this rule:

```ts
function array1(arg: readonly string[]) {}
function array2(arg: readonly (readonly string[])[]) {}
function array3(arg: readonly [string, number]) {}
function array4(arg: readonly [readonly string[], number]) {}
// the above examples work the same if you use ReadonlyArray<T> instead

function object1(arg: { readonly prop: string }) {}
function object2(arg: { readonly prop: string; readonly prop2: string }) {}
function object3(arg: { readonly prop: { readonly prop2: string } }) {}
// the above examples work the same if you use Readonly<T> instead

interface CustomArrayType extends ReadonlyArray<string> {
  readonly prop: string;
}
function custom1(arg: CustomArrayType) {}

interface CustomFunction {
  (): void;
  readonly prop: string;
}
function custom2(arg: CustomFunction) {}

function union(arg: readonly string[] | ReadonlyArray<number[]>) {}

function primitive1(arg: string) {}
function primitive2(arg: number) {}
function primitive3(arg: boolean) {}
function primitive4(arg: unknown) {}
function primitive5(arg: null) {}
function primitive6(arg: undefined) {}
function primitive7(arg: any) {}
function primitive8(arg: never) {}
function primitive9(arg: string | number | undefined) {}

function fnSig(arg: () => void) {}

enum Foo { a, b }
function enum(arg: Foo) {}

function symb1(arg: symbol) {}
const customSymbol = Symbol('a');
function symb2(arg: typeof customSymbol) {}

// function types
interface Foo {
  (arg: readonly string[]): void;
}
interface Foo {
  new (arg: readonly string[]): void;
}
const x = { foo(arg: readonly string[]): void; };
function foo(arg: readonly string[]);
type Foo = (arg: readonly string[]) => void;
interface Foo {
  foo(arg: readonly string[]): void;
}
```

## Options

```ts
interface Options {
  checkParameterProperties?: boolean;
}

const defaultOptions: Options = {
  checkParameterProperties: true,
};
```

### `checkParameterProperties`

This option allows you to enable or disable the checking of parameter properties.
Because parameter properties create properties on the class, it may be undesirable to force them to be readonly.

Examples of **incorrect** code for this rule with `{checkParameterProperties: true}`:

```ts
class Foo {
  constructor(private paramProp: string[]) {}
}
```

Examples of **correct** code for this rule with `{checkParameterProperties: true}`:

```ts
class Foo {
  constructor(private paramProp: readonly string[]) {}
}
```

Examples of **correct** code for this rule with `{checkParameterProperties: false}`:

```ts
class Foo {
  constructor(
    private paramProp1: string[],
    private paramProp2: readonly string[],
  ) {}
}
```
