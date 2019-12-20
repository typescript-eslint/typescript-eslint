# Bans “// @ts-nocheck” comments from being used (ban-ts-nocheck)

Suppressing all TypeScript Compiler Errors can be hard to discover.

## Rule Details

Does not allow the use of `// @ts-nocheck` comments.

The following patterns are considered warnings:

```ts
// @ts-nocheck - not yet migrated
if (false) {
  // unreachable code error
  console.log('hello');
}
```

The following patterns are not warnings:

```ts
if (false) {
  // Compiler warns about unreachable code error
  console.log('hello');
}
```

## When Not To Use It

If you want to have TypeScript not check specific files, and you're sure compiler errors won't affect functionality.

## Further Reading

- TypeScript [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
