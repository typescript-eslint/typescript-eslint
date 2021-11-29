# When adding two variables, operands must both be of type number or of type string (`restrict-plus-operands`)

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
var foo = '5.5' + 5;
var foo = 1n + 1;
```

### ✅ Correct

```ts
var foo = parseInt('5.5', 10) + 10;
var foo = 1n + 1n;
```

## Options

This rule has an object option:

- `"checkCompoundAssignments": false`: (default) does not check compound assignments (`+=`)
- `"checkCompoundAssignments": true`

### `checkCompoundAssignments`

Examples of code for the `{ "checkCompoundAssignments": true }` option:

<!--tabs-->

#### ❌ Incorrect

```ts
/*eslint @typescript-eslint/restrict-plus-operands: ["error", { "checkCompoundAssignments": true }]*/

let foo: string | undefined;
foo += 'some data';

let bar: string = '';
bar += 0;
```

#### ✅ Correct

```ts
/*eslint @typescript-eslint/restrict-plus-operands: ["error", { "checkCompoundAssignments": true }]*/

let foo: number = 0;
foo += 1;

let bar = '';
bar += 'test';
```

## How to Use

```json
{
  "@typescript-eslint/restrict-plus-operands": "error"
}
```

## Related To

- TSLint: [restrict-plus-operands](https://palantir.github.io/tslint/rules/restrict-plus-operands/)

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
- [x] 💭 Requires type information
