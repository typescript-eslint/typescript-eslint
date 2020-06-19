# Flags unnecessary equality comparisons against boolean literals (`no-unnecessary-boolean-literal-compare`)

Comparing boolean values to boolean literals is unnecessary, those comparisons result in the same booleans. Using the boolean values directly, or via a unary negation (`!value`), is more concise and clearer.

## Rule Details

This rule ensures that you do not include unnecessary comparisons with boolean literals.
A comparison is considered unnecessary if it checks a boolean literal against any variable with just the `boolean` type.
A comparison is **_not_** considered unnecessary if the type is a union of booleans (`string | boolean`, `someObject | boolean`).

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

declare const someUndefinedCondition: boolean | undefined;
if (someUndefinedCondition === false) {
}
```

## Options

The rule accepts an options object with the following properties:

```ts
type Options = {
  // if true, only comparisons that compare a boolean literal to a boolean will be checked.
  // if false, comparisons that compare a boolean literal to a nullable boolean variable will also be checked
  allowComparingNullableBooleans?: boolean;
};

const defaults = {
  allowComparingNullableBooleans: true,
};
```

### `allowComparingNullableBooleans`

Examples of **incorrect** code for this rule with `{ allowComparingNullableBooleans: false }`:

```ts
declare const someUndefinedCondition: boolean | undefined;
if (someUndefinedCondition === true) {
}

declare const someNullCondition: boolean | null;
if (someNullCondition !== false) {
}
```

Examples of **correct** code for this rule with `{ allowComparingNullableBooleans: false }`:

```ts
declare const someUndefinedCondition: boolean | undefined;
if (someUndefinedCondition) {
}

declare const someNullCondition: boolean | null;
if (someNullCondition ?? true) {
}
```

## Related to

- TSLint: [no-boolean-literal-compare](https://palantir.github.io/tslint/rules/no-boolean-literal-compare)
