# When adding two variables, operands must both be of type number or of type string. (restrict-plus-operands)

Examples of **correct** code:

```ts
var foo = parseInt('5.5', 10) + 10;
```

Examples of **incorrect** code:

```ts
var foo = '5.5' + 5;
```

## Options

```json
{
  "@typescript-eslint/restrict-plus-operands": "error"
}
```

## Compatibility

- TSLint: [restrict-plus-operands](https://palantir.github.io/tslint/rules/restrict-plus-operands/)
