# Require explicit accessibility modifiers on class properties and methods (explicit-member-accessibility)

Leaving off accessibility modifier and making everything public can make
your interface hard to use by others.
If you make all internal pieces private or protected, your interface will
be easier to use.

## Rule Details

This rule aims to make code more readable and explicit about who can use
which properties.

## Options

This rule in it's default state requires no configuration and will enforce that every class member has an accessibility modifier. If you would like to allow for some implicit public members then you have the following options:

- `noPublic`: optional boolean value to prevent the use of the public accessibility modifier
- `overrides`: configuration object allowing for granular application of the noPublic option or simply disabling the rule for these kinds of class members:
  - `accessors`
  - `constructors`
  - `methods`
  - `properties`
  - `parameterProperties`

Default options are: `[{}]`

A possible, but not useful configuration could be

```ts
[{
  noPublic: false,
  overrides {
    accessors: {
      noPublic: false
    },
    constructors: false,
    methods: {
      noPublic: true
    },
    properties: true,
    parameterProperties: {
      noPublic: true
    }
  }
}]
```

The following patterns are considered incorrect code if no options are provided:

```ts
class Animal {
  constructor(name) {
    // No accessibility modifier
    this.animalName = name;
  }
  animalName: string; // No accessibility modifier
  get name(): string {
    // No accessibility modifier
    return this.animalName;
  }
  set name(value: string) {
    // No accessibility modifier
    this.animalName = value;
  }
  walk() {
    // method
  }
}
```

The following patterns are considered correct with the default options `[{}]`:

```ts
class Animal {
  constructor(public breed, animalName) {
    // Parameter property and constructor
    this.animalName = name;
  }
  private animalName: string; // Property
  get name(): string {
    // get accessor
    return this.animalName;
  }
  set name(value: string) {
    // set accessor
    this.animalName = value;
  }
  public walk() {
    // method
  }
}
```

The following patterns are considered incorrect with the root noPublic flag set `[{ noPublic: true }]`:

```ts
class Animal {
  public constructor(public breed, animalName) {
    // Parameter property and constructor
    this.animalName = name;
  }
  public animalName: string; // Property
  public get name(): string {
    // get accessor
    return this.animalName;
  }
  public set name(value: string) {
    // set accessor
    this.animalName = value;
  }
  public walk() {
    // method
  }
}
```

The following patterns are considered correct with the root noPublic flag set `[{ noPublic: true }]`:

```ts
class Animal {
  constructor(protected breed, animalName) {
    // Parameter property and constructor
    this.name = name;
  }
  private animalName: string; // Property
  get name(): string {
    // get accessor
    return this.animalName;
  }
  private set name(value: string) {
    // set accessor
    this.animalName = value;
  }
  protected walk() {
    // method
  }
}
```

### Overrides

There are three ways in which an override can be used.

- To disallow the use of public on a given member.
- To enforce explicit member accessibility when the root has allowed implicit public accessibility
- To disable any checks on given member type

#### Disallow the use of public on a given member

e.g. `[ { overrides: { constructor: { noPublic: true } } } ]`

The following patterns are considered incorrect with the example override

```ts
class Animal {
  public constructor(protected animalName) {}
  public get name() {
    return this.animalName;
  }
}
```

The following patterns are considered correct with the example override

```ts
class Animal {
  constructor(protected animalName) {}
  public get name() {
    return this.animalName;
  }
}
```

#### Require explicit accessibility for a given member

e.g. `[ { noPublic: true, overrides: { properties: { noPublic: false } } } ]`

The following patterns are considered incorrect with the example override

```ts
class Animal {
  constructor(protected animalName) {}
  get name() {
    return this.animalName;
  }
  protected set name(value: string) {
    this.animalName = value;
  }
  legs: number;
  private hasFleas: boolean;
}
```

The following patterns are considered correct with the example override

```ts
class Animal {
  constructor(protected animalName) {}
  get name() {
    return this.animalName;
  }
  protected set name(value: string) {
    this.animalName = value;
  }
  public legs: number;
  private hasFleas: boolean;
}
```

#### Disable any checks on given member type

e.g. `[{ overrides: { accessors : false } } ]`

As no checks on the overridden member type are performed all permutations of visibility are permitted for that member type

The follow pattern is considered incorrect for the given configuration

```ts
class Animal {
  constructor(protected animalName) {}
  public get name() {
    return this.animalName;
  }
  get legs() {
    return this.legCount;
  }
}
```

The following patterns are considered correct with the example override

```ts
class Animal {
  public constructor(protected animalName) {}
  public get name() {
    return this.animalName;
  }
  get legs() {
    return this.legCount;
  }
}
```

## When Not To Use It

If you think defaulting to public is a good default, then you should consider using the `noPublic` option. If you don't want to mix implicit and explicit public members then disable this rule.

## Further Reading

- TypeScript [Accessibility Modifiers](https://www.typescriptlang.org/docs/handbook/classes.html#public-private-and-protected-modifiers)

## Compatibility

- TSLint: [member-access](http://palantir.github.io/tslint/rules/member-access/)
