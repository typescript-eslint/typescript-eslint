# Use function types instead of interfaces with call signatures (`prefer-function-type`)

## Rule Details

This rule suggests using a function type instead of an interface or object type literal with a single call signature.

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
interface Foo {
  (): string;
}
```

```ts
function foo(bar: { (): number }): number {
  return bar();
}
```

```ts
interface Foo extends Function {
  (): void;
}
```

```ts
interface MixinMethod {
  // returns the function itself, not the `this` argument.
  (arg: string): this;
}
```

### ✅ Correct

```ts
interface Foo {
  (): void;
  bar: number;
}
```

```ts
function foo(bar: { (): string; baz: number }): string {
  return bar();
}
```

```ts
interface Foo {
  bar: string;
}
interface Bar extends Foo {
  (): void;
}
```

```ts
// returns the `this` argument of function, retaining it's type.
type MixinMethod = <TSelf>(this: TSelf, arg: string) => TSelf;
// a function that returns itself is much clearer in this form.
type ReturnsSelf = (arg: string) => ReturnsSelf;
```

```ts
// multiple call signatures (overloads) is allowed:
interface Overloaded {
  (data: string): number;
  (id: number): string;
}
// this is equivelent to Overloaded interface.
type Intersection = ((data: string) => number) & ((id: number) => string);
```

## When Not To Use It

If you specifically want to use an interface or type literal with a single call signature for stylistic reasons, you can disable this rule.

## Further Reading

- TSLint: [`callable-types`](https://palantir.github.io/tslint/rules/callable-types/)

## Source

- Rule: [prefer-function-type.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/prefer-function-type.ts)
- Documentation: [prefer-function-type.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-function-type.md)
- Tests: [prefer-function-type.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/prefer-function-type.test.ts)

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [ ] 💭 Requires type information
