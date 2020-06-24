# Flags unnecessary equality comparisons against boolean literals (`no-unnecessary-boolean-literal-compare`)

Comparing boolean values to boolean literals is unnecessary, those comparisons result in the same booleans. Using the boolean values directly, or via a unary negation (`!value`), is more concise and clearer.

## Rule Details

This rule ensures that you do not include unnecessary comparisons with boolean literals.
A comparison is considered unnecessary if it checks a boolean literal against any expression with just the `boolean` type.
A comparison is **_not_** considered unnecessary if the type is a union of booleans (`string | boolean`, `someObject | boolean`).

**Note**: Throughout this page, only strict equality (`===` and `!==`) are
used in the examples. However, the implementation of the rule does not
distinguish between strict and loose equality. Any example below that uses
`===` would be treated the same way if `==` was used, and any example below
that uses `!==` would be treated the same way if `!=` was used.

Examples of **incorrect** code for this rule:

```ts
declare const someCondition: boolean;
if (someCondition === true) {
}
```

Examples of **correct** code for this rule

```ts
declare const someCondition: boolean;
if (someCondition) {
}

declare const someObjectBoolean: boolean | Record<string, unknown>;
if (someObjectBoolean === true) {
}

declare const someStringBoolean: boolean | string;
if (someStringBoolean === true) {
}
```

## Options

The rule accepts an options object with the following properties.

```ts
type Options = {
  // if false, comparisons between a nullable boolean expression to `true` will be checked and fixed
  allowComparingNullableBooleansToTrue?: boolean;
  // if false, comparisons between a nullable boolean expression to `false` will be checked and fixed
  allowComparingNullableBooleansToFalse?: boolean;
  // if defined, comparisons between a nullable boolean expression to boolean literals are replaced
  // with a preceeding null/undefined check
  fixWithExplicitNullishCheck?: {
    // whether the check should be against null or undefined.
    // since loose equality (==, !=) is used for this check, this is just a style choice.
    nullishSymbol: 'null' | 'undefined';
  };
};
```

### Defaults

This rule always checks comparisons between a boolean expression and a boolean
literal. Comparisons between nullable boolean expressions and boolean literals
are **not** checked by default.

```ts
const defaults = {
  allowComparingNullableBooleansToTrue: true,
  allowComparingNullableBooleansToFalse: true,
  fixWithExplicitNullishCheck: undefined,
};
```

### `allowComparingNullableBooleansToTrue`

Examples of **incorrect** code for this rule with `{ allowComparingNullableBooleansToTrue: false }`:

```ts
declare const someUndefinedCondition: boolean | undefined;
if (someUndefinedCondition === true) {
}

declare const someNullCondition: boolean | null;
if (someNullCondition !== true) {
}
```

Examples of **correct** code for this rule with `{ allowComparingNullableBooleansToTrue: false }`:

```ts
declare const someUndefinedCondition: boolean | undefined;
if (someUndefinedCondition) {
}

declare const someNullCondition: boolean | null;
if (!someNullCondition) {
}
```

### `allowComparingNullableBooleansToFalse`

Examples of **incorrect** code for this rule with `{ allowComparingNullableBooleansToFalse: false }`:

```ts
declare const someUndefinedCondition: boolean | undefined;
if (someUndefinedCondition === false) {
}

declare const someNullCondition: boolean | null;
if (someNullCondition !== false) {
}
```

Examples of **correct** code for this rule with `{ allowComparingNullableBooleansToFalse: false }`:

```ts
declare const someUndefinedCondition: boolean | undefined;
if (someUndefinedCondition ?? true) {
}
if (someUndefinedCondition != null && !someUndefinedCondition) {
}

declare const someNullCondition: boolean | null;
if (!(someNullCondition ?? true)) {
}
if (someNullCondition == undefined || someNullCondition) {
}
```

## Fixer

### Boolean Expressions

The follow table shows the output of the fixer on comparisons that compare a boolean expression to a boolean literal.

|       Comparison       | Fixer Output      |
| :--------------------: | ----------------- |
| `booleanVar === true`  | `booleanLiteral`  |
| `booleanVar !== true`  | `!booleanLiteral` |
| `booleanVar === false` | `!booleanLiteral` |
| `booleanVar !== false` | `booleanLiteral`  |

### Nullable Boolean Expressions

The follow table shows the output of the fixer on comparisons that compare a boolean expression to a boolean literal when the `fixWithExplicitNullishCheck` option is `undefined`:

|           Comparison           | Fixer Output                    | Notes                                                                               |
| :----------------------------: | ------------------------------- | ----------------------------------------------------------------------------------- |
| `nullableBooleanVar === true`  | `nullableBooleanVar`            | Only checked/fixed if the `allowComparingNullableBooleansToTrue` option is `false`  |
| `nullableBooleanVar !== true`  | `!nullableBooleanVar`           | Only checked/fixed if the `allowComparingNullableBooleansToTrue` option is `false`  |
| `nullableBooleanVar === false` | `nullableBooleanVar ?? true`    | Only checked/fixed if the `allowComparingNullableBooleansToFalse` option is `false` |
| `nullableBooleanVar !== false` | `!(nullableBooleanVar ?? true)` | Only checked/fixed if the `allowComparingNullableBooleansToFalse` option is `false` |

The follow table shows the output of the fixer on comparisons that compare a boolean expression to a boolean literal when the `fixWithExplicitNullishCheck` option is `{ nullishSymbol: "null" }`:

|           Comparison           | Fixer Output                                          | Notes                                                                               |
| :----------------------------: | ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `nullableBooleanVar === true`  | `nullableBooleanVar != null && nullableBooleanVar`    | Only checked/fixed if the `allowComparingNullableBooleansToTrue` option is `false`  |
| `nullableBooleanVar !== true`  | `nullableBooleanVar == null \|\| !nullableBooleanVar` | Only checked/fixed if the `allowComparingNullableBooleansToTrue` option is `false`  |
| `nullableBooleanVar === false` | `nullableBooleanVar != null && !nullableBooleanVar`   | Only checked/fixed if the `allowComparingNullableBooleansToFalse` option is `false` |
| `nullableBooleanVar !== false` | `nullableBooleanVar == null \|\| nullableBooleanVar`  | Only checked/fixed if the `allowComparingNullableBooleansToFalse` option is `false` |

## Related to

- TSLint: [no-boolean-literal-compare](https://palantir.github.io/tslint/rules/no-boolean-literal-compare)
