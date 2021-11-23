# Enforces that type arguments will not be used if not required (`no-unnecessary-type-arguments`)

Warns if an explicitly specified type argument is the default for that type parameter.

## Rule Details

Type parameters in TypeScript may specify a default value.
For example:

```ts
function f<T = number>() {}
```

It is redundant to provide an explicit type parameter equal to that default.

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
function f<T = number>() {}
f<number>();

function g<T = number, U = string>() {}
g<string, string>();

class C<T = number> {}
function h(c: C<number>) {}
new C<number>();
class D extends C<number> {}

interface I<T = number> {}
class Impl implements I<number> {}
```

### ✅ Correct

```ts
function f<T = number>() {}
f<string>();

function g<T = number, U = string>() {}
g<number, number>();

class C<T = number> {}
new C<string>();
class D extends C<string> {}

interface I<T = number> {}
class Impl implements I<string> {}
```

## Related To

- TSLint: [use-default-type-parameter](https://palantir.github.io/tslint/rules/use-default-type-parameter)

## Attributes

- [ ] ✅ Recommended
- [x] 🔧 Fixable
- [x] 💭 Requires type information

### Source

- Rule: [no-unnecessary-type-arguments.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/no-unnecessary-type-arguments.ts)
- Documentation: [no-unnecessary-type-arguments.md](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-unnecessary-type-arguments.md)
- Tests: [no-unnecessary-type-arguments.test.ts](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/tests/rules/no-unnecessary-type-arguments.test.ts)
