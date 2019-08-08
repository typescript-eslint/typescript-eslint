# Checks whether the final clause of a switch statement ends in `break;`. (switch-final-break)

Examples of **correct** code:

```ts
switch (x) {
    case 0: {
        foo();
    }
}
```

Examples of **incorrect** code:

```ts
switch (x) {
    case 0: {
        foo();
        break;
    }
}
```

## Options

Can get `never` (the default) or `always` (always ends with `break;`):

```json
{
  "@typescript-eslint/switch-final-break": ["error", "always"]
}
```

## Compatibility

- TSLint: [switch-final-break](https://palantir.github.io/tslint/rules/switch-final-break/)
