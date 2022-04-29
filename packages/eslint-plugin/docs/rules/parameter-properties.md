# `parameter-properties`

Require or disallow the use of parameter properties in class constructors.

Parameter properties can be confusing to those new to TypeScript as they are less explicit than other ways
of declaring and initializing class members.

## Rule Details

This rule disallows the use of parameter properties in constructors, forcing the user to explicitly
declare all properties in the class.

## Options

This rule, in its default state, does not require any argument and would completely disallow the use of parameter properties.
It may take an options object containing either or both of:

- `"allow"`: allowing certain kinds of properties to be ignored
- `"prefer"`: either `"class-property"` _(default)_ or `"parameter-property"`

### `"allow"`

If you would like to ignore certain kinds of properties then you may pass an object containing `"allows"` as an array of any of the following options:

- `allows`, an array containing one or more of the allowed modifiers. Valid values are:
  - `readonly`, allows **readonly** parameter properties.
  - `private`, allows **private** parameter properties.
  - `protected`, allows **protected** parameter properties.
  - `public`, allows **public** parameter properties.
  - `private readonly`, allows **private readonly** parameter properties.
  - `protected readonly`, allows **protected readonly** parameter properties.
  - `public readonly`, allows **public readonly** parameter properties.

For example, to ignore `public` properties:

```json
{
  "@typescript-eslint/parameter-properties": [
    true,
    {
      "allow": ["public"]
    }
  ]
}
```

### `"prefer"`

By default, the rule prefers class property (`"class-property"`).
You can switch it to instead preferring parameter property with (`"parameter-property"`).

In `"parameter-property"` mode, the rule will issue a report when:

- A class property and constructor parameter have the same name and type
- The constructor parameter is assigned to the class property at the beginning of the constructor

### default

Examples of code for this rule with no options at all:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  constructor(readonly name: string) {}
}

class Foo {
  constructor(private name: string) {}
}

class Foo {
  constructor(protected name: string) {}
}

class Foo {
  constructor(public name: string) {}
}

class Foo {
  constructor(private readonly name: string) {}
}

class Foo {
  constructor(protected readonly name: string) {}
}

class Foo {
  constructor(public readonly name: string) {}
}
```

#### ✅ Correct

```ts
class Foo {
  constructor(name: string) {}
}
```

### readonly

Examples of code for the `{ "allows": ["readonly"] }` options:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  constructor(private name: string) {}
}

class Foo {
  constructor(protected name: string) {}
}

class Foo {
  constructor(public name: string) {}
}

class Foo {
  constructor(private readonly name: string) {}
}

class Foo {
  constructor(protected readonly name: string) {}
}

class Foo {
  constructor(public readonly name: string) {}
}
```

#### ✅ Correct

```ts
class Foo {
  constructor(name: string) {}
}

class Foo {
  constructor(readonly name: string) {}
}
```

### private

Examples of code for the `{ "allows": ["private"] }` options:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  constructor(readonly name: string) {}
}

class Foo {
  constructor(protected name: string) {}
}

class Foo {
  constructor(public name: string) {}
}

class Foo {
  constructor(private readonly name: string) {}
}

class Foo {
  constructor(protected readonly name: string) {}
}

class Foo {
  constructor(public readonly name: string) {}
}
```

#### ✅ Correct

```ts
class Foo {
  constructor(name: string) {}
}

class Foo {
  constructor(private name: string) {}
}
```

### protected

Examples of code for the `{ "allows": ["protected"] }` options:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  constructor(readonly name: string) {}
}

class Foo {
  constructor(private name: string) {}
}

class Foo {
  constructor(public name: string) {}
}

class Foo {
  constructor(private readonly name: string) {}
}

class Foo {
  constructor(protected readonly name: string) {}
}

class Foo {
  constructor(public readonly name: string) {}
}
```

#### ✅ Correct

```ts
class Foo {
  constructor(name: string) {}
}

class Foo {
  constructor(protected name: string) {}
}
```

### public

Examples of code for the `{ "allows": ["public"] }` options:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  constructor(readonly name: string) {}
}

class Foo {
  constructor(private name: string) {}
}

class Foo {
  constructor(protected name: string) {}
}

class Foo {
  constructor(private readonly name: string) {}
}

class Foo {
  constructor(protected readonly name: string) {}
}

class Foo {
  constructor(public readonly name: string) {}
}
```

#### ✅ Correct

```ts
class Foo {
  constructor(name: string) {}
}

class Foo {
  constructor(public name: string) {}
}
```

### private readonly

Examples of code for the `{ "allows": ["private readonly"] }` options:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  constructor(readonly name: string) {}
}

class Foo {
  constructor(private name: string) {}
}

class Foo {
  constructor(protected name: string) {}
}

class Foo {
  constructor(public name: string) {}
}

class Foo {
  constructor(protected readonly name: string) {}
}

class Foo {
  constructor(public readonly name: string) {}
}
```

#### ✅ Correct

```ts
class Foo {
  constructor(name: string) {}
}

class Foo {
  constructor(private readonly name: string) {}
}
```

### protected readonly

Examples of code for the `{ "allows": ["protected readonly"] }` options:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  constructor(readonly name: string) {}
}

class Foo {
  constructor(private name: string) {}
}

class Foo {
  constructor(protected name: string) {}
}

class Foo {
  constructor(public name: string) {}
}

class Foo {
  constructor(private readonly name: string) {}
}

class Foo {
  constructor(public readonly name: string) {}
}
```

#### ✅ Correct

```ts
class Foo {
  constructor(name: string) {}
}

class Foo {
  constructor(protected readonly name: string) {}
}
```

### public readonly

Examples of code for the `{ "allows": ["public readonly"] }` options:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  constructor(readonly name: string) {}
}

class Foo {
  constructor(private name: string) {}
}

class Foo {
  constructor(protected name: string) {}
}

class Foo {
  constructor(public name: string) {}
}

class Foo {
  constructor(private readonly name: string) {}
}

class Foo {
  constructor(protected readonly name: string) {}
}
```

#### ✅ Correct

```ts
class Foo {
  constructor(name: string) {}
}

class Foo {
  constructor(public readonly name: string) {}
}
```

### `"parameter-properties"`

Examples of code for the `{ "prefer": ["parameter-properties"] }` option:

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Foo {
  public readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Foo {
  constructor(name: string) {
    this.name = name;
  }
  name: string;
}
```

#### ✅ Correct

```ts
class Foo {
  private differentName: string;
  constructor(name: string) {
    this.differentName = name;
  }
}

class Foo {
  private differentType: number | undefined;
  constructor(differentType: number) {
    this.differentType = differentType;
  }
}

class Foo {
  protected logicInConstructor: string;
  constructor(logicInConstructor: string) {
    console.log('Hello, world!');
    this.logicInConstructor = logicInConstructor;
  }
}
```

## When Not To Use It

If you don't care about the using parameter properties in constructors, then you will not need this rule.

## Related To

- TSLint: [no-parameter-properties](https://palantir.github.io/tslint/rules/no-parameter-properties/)

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
