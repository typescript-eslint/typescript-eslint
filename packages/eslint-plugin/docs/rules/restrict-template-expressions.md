---
description: 'Enforce template literal expressions to be of `string` type.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/restrict-template-expressions** for documentation.

## Rule Details

Examples of code for this rule:

<!--tabs-->

### ❌ Incorrect

```ts
const arg1 = [1, 2];
const msg1 = `arg1 = ${arg1}`;

const arg2 = { name: 'Foo' };
const msg2 = `arg2 = ${arg2 || null}`;
```

### ✅ Correct

```ts
const arg = 'foo';
const msg1 = `arg = ${arg}`;
const msg2 = `arg = ${arg || 'default'}`;

const stringWithKindProp: string & { _kind?: 'MyString' } = 'foo';
const msg3 = `stringWithKindProp = ${stringWithKindProp}`;
```

## Options

### `allowNumber`

Examples of additional **correct** code for this rule with `{ allowNumber: true }`:

```ts
const arg = 123;
const msg1 = `arg = ${arg}`;
const msg2 = `arg = ${arg || 'zero'}`;
```

### `allowBoolean`

Examples of additional **correct** code for this rule with `{ allowBoolean: true }`:

```ts
const arg = true;
const msg1 = `arg = ${arg}`;
const msg2 = `arg = ${arg || 'not truthy'}`;
```

### `allowAny`

Examples of additional **correct** code for this rule with `{ allowAny: true }`:

```ts
const user = JSON.parse('{ "name": "foo" }');
const msg1 = `arg = ${user.name}`;
const msg2 = `arg = ${user.name || 'the user with no name'}`;
```

### `allowNullish`

Examples of additional **correct** code for this rule with `{ allowNullish: true }`:

```ts
const arg = condition ? 'ok' : null;
const msg1 = `arg = ${arg}`;
```

### `allowRegExp`

Examples of additional **correct** code for this rule with `{ allowRegExp: true }`:

```ts
const arg = new RegExp('foo');
const msg1 = `arg = ${arg}`;
```

```ts
const arg = /foo/;
const msg1 = `arg = ${arg}`;
```
