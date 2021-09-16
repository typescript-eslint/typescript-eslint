# Prefer consistent enum members (`prefer-consistent-enums`)

This rule recommends having each `enum`s member type to be the same.

## Rule Details

You can iterate over enums using `Object.keys` / `Object.values`.

If all enum members are strings — result is consistent and number of items will match number of enum members:

```ts
enum Status {
  Open = 'open',
  Closed = 'closed',
}

Object.values(Status); // ['open','closed']
```

But if enum will have some members that are initialized with numbers, or not initialized at all — iteration over that enum will have additional auto generated items

```ts
enum Status {
  Pending = 0,
  Open = 'open',
  Closed = 'closed',
}

Object.values(Status); //  ["Pending", 0, "open", "closed"]
```

Examples of **incorrect** code for this rule:

```ts
enum Status {
  Pending = 0,
  Open = 'open',
  Closed = 'closed',
}

enum Direction {
  Up = 0,
  Down,
}

enum Color {
  Red = 5,
  Green = 'Green'
  Blue = 'Blue',
}
```

Examples of **correct** code for this rule:

```ts
enum Status {
  Open = 'Open',
  Close = 'Close',
}

enum Direction {
  Up = 1,
  Down = 2,
}

enum Color {
  Red = 'Red',
  Green = 'Green',
  Blue = 'Blue',
}
```

## When Not To Use It

If you don't iterate over `enum`s you can safely disable this rule.
