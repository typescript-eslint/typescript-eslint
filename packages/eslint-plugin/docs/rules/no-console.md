# Disallow the use of specified `console` methods(@typescript-eslint/no-console)

Using various methods of `console` is a very useful tools for debugging while developing, but it may not be the case for the production especially when targeting Browser environment.

## Rule Details

This rule aims to disallow any `console` methods by default, but with the allow options, you can specify any methods that you want to use.

Examples of **incorrect** code for this rule by **default**

```ts
// Any usages of `console` methods
console.log('By default, it is not allowed');
console.warn('By default, it is not allowed');
```

Examples of **incorrect** code for this rule with **options**

```ts
// ["error", { "allow": ["warn"]}]
// Only 'warn' method can be used.
console.log("Only 'warn' is allowed thus error for 'log' method");
```

Examples of **correct** code for this rule

```ts
// ["error", { "allow": ["info"]}]
// Only 'info' method can be used.
console.info('It is allowed through options thus no error');
```

## Options

Specify the method name you want to allow. Your custom method attached to `console`
is also affected by this rule.

```CJSON
{
    "@typescript-eslint/no-console": ["error", {
        "allow": ["log", "warn", "CustomMethod"]
    }]
}
```

## When Not To Use It

If you are targeting Node.js, it would not be useful enabling this rule since outputting some messages using `console` methods can be useful in both development and production.

## Related to

- ESLint: [no-console](https://eslint.org/docs/rules/no-console)
