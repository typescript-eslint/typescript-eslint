# When adding two variables, operands must both be of type number or of type string. (restrict-plus-operands)

Examples of **correct** code:

```ts
var foo = parseInt('5.5', 10) + 10;
var foo = 1n + 1n;
```

Examples of **incorrect** code:

```ts
var foo = '5.5' + 5;
var foo = 1n + 1;
```

## Options

Options may be provided as an object with:

- `allowAny` to ignore this rule when either left or
  right of plus operand is a type `any`

```json
{
  "@typescript-eslint/estrict-plus-operands": [
    "error",
    {
      "allowAny": true
    }
  ]
}
```

### allowAny

If the rule is too strict then making this option `true`
can be a help. Though It is not recommended since lint errors are potentially a real runtime errors in many cases.

Examples of **correct** code for this rule with `{ allowAny: true`:

```ts
const x = (a: any, b: string) => a + b;
const y = (a: boolean, b: any) => a + b;
```

## Compatibility

- TSLint: [restrict-plus-operands](https://palantir.github.io/tslint/rules/restrict-plus-operands/)
