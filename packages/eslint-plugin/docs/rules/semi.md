# require or disallow semicolons instead of ASI (semi)

This rule enforces consistent use of semicolons.

## Rule Details

This rule extends the base [eslint/semi](https://eslint.org/docs/rules/semi) rule.
It supports all options and features of the base rule plus TS type assertions.

## How to use

```cjson
{
    // note you must disable the base rule as it can report incorrect errors
    "semi": "off",
    "@typescript-eslint/semi": ["error"]
}
```

## Options

See [eslint/semi options](https://eslint.org/docs/rules/semi#options).

### always

Examples of **incorrect** TS code for this rule with the default `"always"` option:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/semi: "error"*/
type Foo = {}

class PanCamera extends FreeCamera {
  public invertY: boolean = false
}
```

Examples of **correct** TS code for this rule with the default `"always"` option:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/semi: "error"*/
type Foo = {};

class PanCamera extends FreeCamera {
  public invertY: boolean = false;
}
```

### never

Examples of **incorrect** TS code for this rule with the `"never"` option:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/semi: ["error", "never"]*/
type Foo = {};

class PanCamera extends FreeCamera {
  public invertY: boolean = false;
}
```

Examples of **correct** TS code for this rule with the `"never"` option:

<!-- prettier-ignore -->
```ts
/*eslint @typescript-eslint/semi: ["error", "never"]*/
type Foo = {}

class PanCamera extends FreeCamera {
  public invertY: boolean = false
}
```
