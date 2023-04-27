---
description: 'Enforce using concise optional chain expressions instead of chained logical ands, negated logical ors, or empty objects.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/prefer-optional-chain** for documentation.

`?.` optional chain expressions provide `undefined` if an object is `null` or `undefined`.
Because the optional chain operator _only_ chains when the property value is `null` or `undefined`, it is much safer than relying upon logical AND operator chaining `&&`; which chains on any _truthy_ value.
It is also often less code to use `?.` optional chaining than `&&` truthiness checks.

This rule reports on code where an `&&` operator can be safely replaced with `?.` optional chaining.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
foo && foo.a && foo.a.b && foo.a.b.c;
foo && foo['a'] && foo['a'].b && foo['a'].b.c;
foo && foo.a && foo.a.b && foo.a.b.method && foo.a.b.method();

// With empty objects
(((foo || {}).a || {}).b || {}).c;
(((foo || {})['a'] || {}).b || {}).c;

// With negated `or`s
!foo || !foo.bar;
!foo || !foo[bar];
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz();

// this rule also supports converting chained strict nullish checks:
foo &&
  foo.a != null &&
  foo.a.b !== null &&
  foo.a.b.c != undefined &&
  foo.a.b.c.d !== undefined &&
  foo.a.b.c.d.e;
```

### ✅ Correct

```ts
foo?.a?.b?.c;
foo?.['a']?.b?.c;
foo?.a?.b?.method?.();

foo?.a?.b?.c?.d?.e;

!foo?.bar;
!foo?.[bar];
!foo?.bar?.baz?.();
```

<!--/tabs-->

## Options

In the context of the descriptions below a "loose boolean" operand is any operand that implicitly coerces the value to a boolean.
Specifically the argument of the not operator (`!loose`) or a bare value in a logical expression (`loose && looser`).

### `checkAny`

When this option is `true` the rule will check operands that are typed as `any` when inspecting "loose boolean" operands.

<!--tabs-->

#### ❌ Incorrect for `checkAny: true`

```ts
declare const thing: any;

thing && thing.toString();
```

#### ✅ Correct for `checkAny: false`

```ts
declare const thing: any;

thing && thing.toString();
```

<!--/tabs-->

### `checkUnknown`

When this option is `true` the rule will check operands that are typed as `unknown` when inspecting "loose boolean" operands.

<!--tabs-->

#### ❌ Incorrect for `checkUnknown: true`

```ts
declare const thing: unknown;

thing && thing.toString();
```

#### ✅ Correct for `checkUnknown: false`

```ts
declare const thing: unknown;

thing && thing.toString();
```

<!--/tabs-->

### `checkString`

When this option is `true` the rule will check operands that are typed as `string` when inspecting "loose boolean" operands.

<!--tabs-->

#### ❌ Incorrect for `checkString: true`

```ts
declare const thing: string;

thing && thing.toString();
```

#### ✅ Correct for `checkString: false`

```ts
declare const thing: string;

thing && thing.toString();
```

<!--/tabs-->

### `checkNumber`

When this option is `true` the rule will check operands that are typed as `number` when inspecting "loose boolean" operands.

<!--tabs-->

#### ❌ Incorrect for `checkNumber: true`

```ts
declare const thing: number;

thing && thing.toString();
```

#### ✅ Correct for `checkNumber: false`

```ts
declare const thing: number;

thing && thing.toString();
```

<!--/tabs-->

### `checkBoolean`

When this option is `true` the rule will check operands that are typed as `boolean` when inspecting "loose boolean" operands.

<!--tabs-->

#### ❌ Incorrect for `checkBoolean: true`

```ts
declare const thing: boolean;

thing && thing.toString();
```

#### ✅ Correct for `checkBoolean: false`

```ts
declare const thing: boolean;

thing && thing.toString();
```

<!--/tabs-->

### `checkBigInt`

When this option is `true` the rule will check operands that are typed as `bigint` when inspecting "loose boolean" operands.

<!--tabs-->

#### ❌ Incorrect for `checkBigInt: true`

```ts
declare const thing: bigint;

thing && thing.toString();
```

#### ✅ Correct for `checkBigInt: false`

```ts
declare const thing: bigint;

thing && thing.toString();
```

<!--/tabs-->

### `requireNullish`

When this option is `true` the rule will skip operands that are not typed with `null` and/or `undefined` when inspecting "loose boolean" operands.

<!--tabs-->

#### ❌ Incorrect for `requireNullish: true`

```ts
declare const thing1: string | null;
thing1 && thing1.toString();
```

#### ✅ Correct for `requireNullish: true`

```ts
declare const thing1: string | null;
thing1?.toString();

declare const thing2: string;
thing2 && thing2.toString();
```

<!--/tabs-->

## When Not To Use It

If you don't mind using more explicit `&&`s, you don't need this rule.

## Further Reading

- [TypeScript 3.7 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html)
- [Optional Chaining Proposal](https://github.com/tc39/proposal-optional-chaining/)
