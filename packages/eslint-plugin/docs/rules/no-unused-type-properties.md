# Disallows unused type properties for destructured function arguments (`no-unused-type-properties`)

This rule aims at finding unused type properties. When a parameter of a function is destructured, this rule tries to find if all the properties of the type of the parameters are present.

Using in combination with `prefer-destructuring`, it allows to detect unused param properties.

A use case is to detect unused props for React Components (see below)

## Rule details

Correct examples

```typescript
type T = { a: string; b: { c: string; d: string } };
type T2 = { a: string; b: string; c: string };

function f({ a, b }: T) {}
function g({ a, ...rest }: T) {}
function h({ a, b: { c, d } }: T) {}
function i({ a }: T1 | T2) {}
function j({ a }: Omit<T, 'b'>) {}
function k(arg: T) {}
function l({ a }: Omit<T2, 'c'>) {} // might be invalid in a next version
```

Invalid examples

```typescript
// invalid
function f({ a }: T) {}
function g({ a, b: { c } }: T) {}
```

## React Component Example

```typescript jsx
type MyProps {
  a: string,
  b: string //forgotten and now unused props
}


// Error: Destructuring does not use all of the properties of the type MyProps,
// you should either remove the properties from the type or use Omit<MyProps, ...>
// to explicitly exclude the properties.',

const MyComp = ({ a } : MyProps) => {
    return <div>{a}</div>
}
```
