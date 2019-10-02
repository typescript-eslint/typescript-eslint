# Require type annotations to exist (typedef)

TypeScript cannot always infer types for all places in code.
Some locations require type annotations for their types to be inferred.

```ts
class ContainsText {
  // There must be a type annotation here to infer the type
  delayedText: string;

  // `typedef` requires a type annotation here to maintain consistency
  immediateTextExplicit: string = 'text';

  // This is still a string type because of its initial value
  immediateTextImplicit = 'text';
}
```

> Note: requiring type annotations unnecessarily can be cumbersome to maintain and generally reduces code readability.
> TypeScript is often better at inferring types than easily written type annotations would allow.
> Instead of enabling `typedef`, it is generally recommended to use the `--noImplicitAny` and/or `--strictPropertyInitialization` compiler options to enforce type annotations only when useful.

## Rule Details

This rule can enforce type annotations in locations regardless of whether they're required.
This is typically used to maintain consistency for element types that sometimes require them.

> To enforce type definitions existing on call signatures as per TSLint's `arrow-call-signature` and `call-signature` options, use `explicit-function-return-type`.

## Options

This rule has an object option that may receive any of the following as booleans:

- `"arrayDestructuring"`
- `"arrowParameter"`: `true` by default
- `"memberVariableDeclaration"`: `true` by default
- `"objectDestructuring"`
- `"parameter"`: `true` by default
- `"propertyDeclaration"`: `true` by default
- `"variableDeclaration"`

For example, with the following configuration:

```json
{
  "rules": {
    "@typescript-eslint/typedef": [
      "error",
      {
        "arrowParameter": false,
        "variableDeclaration": true
      }
    ]
  }
}
```

- Type annotations on arrow function parameters are not required
- Type annotations on variables are required
- Options otherwise adhere to the defaults

### arrayDestructuring

Whether to enforce type annotations on variables declared using array destructuring.

Examples of **incorrect** code with `{ "arrayDestructuring": true }`:

```ts
const [a] = [1];
const [b, c] = [1, 2];
```

Examples of **correct** code with `{ "arrayDestructuring": true }`:

```ts
const [a]: number[] = [1];
const [b]: [number] = [2];
const [c, d]: [boolean, string] = [true, 'text'];
```

### arrowParameter

Whether to enforce type annotations for parameters of arrow functions.

Examples of **incorrect** code with `{ "arrowParameter": true }`:

```ts
const logsSize = size => console.log(size);

['hello', 'world'].map(text => text.length);

const mapper = {
  map: text => text + '...',
};
```

Examples of **correct** code with `{ "arrowParameter": true }`:

```ts
const logsSize = (size: number) => console.log(text);

['hello', 'world'].map((text: string) => text.length);

const mapper = {
  map: (text: string) => text + '...',
};
```

### memberVariableDeclaration

Whether to enforce type annotations on member variables of classes.

Examples of **incorrect** code with `{ "memberVariableDeclaration": true }`:

```ts
class ContainsText {
  delayedText;
  immediateTextImplicit = 'text';
}
```

Examples of **correct** code with `{ "memberVariableDeclaration": true }`:

```ts
class ContainsText {
  delayedText: string;
  immediateTextImplicit: string = 'text';
}
```

### objectDestructuring

Whether to enforce type annotations on variables declared using object destructuring.

Examples of **incorrect** code with `{ "objectDestructuring": true }`:

```ts
const { length } = 'text';
const [b, c] = Math.random() ? [1, 2] : [3, 4];
```

Examples of **correct** code with `{ "objectDestructuring": true }`:

```ts
const { length }: { length: number } = 'text';
const [b, c]: [number, number] = Math.random() ? [1, 2] : [3, 4];
```

### parameter

Whether to enforce type annotations for parameters of functions and methods.

Examples of **incorrect** code with `{ "parameter": true }`:

```ts
function logsSize(size): void {
  console.log(size);
}

const doublesSize = function(size): numeber {
  return size * 2;
};

const divider = {
  curriesSize(size): number {
    return size;
  },
  dividesSize: function(size): number {
    return size / 2;
  },
};

class Logger {
  log(text): boolean {
    console.log('>', text);
    return true;
  }
}
```

Examples of **correct** code with `{ "parameter": true }`:

```ts
function logsSize(size: number): void {
  console.log(size);
}

const doublesSize = function(size: number): numeber {
  return size * 2;
};

const divider = {
  curriesSize(size: number): number {
    return size;
  },
  dividesSize: function(size: number): number {
    return size / 2;
  },
};

class Logger {
  log(text: boolean): boolean {
    console.log('>', text);
    return true;
  }
}
```

### propertyDeclaration

Whether to enforce type annotations for properties of interfaces and types.

Examples of **incorrect** code with `{ "propertyDeclaration": true }`:

```ts
type Members = {
  member;
  otherMember;
};
```

Examples of **correct** code with `{ "propertyDeclaration": true }`:

```ts
type Members = {
  member: boolean;
  otherMember: string;
};
```

### variableDeclaration

Whether to enforce type annotations for variable declarations, excluding array and object destructuring.

Examples of **incorrect** code with `{ "variableDeclaration": true }`:

```ts
const text = 'text';
let initialText = 'text';
let delayedText;
```

Examples of **correct** code with `{ "variableDeclaration": true }`:

```ts
const text: string = 'text';
let initialText: string = 'text';
let delayedText: string;
```

## When Not To Use It

If you are using stricter TypeScript compiler options, particularly `--noImplicitAny` and/or `--strictPropertyInitialization`, you likely don't need this rule.

In general, if you do not consider the cost of writing unnecessary type annotations reasonable, then do not use this rule.

## Further Reading

- [TypeScript Type System](https://basarat.gitbooks.io/typescript/docs/types/type-system.html)
- [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)

## Compatibility

- TSLint: [typedef](https://palantir.github.io/tslint/rules/typedef)
