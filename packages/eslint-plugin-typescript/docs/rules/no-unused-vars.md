# Prevent TypeScript-specific constructs from being erroneously flagged as unused (no-unused-vars)

It ensures that TypeScript-specific constructs, such as implemented interfaces, are not erroneously flagged as unused.

## Configuration

***This rule only has an effect when the `no-unused-vars` core rule is enabled.***

See [the core ESLint docs](https://eslint.org/docs/rules/no-unused-vars) for how to configure the base `no-unused-vars` rule.

```JSON
{
    "rules": {
        "no-unused-vars": "error",
        "typescript/no-unused-vars": "error",
    }
}
```
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
