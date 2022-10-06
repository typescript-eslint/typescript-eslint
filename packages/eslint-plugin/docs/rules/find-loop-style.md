---
description: 'Enforce one style of finding an element in an array where possible.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/find-loop-style** for documentation.

Todo.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
for (const item of array) {
  if (condition(item)) {
    return item;
  }
}
```

```ts
let result: string | undefined = undefined;
for (const item of array) {
  if (condition(item)) {
    result = item;
    break;
  }
}
```

### ✅ Correct

```ts
let result = array.find(item => condition(item));
```

```ts
return array.find(item => condition(item));
```
