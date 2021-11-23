# Require that member overloads be consecutive (`adjacent-overload-signatures`)

Grouping overloaded members together can improve readability of the code.

## Rule Details

This rule aims to standardize the way overloaded members are organized.

<!--tabs-->

### ❌ Incorrect

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
};

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

export function foo(s: string): void;
export function foo(n: number): void;
export function bar(): void;
export function foo(sn: string | number): void;
```

### ✅ Correct

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
};

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

export function bar(): void;
export function foo(s: string): void;
export function foo(n: number): void;
export function foo(sn: string | number): void;
```

## When Not To Use It

If you don't care about the general structure of the code, then you will not need this rule.

## Related To

- TSLint: [adjacent-overload-signatures](https://palantir.github.io/tslint/rules/adjacent-overload-signatures/)

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information

### Source

- Rule: [adjacent-overload-signatures.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/adjacent-overload-signatures.ts)
- Documentation: [adjacent-overload-signatures.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/adjacent-overload-signatures.md)
- Tests: [adjacent-overload-signatures.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/adjacent-overload-signatures.test.ts)
