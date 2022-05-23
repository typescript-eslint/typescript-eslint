# `no-extraneous-class`

Forbids the use of classes as namespaces.

This rule warns when a class has no non-static members, such as for a class used exclusively as a static namespace.

## Rule Details

Users who come from a [OOP](https://en.wikipedia.org/wiki/Object-oriented_programming) paradigm may wrap their utility functions in an extra class, instead of putting them at the top level of an ECMAScript module.
Doing so is generally unnecessary in JavaScript and TypeScript projects.

- Wrapper classes add extra runtime bloat and cognitive complexity to code without adding any structural improvements
  - Whatever would be put on them, such as utility functions, are already organized by virtue of being in a module.
  - As an alternative, you can always `import * as ...` the module to get all of them in a single object.
- IDEs can't provide as good autocompletions when you start typing the names of the helpers, since they're on a class instead of freely available to import
- It's more difficult to statically analyze code for unused variables, etc. when they're all on the class (see: [Finding dead code (and dead types) in TypeScript](https://effectivetypescript.com/2020/10/20/tsprune)).

This rule also flags classes that have only a constructor and no fields.
Those classes can generally be replaced with a standalone function.

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
class StaticConstants {
  static readonly version = 42;

  static isProduction() {
    return process.env.NODE_ENV === 'production';
  }
}

class HelloWorldLogger {
  constructor() {
    console.log('Hello, world!');
  }
}
```

### ✅ Correct

```ts
export const version = 42;

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function logHelloWorld() {
  console.log('Hello, world!');
}
```

## Options

This rule accepts a single object option.

```ts
type Options = {
  // allow extraneous classes if they only contain a constructor
  allowConstructorOnly?: boolean;
  // allow extraneous classes if they have no body (i.e. are empty)
  allowEmpty?: boolean;
  // allow extraneous classes if they only contain static members
  allowStaticOnly?: boolean;
  // allow extraneous classes if they have a decorator
  allowWithDecorator?: boolean;
};

const defaultOptions: Options = {
  allowConstructorOnly: false,
  allowEmpty: false,
  allowStaticOnly: false,
  allowWithDecorator: false,
};
```

This rule normally bans classes that are empty (have no constructor or fields).
The rule's options each add an exemption for a specific type of class.

### `allowConstructorOnly`

`allowConstructorOnly` adds an exemption for classes that have only a constructor and no fields.

<!--tabs-->

#### ❌ Incorrect

```ts
class NoFields {}
```

#### ✅ Correct

```ts
class NoFields {
  constructor() {
    console.log('Hello, world!');
  }
}
```

### `allowEmpty`

The `allowEmpty` option adds an exemption for classes that are entirely empty.

<!--tabs-->

#### ❌ Incorrect

```ts
class NoFields {
  constructor() {
    console.log('Hello, world!');
  }
}
```

#### ✅ Correct

```ts
class NoFields {}
```

### `allowStaticOnly`

The `allowStaticOnly` option adds an exemption for classes that only contain static members.

:::caution
We strongly recommend against the `allowStaticOnly` exemption.
It works against this rule's primary purpose of discouraging classes used only for static members.
:::

<!--tabs-->

#### ❌ Incorrect

```ts
class EmptyClass {}
```

#### ✅ Correct

```ts
class NotEmptyClass {
  static version = 42;
}
```

### `allowWithDecorator`

The `allowWithDecorator` option adds an exemption for classes that contain a member decorated with a `@` decorator.

<!--tabs-->

#### ❌ Incorrect

```ts
class Constants {
  static readonly version = 42;
}
```

#### ✅ Correct

```ts
class Constants {
  @logOnRead()
  static readonly version = 42;
}
```

## When Not To Use It

You can disable this rule if you are unable -or unwilling- to switch off using classes as namespaces.

## Related To

[`no-unnecessary-class`](https://palantir.github.io/tslint/rules/no-unnecessary-class) from TSLint

## Attributes

- Configs:
  - [ ] ✅ Recommended
  - [x] 🔒 Strict
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
