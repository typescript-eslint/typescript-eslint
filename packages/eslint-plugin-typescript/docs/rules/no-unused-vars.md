# Prevent TypeScript-specific constructs from being erroneously flagged as unused (no-unused-vars)

This rule only has an effect when the `no-unused-vars` core rule is enabled.

It ensures that TypeScript-specific constructs, such as implemented interfaces, are not erroneously flagged as unused.

## Rule Details

The following patterns are considered warnings:

```ts
interface Foo {}
```

The following patterns are not warnings:

```js
interface Foo {}

class Bar implements Foo {}
```

## When Not To Use It

If you are not using `no-unused-vars` then you will not need this rule.
