# OptionalChain is recommended when accessing non-built-in object members (`no-unsafe-access`)

TypeScript 3.7 added support for the optional chain operator.
This operator allows you to safely access properties and methods on objects when they are potentially `null` or `undefined`.

## Rule Details

This rule aims enforce the usage of the safer operator.

Examples of **incorrect** code for this rule:

```ts
interface IAjaxData {
  error: boolean;
  errorCode: string;
  data: {
    anyB: {
      anyC: string;
    };
  };
}
const data: IAjaxData = awaite fetchData('url');
const c = data.data.anyB.anyC;
```

Examples of **correct** code for this rule:

```ts
interface IAjaxData {
  error: boolean;
  errorCode: string;
  data: {
    anyB: {
      anyC: string;
    };
  };
}
const data: IAjaxData = awaite fetchData('url');
const c = a?.data?.anyB?.anyC;
```

When you get jason data, the data returned is out of control and requires non-null judgment, otherwise it may cause program errors that can be avoided with an optional chain

## When Not To Use It

If you are not using TypeScript 3.7 (or greater), then you will not be able to use this rule, as the operator is not supported.

## Further Reading

- [TypeScript 3.7 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html)
- [Optional Chaining Proposal](https://github.com/tc39/proposal-optional-chaining/)
