# Disallows assigning unsafe types to variables and properties (`no-unsafe-assignment`)

Despite your best intentions, unsafe types (such as `any` and `never`) type can sometimes leak into your codebase.
Assigning an `any` typed value to a variable can be hard to pick up on, particularly if it leaks in from an external library. Operations on the variable will not be checked at all by TypeScript, so it creates a potential safety hole, and source of bugs in your codebase.
A `never` type is almost always an unsafe action and is often the result of a variable's type being narrowed down to `never`. This often indicates a code path which is unreachable.

## Rule Details

This rule disallows assigning `any` or `never` to a variable, and assigning `any[]` or `never[]` to an array destructuring.
This rule also compares the assigned type to the variable's type to ensure you don't assign an unsafe `any` or `never` in a generic position to a receiver that's expecting a specific type. For example, it will error if you assign `Set<any>` to a variable declared as `Set<string>`.

Examples of **incorrect** code for this rule:

```ts
const x = 1 as any,
  y = 1 as any,
  z = 1 as never;
const [x] = 1 as any;
const [x] = [] as any[];
const [x] = [1 as any];
[x] = [1] as [any];

function foo(a = 1 as any) {}
class Foo {
  constructor(private a = 1 as any) {}
}
class Foo {
  private a = 1 as any;
}

// type narrowing
const x = 1;
if (typeof x === 'string') {
  const y = x; // x is now `never`
}

// generic position examples
const x: Set<string> = new Set<any>();
const x: Set<string> = new Set<never>();
const x: Map<string, string> = new Map<string, any>();
const x: Set<string[]> = new Set<any[]>();
const x: Set<Set<Set<string>>> = new Set<Set<Set<any>>>();
```

Examples of **correct** code for this rule:

```ts
const x = 1,
  y = 1;
const [x] = [1];
[x] = [1] as [number];

function foo(a = 1) {}
class Foo {
  constructor(private a = 1) {}
}
class Foo {
  private a = 1;
}

// type narrowing
const x = 1;
if (typeof x === 'number') {
  const y = x; // x is still `number`
}

// generic position examples
const x: Set<string> = new Set<string>();
const x: Map<string, string> = new Map<string, string>();
const x: Set<string[]> = new Set<string[]>();
const x: Set<Set<Set<string>>> = new Set<Set<Set<string>>>();
```

There are cases where the rule allows assignment of `any` to `unknown`.

Example of `any` to `unknown` assignment that are allowed.

```ts
const x: unknown = y as any;
const x: unknown[] = y as any[];
const x: Set<unknown> = y as Set<any>;
```

## Related to

- [`no-explicit-any`](./no-explicit-any.md)
- TSLint: [`no-unsafe-any`](https://palantir.github.io/tslint/rules/no-unsafe-any/)
