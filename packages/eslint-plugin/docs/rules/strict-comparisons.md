# Only allow comparisons between primitive types. (strict-comparison)

This rule disallows comparisons between any non-primitive types. It also disables ordering comparisons between strings.

Using `>` `<` `>=` `<=` to compare strings is often a mistake, but can be allowed using the `allowStringOrderComparison` option.

By default, any comparisons between objects are not allowed. Objects are compared by reference, and in many cases this is not what
the developer wanted. This can be allowed by using the `allowObjectEqualComparison` option.

A couple of errors that would be caught by this rule:

<!-- prettier-ignore -->
```ts
if (true > false) {} // Not allowed
if (2 > undefined) {} // Not allowed
if ({} > {}) {} // Not allowed

if ('' > '') {} // This can be allowed by using the "allowStringOrderComparison" option.

// The following expressions are invalid by default, but can be allowed by using the "allowObjectEqualComparison" option
if ({} === {}) {} // Not allowed
if ([] === []) {} // Not allowed
if ({} === undefined) {} // Not allowed

const date1 = new Date(1550971894640)
const date2 = new Date(1550971894640)
if (date1 === date2) {} // Not allowed

function sameObject<T>(a: T, b: T): boolean {
    return a === b; // Not allowed
}
```

## Rule Details

This rule aims to enforce typesafe comparisons.

## Options

This rule has an object option:

- `"allowObjectEqualComparison": false`, allows `!=` `==` `!==` `===` comparison between objects.
- `"allowStringOrderComparison": false`, allows `>` `<` `>=` `<=` comparison between strings.

### defaults

Examples of **incorrect** code for this rule with no options:

<!-- prettier-ignore -->
```ts
const object1 = {};
const object2 = {};

if (object1 === object2) {} // Not allowed to compare objects by reference without "allowObjectEqualComparison" option.
if (object1 > object2) {} // Not allowed to compare objects using an ordering operator.
```

Examples of **correct** code for this rule with no options at all:

<!-- prettier-ignore -->
```ts
const object1 = {};
const object2 = {};
if (isEqual(object1, object2)) {}
```

### allowObjectEqualComparison

Examples of **correct** code for this rule with `{ "allowObjectEqualComparison": true }`:

<!-- prettier-ignore -->
```ts
const object1 = {};
const object2 = {};
if (object1 === object2) {}
```

### allowStringOrderComparison

Examples of **correct** code for this rule with `{ "allowStringOrderComparison": true }` options:

<!-- prettier-ignore -->
```ts
if ('a' < 'b') {}
```

## When Not To Use It

If you know you want to compare objects by reference, you can safely turn this rule off.
