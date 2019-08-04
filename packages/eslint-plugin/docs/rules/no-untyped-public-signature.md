# Disallow untyped public methods (no-untyped-public-signature)

public methods are meant to be used by code outside of your class. By typing both the parameters and the return type of public methods they will be more readable and easy to use.

## Rule Details

This rule aims to ensure that only typed public methods are declared in the code.

The following patterns are considered warnings:

```ts
// untyped parameter
public foo(param1): void {
}

// untyped return type
public foo(param1: string) {
}
```

The following patterns are not warnings:

```ts
// typed public method
public foo(param1: string): void {
}

// untyped private method
private foo(param1) {
}
```

## When Not To Use It

If you don't wish to type public methods.
