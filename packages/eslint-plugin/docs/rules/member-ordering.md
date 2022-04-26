# `member-ordering`

Require a consistent member declaration order.

A consistent ordering of fields, methods and constructors can make interfaces, type literals, classes and class expressions easier to read, navigate, and edit.

## Rule Details

This rule aims to standardize the way class declarations, class expressions, interfaces and type literals are structured and ordered.

## Options

```ts
interface Options {
  default?: OrderConfig;
  classes?: OrderConfig;
  classExpressions?: OrderConfig;
  interfaces?: OrderConfig;
  typeLiterals?: OrderConfig;
}

type OrderConfig = MemberType[] | SortedOrderConfig | 'never';

interface SortedOrderConfig {
  memberTypes?: MemberType[] | 'never';
  order: 'alphabetically' | 'alphabetically-case-insensitive' | 'as-written';
}

// See below for the more specific MemberType strings
type MemberType = string | string[];
```

You can configure `OrderConfig` options for:

- **`default`**: all constructs (used as a fallback)
- **`classes`**?: override ordering specifically for classes
- **`classExpressions`**?: override ordering specifically for class expressions
- **`interfaces`**?: override ordering specifically for interfaces
- **`typeLiterals`**?: override ordering specifically for type literals

The `OrderConfig` settings for each kind of construct may configure sorting on one or both two levels:

- **`memberType`**: organizing on member type groups such as methods vs. properties
- **`order`**: organizing based on member names, such as alphabetically

### Groups

You can define many different groups based on different attributes of members.
The supported member attributes are, in order:

- **Accessibility** (`'public' | 'protected' | 'private'`)
- **Decoration** (`'decorated'`): Whether the member has an explicit accessibility decorator
- **Kind** (`'call-signature' | 'constructor' | 'field' | 'get' | 'method' | 'set' | 'signature'`)

Member attributes may be joined with a `'-'` to combine into more specific groups.
For example, `'public-field'` would come before `'private-field'`.

<details>
  <summary>Expand this to see the full list of all supported member type groups.</summary>

#### Member types (granular form)

There are multiple ways to specify the member types. The most explicit and granular form is the following:

```jsonc
[
  // Index signature
  "signature",

  // Fields
  "public-static-field",
  "protected-static-field",
  "private-static-field",
  "public-decorated-field",
  "protected-decorated-field",
  "private-decorated-field",
  "public-instance-field",
  "protected-instance-field",
  "private-instance-field",
  "public-abstract-field",
  "protected-abstract-field",
  "private-abstract-field",

  // Constructors
  "public-constructor",
  "protected-constructor",
  "private-constructor",

  // Getters
  "public-static-get",
  "protected-static-get",
  "private-static-get",

  "public-decorated-get",
  "protected-decorated-get",
  "private-decorated-get",

  "public-instance-get",
  "protected-instance-get",
  "private-instance-get",

  "public-abstract-get",
  "protected-abstract-get",
  "private-abstract-get",

  "public-get",
  "protected-get",
  "private-get",

  "static-get",
  "instance-get",
  "abstract-get",

  "decorated-get",

  "get",

  // Setters
  "public-static-set",
  "protected-static-set",
  "private-static-set",

  "public-decorated-set",
  "protected-decorated-set",
  "private-decorated-set",

  "public-instance-set",
  "protected-instance-set",
  "private-instance-set",

  "public-abstract-set",
  "protected-abstract-set",
  "private-abstract-set",

  "public-set",
  "protected-set",
  "private-set",

  "static-set",
  "instance-set",
  "abstract-set",

  "decorated-set",

  "set",

  // Methods
  "public-static-method",
  "protected-static-method",
  "private-static-method",
  "public-decorated-method",
  "protected-decorated-method",
  "private-decorated-method",
  "public-instance-method",
  "protected-instance-method",
  "private-instance-method",
  "public-abstract-method",
  "protected-abstract-method",
  "private-abstract-method"
]
```

Note: If you only specify some of the possible types, the non-specified ones can have any particular order. This means that they can be placed before, within or after the specified types and the linter won't complain about it.

#### Member group types (with accessibility, ignoring scope)

It is also possible to group member types by their accessibility (`static`, `instance`, `abstract`), ignoring their scope.

```jsonc
[
  // Index signature
  // No accessibility for index signature. See above.

  // Fields
  "public-field", // = ["public-static-field", "public-instance-field"]
  "protected-field", // = ["protected-static-field", "protected-instance-field"]
  "private-field", // = ["private-static-field", "private-instance-field"]

  // Constructors
  // Only the accessibility of constructors is configurable. See below.

  // Getters
  "public-get", // = ["public-static-get", "public-instance-get"]
  "protected-get", // = ["protected-static-get", "protected-instance-get"]
  "private-get", // = ["private-static-get", "private-instance-get"]

  // Setters
  "public-set", // = ["public-static-set", "public-instance-set"]
  "protected-set", // = ["protected-static-set", "protected-instance-set"]
  "private-set", // = ["private-static-set", "private-instance-set"]

  // Methods
  "public-method", // = ["public-static-method", "public-instance-method"]
  "protected-method", // = ["protected-static-method", "protected-instance-method"]
  "private-method" // = ["private-static-method", "private-instance-method"]
]
```

#### Member group types (with accessibility and a decorator)

It is also possible to group methods or fields with a decorator separately, optionally specifying
their accessibility.

```jsonc
[
  // Index signature
  // No decorators for index signature.

  // Fields
  "public-decorated-field",
  "protected-decorated-field",
  "private-decorated-field",

  "decorated-field", // = ["public-decorated-field", "protected-decorated-field", "private-decorated-field"]

  // Constructors
  // There are no decorators for constructors.

  // Getters
  "public-decorated-get",
  "protected-decorated-get",
  "private-decorated-get",

  "decorated-get" // = ["public-decorated-get", "protected-decorated-get", "private-decorated-get"]

  // Setters
  "public-decorated-set",
  "protected-decorated-set",
  "private-decorated-set",

  "decorated-set" // = ["public-decorated-set", "protected-decorated-set", "private-decorated-set"]

  // Methods
  "public-decorated-method",
  "protected-decorated-method",
  "private-decorated-method",

  "decorated-method" // = ["public-decorated-method", "protected-decorated-method", "private-decorated-method"]
]
```

#### Member group types (with scope, ignoring accessibility)

Another option is to group the member types by their scope (`public`, `protected`, `private`), ignoring their accessibility.

```jsonc
[
  // Index signature
  // No scope for index signature. See above.

  // Fields
  "static-field", // = ["public-static-field", "protected-static-field", "private-static-field"]
  "instance-field", // = ["public-instance-field", "protected-instance-field", "private-instance-field"]
  "abstract-field", // = ["public-abstract-field", "protected-abstract-field", "private-abstract-field"]

  // Constructors
  "constructor", // = ["public-constructor", "protected-constructor", "private-constructor"]

  // Getters
  "static-get", // = ["public-static-get", "protected-static-get", "private-static-get"]
  "instance-get", // = ["public-instance-get", "protected-instance-get", "private-instance-get"]
  "abstract-get" // = ["public-abstract-get", "protected-abstract-get", "private-abstract-get"]

  // Setters
  "static-set", // = ["public-static-set", "protected-static-set", "private-static-set"]
  "instance-set", // = ["public-instance-set", "protected-instance-set", "private-instance-set"]
  "abstract-set" // = ["public-abstract-set", "protected-abstract-set", "private-abstract-set"]

  // Methods
  "static-method", // = ["public-static-method", "protected-static-method", "private-static-method"]
  "instance-method", // = ["public-instance-method", "protected-instance-method", "private-instance-method"]
  "abstract-method" // = ["public-abstract-method", "protected-abstract-method", "private-abstract-method"]
]
```

#### Member group types (with scope and accessibility)

The third grouping option is to ignore both scope and accessibility.

```jsonc
[
  // Index signature
  // No grouping for index signature. See above.

  // Fields
  "field", // = ["public-static-field", "protected-static-field", "private-static-field", "public-instance-field", "protected-instance-field", "private-instance-field",
  //              "public-abstract-field", "protected-abstract-field", private-abstract-field"]

  // Constructors
  // Only the accessibility of constructors is configurable. See above.

  // Getters
  "get" // = ["public-static-get", "protected-static-get", "private-static-get", "public-instance-get", "protected-instance-get", "private-instance-get",
  //                "public-abstract-get", "protected-abstract-get", "private-abstract-get"]

  // Setters
  "set" // = ["public-static-set", "protected-static-set", "private-static-set", "public-instance-set", "protected-instance-set", "private-instance-set",
  //                "public-abstract-set", "protected-abstract-set", "private-abstract-set"]

  // Methods
  "method" // = ["public-static-method", "protected-static-method", "private-static-method", "public-instance-method", "protected-instance-method", "private-instance-method",
  //                "public-abstract-method", "protected-abstract-method", "private-abstract-method"]
]
```

#### Grouping different member types at the same rank

It is also possible to group different member types at the same rank.

```jsonc
[
  // Index signature
  "signature",

  // Fields
  "field",

  // Constructors
  "constructor",

  // Getters and Setters at the same rank
  ["get", "set"],

  // Methods
  "method"
]
```

</details>

### Default configuration

The default configuration looks as follows:

```jsonc
{
  "default": [
    // Index signature
    "signature",

    // Fields
    "public-static-field",
    "protected-static-field",
    "private-static-field",

    "public-decorated-field",
    "protected-decorated-field",
    "private-decorated-field",

    "public-instance-field",
    "protected-instance-field",
    "private-instance-field",

    "public-abstract-field",
    "protected-abstract-field",
    "private-abstract-field",

    "public-field",
    "protected-field",
    "private-field",

    "static-field",
    "instance-field",
    "abstract-field",

    "decorated-field",

    "field",

    // Constructors
    "public-constructor",
    "protected-constructor",
    "private-constructor",

    "constructor",

    // Getters
    "public-static-get",
    "protected-static-get",
    "private-static-get",

    "public-decorated-get",
    "protected-decorated-get",
    "private-decorated-get",

    "public-instance-get",
    "protected-instance-get",
    "private-instance-get",

    "public-abstract-get",
    "protected-abstract-get",
    "private-abstract-get",

    "public-get",
    "protected-get",
    "private-get",

    "static-get",
    "instance-get",
    "abstract-get",

    "decorated-get",

    "get",

    // Setters
    "public-static-set",
    "protected-static-set",
    "private-static-set",

    "public-decorated-set",
    "protected-decorated-set",
    "private-decorated-set",

    "public-instance-set",
    "protected-instance-set",
    "private-instance-set",

    "public-abstract-set",
    "protected-abstract-set",
    "private-abstract-set",

    "public-set",
    "protected-set",
    "private-set",

    "static-set",
    "instance-set",
    "abstract-set",

    "decorated-set",

    "set",

    // Methods
    "public-static-method",
    "protected-static-method",
    "private-static-method",

    "public-decorated-method",
    "protected-decorated-method",
    "private-decorated-method",

    "public-instance-method",
    "protected-instance-method",
    "private-instance-method",

    "public-abstract-method",
    "protected-abstract-method",
    "private-abstract-method",

    "public-method",
    "protected-method",
    "private-method",

    "static-method",
    "instance-method",
    "abstract-method",

    "decorated-method",

    "method"
  ]
}
```

:::note
The default configuration contains member group types which contain other member types (see above). This is intentional to provide better error messages.
:::

:::tip
By default, the members are not sorted. If you want to sort them alphabetically, you have to provide a custom configuration.
:::

## Examples

### General Order on All Constructs

This config specifies the order for all constructs.
It ignores member types other than signatures, methods, constructors, and fields.
It also ignores accessibility and scope.

```jsonc
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-non-null-assertion": [
      "error",
      { "default": ["signature", "method", "constructor", "field"] }
    ]
  }
}
```

<!--tabs-->

#### ❌ Incorrect

```ts
interface Foo {
  B: string; // -> field

  new (); // -> constructor

  A(): void; // -> method

  [Z: string]: any; // -> signature
}
```

```ts
type Foo = {
  B: string; // -> field

  // no constructor

  A(): void; // -> method

  // no signature
};
```

```ts
class Foo {
  private C: string; // -> field
  public D: string; // -> field
  protected static E: string; // -> field

  constructor() {} // -> constructor

  public static A(): void {} // -> method
  public B(): void {} // -> method

  [Z: string]: any; // -> signature
}
```

```ts
const Foo = class {
  private C: string; // -> field
  public D: string; // -> field

  constructor() {} // -> constructor

  public static A(): void {} // -> method
  public B(): void {} // -> method

  [Z: string]: any; // -> signature

  protected static E: string; // -> field
};
```

#### ✅ Correct

```ts
interface Foo {
  [Z: string]: any; // -> signature

  A(): void; // -> method

  new (); // -> constructor

  B: string; // -> field
}
```

```ts
type Foo = {
  // no signature

  A(): void; // -> method

  // no constructor

  B: string; // -> field
};
```

```ts
class Foo {
  [Z: string]: any; // -> signature

  public static A(): void {} // -> method
  public B(): void {} // -> method

  constructor() {} // -> constructor

  private C: string; // -> field
  public D: string; // -> field
  protected static E: string; // -> field
}
```

```ts
const Foo = class {
  [Z: string]: any; // -> signature

  public static A(): void {} // -> method
  public B(): void {} // -> method

  constructor() {} // -> constructor

  private C: string; // -> field
  public D: string; // -> field
  protected static E: string; // -> field
};
```

### Public Instance Methods Before Public Static Fields

This config doesn't apply to interfaces or type literals as accessibility and scope are not part of them.
It specifies that public instance methods should come first before public static fields.
Everything else can be placed anywhere.

```jsonc
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-non-null-assertion": [
      "error",
      { "default": ["public-instance-method", "public-static-field"] }
    ]
  }
}
```

<!--tabs-->

#### ❌ Incorrect

```ts
class Foo {
  private C: string; // (irrelevant)

  public D: string; // (irrelevant)

  public static E: string; // -> public static field

  constructor() {} // (irrelevant)

  public static A(): void {} // (irrelevant)

  [Z: string]: any; // (irrelevant)

  public B(): void {} // -> public instance method
}
```

```ts
const Foo = class {
  private C: string; // (irrelevant)

  [Z: string]: any; // (irrelevant)

  public static E: string; // -> public static field

  public D: string; // (irrelevant)

  constructor() {} // (irrelevant)

  public static A(): void {} // (irrelevant)

  public B(): void {} // -> public instance method
};
```

#### ✅ Correct

```ts
class Foo {
  public B(): void {} // -> public instance method

  private C: string; // (irrelevant)

  public D: string; // (irrelevant)

  public static E: string; // -> public static field

  constructor() {} // (irrelevant)

  public static A(): void {} // (irrelevant)

  [Z: string]: any; // (irrelevant)
}
```

```ts
const Foo = class {
  public B(): void {} // -> public instance method

  private C: string; // (irrelevant)

  [Z: string]: any; // (irrelevant)

  public D: string; // (irrelevant)

  constructor() {} // (irrelevant)

  public static A(): void {} // (irrelevant)

  public static E: string; // -> public static field
};
```

### Configuration: `{ "default": ["public-static-field", "static-field", "instance-field"] }`

Note: This configuration does not apply to interfaces/type literals as accessibility and scope are not part of interfaces/type literals.

##### Incorrect examples

```ts
class Foo {
  private E: string; // -> instance field

  private static B: string; // -> static field
  protected static C: string; // -> static field
  private static D: string; // -> static field

  public static A: string; // -> public static field

  [Z: string]: any; // (irrelevant)
}
```

Note: Public static fields should come first, followed by static fields and instance fields.

```ts
const foo = class {
  public T(): void {} // (irrelevant)

  private static B: string; // -> static field

  constructor() {} // (irrelevant)

  private E: string; // -> instance field

  protected static C: string; // -> static field
  private static D: string; // -> static field

  [Z: string]: any; // (irrelevant)

  public static A: string; // -> public static field
};
```

Note: Public static fields should come first, followed by static fields and instance fields.

##### Correct examples

```ts
class Foo {
  public static A: string; // -> public static field

  private static B: string; // -> static field
  protected static C: string; // -> static field
  private static D: string; // -> static field

  private E: string; // -> instance field
}
```

```ts
const foo = class {
  [Z: string]: any; // -> signature

  public static A: string; // -> public static field

  constructor() {} // -> constructor

  private static B: string; // -> static field
  protected static C: string; // -> static field
  private static D: string; // -> static field

  private E: string; // -> instance field

  public T(): void {} // -> method
};
```

### Custom `classes` configuration

Note: If this is not set, the `default` will automatically be applied to classes as well. If a `classes` configuration is provided, only this configuration will be used for `classes` (i.e. nothing will be merged with `default`).

Note: The configuration for `classes` does not apply to class expressions (use `classExpressions` for them).

#### Configuration: `{ "classes": ["method", "constructor", "field"] }`

##### Incorrect example

```ts
class Foo {
  private C: string; // -> field
  public D: string; // -> field
  protected static E: string; // -> field

  constructor() {} // -> constructor

  public static A(): void {} // -> method
  public B(): void {} // -> method
}
```

##### Correct example

```ts
class Foo {
  public static A(): void {} // -> method
  public B(): void {} // -> method

  constructor() {} // -> constructor

  private C: string; // -> field
  public D: string; // -> field
  protected static E: string; // -> field
}
```

#### Configuration: `{ "classes": ["public-instance-method", "public-static-field"] }`

##### Incorrect example

```ts
class Foo {
  private C: string; // (irrelevant)

  public D: string; // (irrelevant)

  public static E: string; // -> public static field

  constructor() {} // (irrelevant)

  public static A(): void {} // (irrelevant)

  public B(): void {} // -> public instance method
}
```

##### Correct example

```ts
class Foo {
  private C: string; // (irrelevant)

  public D: string; // (irrelevant)

  public B(): void {} // -> public instance method

  constructor() {} // (irrelevant)

  public static A(): void {} // (irrelevant)

  public static E: string; // -> public static field
}
```

### Custom `classExpressions` configuration

Note: If this is not set, the `default` will automatically be applied to classes expressions as well. If a `classExpressions` configuration is provided, only this configuration will be used for `classExpressions` (i.e. nothing will be merged with `default`).

Note: The configuration for `classExpressions` does not apply to classes (use `classes` for them).

#### Configuration: `{ "classExpressions": ["method", "constructor", "field"] }`

##### Incorrect example

```ts
const foo = class {
  private C: string; // -> field
  public D: string; // -> field
  protected static E: string; // -> field

  constructor() {} // -> constructor

  public static A(): void {} // -> method
  public B(): void {} // -> method
};
```

##### Correct example

```ts
const foo = class {
  public static A(): void {} // -> method
  public B(): void {} // -> method

  constructor() {} // -> constructor

  private C: string; // -> field
  public D: string; // -> field
  protected static E: string; // -> field
};
```

#### Configuration: `{ "classExpressions": ["public-instance-method", "public-static-field"] }`

##### Incorrect example

```ts
const foo = class {
  private C: string; // (irrelevant)

  public D: string; // (irrelevant)

  public static E: string; // -> public static field

  constructor() {} // (irrelevant)

  public static A(): void {} // (irrelevant)

  public B(): void {} // -> public instance method
};
```

##### Correct example

```ts
const foo = class {
  private C: string; // (irrelevant)

  public D: string; // (irrelevant)

  public B(): void {} // -> public instance method

  public static E: string; // -> public static field

  constructor() {} // (irrelevant)

  public static A(): void {} // (irrelevant)
};
```

### Custom `interfaces` configuration

Note: If this is not set, the `default` will automatically be applied to classes expressions as well. If a `interfaces` configuration is provided, only this configuration will be used for `interfaces` (i.e. nothing will be merged with `default`).

Note: The configuration for `interfaces` only allows a limited set of member types: `signature`, `field`, `constructor` and `method`.

Note: The configuration for `interfaces` does not apply to type literals (use `typeLiterals` for them).

#### Configuration: `{ "interfaces": ["signature", "method", "constructor", "field"] }`

##### Incorrect example

```ts
interface Foo {
  B: string; // -> field

  new (); // -> constructor

  A(): void; // -> method

  [Z: string]: any; // -> signature
}
```

##### Correct example

```ts
interface Foo {
  [Z: string]: any; // -> signature

  A(): void; // -> method

  new (); // -> constructor

  B: string; // -> field
}
```

### Custom `typeLiterals` configuration

Note: If this is not set, the `default` will automatically be applied to classes expressions as well. If a `typeLiterals` configuration is provided, only this configuration will be used for `typeLiterals` (i.e. nothing will be merged with `default`).

Note: The configuration for `typeLiterals` only allows a limited set of member types: `signature`, `field`, `constructor` and `method`.

Note: The configuration for `typeLiterals` does not apply to interfaces (use `interfaces` for them).

#### Configuration: `{ "typeLiterals": ["signature", "method", "constructor", "field"] }`

##### Incorrect example

```ts
type Foo = {
  B: string; // -> field

  A(): void; // -> method

  new (); // -> constructor

  [Z: string]: any; // -> signature
};
```

##### Correct example

```ts
type Foo = {
  [Z: string]: any; // -> signature

  A(): void; // -> method

  new (); // -> constructor

  B: string; // -> field
};
```

### Sorting alphabetically within member groups

It is possible to sort all members within a group alphabetically.

#### Configuration: `{ "default": { "memberTypes": <Default Order>, "order": "alphabetically" } }`

This will apply the default order (see above) and enforce an alphabetic case-sensitive order within each group.

##### Incorrect examples

```ts
interface Foo {
  B: x;
  a: x;
  c: x;

  new (): Bar;
  (): Baz;

  B(): void;
  a(): void;
  c(): void;

  // Wrong group order, should be placed before all field definitions
  [a: string]: number;
}
```

```ts
interface Foo {
  [a: string]: number;

  B: x;
  a: x;
  c: x;

  new (): Bar;
  (): Baz;

  // Wrong alphabetic order within group
  c(): void;
  B(): void;
  a(): void;
}
```

### Sorting alphabetically while ignoring member groups

It is also possible to sort all members and ignore the member groups completely.

#### Configuration: `{ "default": { "memberTypes": "never", "order": "alphabetically" } }`

##### Incorrect example

```ts
interface Foo {
  b(): void;
  a: b;

  [a: string]: number; // Order doesn't matter (no sortable identifier)
  new (): Bar; // Order doesn't matter (no sortable identifier)
  (): Baz; // Order doesn't matter (no sortable identifier)
}
```

Note: Wrong alphabetic order `b(): void` should come after `a: b`.

### Sorting alphabetically case-insensitive within member groups

It is possible to sort all members within a group alphabetically with case insensitivity.

#### Configuration: `{ "default": { "memberTypes": <Default Order>, "order": "alphabetically-case-insensitive" } }`

This will apply the default order (see above) and enforce an alphabetic case-insensitive order within each group.

##### Incorrect examples

```ts
interface Foo {
  a: x;
  B: x;
  c: x;

  new (): Bar;
  (): Baz;

  a(): void;
  b(): void;
  C(): void;

  // Wrong group order, should be placed before all field definitions
  [a: string]: number;
}
```

```ts
interface Foo {
  [a: string]: number;

  a: x;
  B: x;
  c: x;

  new (): Bar;
  (): Baz;

  // Wrong alphabetic order within group
  C(): void;
  b(): void;
  a(): void;
}
```

### Sorting alphabetically case-insensitive while ignoring member groups

It is also possible to sort all members with case insensitivity and ignore the member groups completely.

#### Configuration: `{ "default": { "memberTypes": "never", "order": "alphabetically-case-insensitive" } }`

##### Incorrect example

```ts
interface Foo {
  B(): void;
  a: number;

  [a: string]: number; // Order doesn't matter (no sortable identifier)
  new (): Bar; // Order doesn't matter (no sortable identifier)
  (): Baz; // Order doesn't matter (no sortable identifier)
}
```

Note: Wrong alphabetic order `B(): void` should come after `a: number`.

## When Not To Use It

If you don't care about the general order of your members, then you will not need this rule.

## Related To

- TSLint: [member-ordering](https://palantir.github.io/tslint/rules/member-ordering/)

## Attributes

- [ ] ✅ Recommended
- [ ] 🔧 Fixable
- [ ] 💭 Requires type information
