# Require a specific member delimiter style for interfaces and type literals (member-delimiter-style)

Enforces a consistent member delimiter style in interfaces and type literals. There are three member delimiter styles primarily used in TypeScript:
- Semicolon style (default, preferred in TypeScript).
```ts
interface Foo {
    name: string;
    greet(): void;
}

type Bar = {
    name: string;
    greet(): void;
}
```

- Comma style (JSON style).
```ts
interface Foo {
    name: string,
    greet(): void,
}

type Bar = {
    name: string,
    greet(): void,
}
```

- Linebreak style.
```ts
interface Foo {
    name: string
    greet(): void
}

type Bar = {
    name: string
    greet(): void
}
```

The rule also enforces the presence (or absence) of the delimiter in the last member of the interface and/or type literal.
Finally, this rule can enforce separate delimiter syntax for single line declarations.

## Rule Details

This rule aims to standardise the way interface and type literal members are delimited.

## Options

This rule, in its default state, does not require any argument, in which case a **semicolon** is used as a
delimiter and **all members** require a delimiter, except in single line interfaces or type literals, in which case
the delimiter of the **last member** can be omitted.

The rule can also take one or more of the following options:
- `"delimiter": "semi"`, (default) use this to require a semicolon.
- `"delimiter": "comma"`, use this to require a comma.
- `"delimiter": "none"`, use this to require a linebreak.
- `"requireLast": true`, (default) use this to require a delimiter for all members of the interface and/or type literal.
- `"requireLast": false`, use this to ignore the last member of the interface and/or type literal.
- `"singleLine": "semi"`, (default) use this to require a semicolon in single line declarations.
- `"singleLine": "comma"`, use this to require a comma in single line declarations.
- `"singleLine": "none"`, use this to require a linebreak (i.e. disallow mulit prop, single line declarations).
- `"overrides"`, overrides the default options for **interfaces** and **type literals**.

*Note that `delimiter` and `singleLine` are independent options - if you don't provide a value for either they will use their default option.*

### defaults
Examples of **incorrect** code for this rule with the defaults
`{ delimiter: "semi", requireLast: true, singleLine: "semi" }` or no option at all:
```ts
// missing semicolon delimiter
interface Foo {
    name: string
    greet(): string
}

// using incorrect delimiter
interface Bar {
    name: string,
    greet(): string,
}

// missing last member delimiter
interface Baz {
    name: string;
    greet(): string
}

// missing semicolon delimiter
type Foo = {
    name: string
    greet(): string
}

// using incorrect delimiter
type Bar = {
    name: string,
    greet(): string,
}

// missing last member delimiter
type Baz = {
    name: string,
    greet(): string
}

// incorrect delimiter
type FooBar = { name: string, greet(): string }
```

Examples of **correct** code for this rule with the default
`{ delimiter: "semi", requireLast: true, singleLine: "semi" }`:
```ts
interface Foo {
    name: string;
    greet(): string;
}

interface Foo { name: string; }

type Bar = {
    name: string;
    greet(): string;
}

type Bar = { name: string; }

type FooBar = { name: string; greet(): string; }
```

### delimiter - semi
Examples of **incorrect** code for this rule with `{ delimiter: "semi" }`:
```ts
// missing semicolon delimiter
interface Foo {
    name: string
    greet(): string
}

// using incorrect delimiter
interface Bar {
    name: string,
    greet(): string,
}
```

Examples of **correct** code for this rule with `{ delimiter: "semi" }`:
```ts
// with requireLast = true
interface Foo {
    name: string;
    greet(): string;
}
type Bar = {
    name: string;
    greet(): string;
}

// with requireLast = false
interface Foo {
    name: string;
    greet(): string
}
type Bar = {
    name: string;
    greet(): string
}
```

### delimiter - comma
Examples of **incorrect** code for this rule with `{ delimiter: "comma" }`:
```ts
// missing comma delimiter
interface Foo {
    name: string
    greet(): string
}

// using incorrect delimiter
interface Bar {
    name: string;
    greet(): string;
}
```

Examples of **correct** code for this rule with `{ delimiter: "comma" }`:
```ts
// with requireLast = true
interface Foo {
    name: string,
    greet(): string,
}
type Bar = {
    name: string,
    greet(): string,
}

// with requireLast = false
interface Foo {
    name: string,
    greet(): string
}

type Bar = {
    name: string,
    greet(): string
}
```

### delimiter - none
Examples of **incorrect** code for this rule with `{ delimiter: "none" }`:
```ts
// using incorrect delimiter
interface Foo {
    name: string;
    greet(): string;
}

// using incorrect delimiter
interface Bar {
    name: string,
    greet(): string,
}
```

Examples of **correct** code for this rule with `{ delimiter: "none" }`:
```ts
interface Foo {
    name: string
    greet(): string
}

type Bar = {
    name: string
    greet(): string
}
```

### requireLast
Examples of **incorrect** code for this rule with `{ requireLast: true }`:
```ts
// using incorrect delimiter
interface Foo {
    name: string;
    greet(): string
}

// using incorrect delimiter
type Bar = {
    name: string,
    greet(): string
}
```

Examples of **correct** code for this rule with `{ requireLast: true }`:
```ts
interface Foo {
    name: string;
    greet(): string;
}

type Bar = {
    name: string,
    greet(): string,
}
```

Examples of **correct** code for this rule with `{ requireLast: false }`:
```ts
interface Foo {
    name: string
    greet(): string
}

interface Bar {
    name: string;
    greet(): string
}

interface Baz {
    name: string;
    greet(): string;
}

type Foo = {
    name: string
    greet(): string
}

type Bar = {
    name: string,
    greet(): string
}

type Baz = {
    name: string,
    greet(): string,
}
```

### ignoreSingleLine
Examples of **incorrect** code for this rule with `{ singleLine: "semi" }`:
```ts
// using incorrect delimiter
interface Foo { name: string, }
interface Foo { name: string, greet(): string, }

type Bar = { name: string, }
type Bar = { name: string, greet(): string, }
```

Examples of **correct** code for this rule with `{ singleLine: "semi" }`:
```ts
interface Foo { name: string; }
interface Foo { name: string; greet(): string; }

type Bar = { name: string; }
type Bar = { name: string; greet(): string; }
```

Examples of **incorrect** code for this rule with `{ singleLine: "comma" }`:
```ts
// using incorrect delimiter
interface Foo { name: string; }
interface Foo { name: string; greet(): string; }

type Bar = { name: string; }
type Bar = { name: string; greet(): string; }
```

Examples of **correct** code for this rule with `{ singleLine: "comma" }`:
```ts
interface Foo { name: string, }
interface Foo { name: string, greet(): string, }

type Bar = { name: string, }
type Bar = { name: string, greet(): string, }
```

Examples of **incorrect** code for this rule with `{ singleLine: "none" }`:
```ts
// has a delimiter when it shouldn't
interface Foo { name: string; }
interface Foo { name: string; greet(): string; }
interface Foo { name: string, }
interface Foo { name: string, greet(): string, }

type Bar = { name: string; }
type Bar = { name: string; greet(): string; }
type Bar = { name: string, }
type Bar = { name: string, greet(): string, }
```

Examples of **correct** code for this rule with `{ singleLine: "none" }`:
```ts
interface Foo { name: string }
type Bar = { name: string }

// Note that there is no syntax-valid way to do types single-line without a delimiter
interface Foo {
    name: string
    greet(): string
}
type Bar = {
    name: string
    greet(): string
}
```

### overrides - interface
Examples of **incorrect** code for this rule with `{ delimiter: "comma", requireLast: true, overrides: { interface: { delimiter: "semi" } } }`:
```ts
// expecting a semicolon
interface Foo {
    name: string,
    greet(): string,
}

// this is fine, using default
type Bar = {
    name: string,
    greet(): string,
}
```

Examples of **correct** code for this rule with `{ delimiter: "comma", requireLast: true, overrides: { interface: { delimiter: "semi" } } }`:
```ts
// this is fine, using override
interface Foo {
    name: string;
    greet(): string;
}

// this is fine, using default
type Bar = {
    name: string,
    greet(): string,
}
```

### overrides - typeLiteral
Examples of **incorrect** code for this rule with `{ delimiter: "semi", requireLast: true, overrides: { typeLiteral: { delimiter: "comma", requireLast: false } } }`:
```ts
// this is fine, using default
interface Foo {
    name: string;
    greet(): string;
}

// expecting a comma
type Bar = {
    name: string;
    greet(): string
}
```

Examples of **correct** code for this rule with `{ delimiter: "semi", requireLast: true, overrides: { typeLiteral: { delimiter: "comma", requireLast: false } } }`:
```ts
// this is fine, using default
interface Foo {
    name: string;
    greet(): string;
}

// this is fine, using override
type Bar = {
    name: string,
    greet(): string
}
```

## When Not To Use It

If you don't care about enforcing a consistent member delimiter in interfaces and type literals, then you will not need this rule.
