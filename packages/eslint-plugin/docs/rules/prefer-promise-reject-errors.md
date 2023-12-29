---
description: 'Require using Error objects as Promise rejection reasons.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/prefer-promise-reject-errors** for documentation.

This rule extends the base [`eslint/prefer-promise-reject-errors`](https://eslint.org/docs/rules/prefer-promise-reject-errors) rule.
It uses type information to enforce that `Promise`s are only rejected with `Error` objects.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
// Promise.reject

Promise.reject('error');

const err = new Error();
Promise.reject('an ' + err);

const foo = {
  bar: '',
};
Promise.reject(foo.bar);

// new Promise

new Promise((resolve, reject) => reject('error'));

new Promise((resolve, reject) => {
  const err = new Error();
  reject('an ' + err);
});

new Promise((resolve, reject) => {
  const foo = {
    bar: '',
  };
  return reject(foo.bar);
});
```

### ✅ Correct

```ts
// Promise.reject

Promise.reject(new Error());

try {
  // ...
} catch (e) {
  Promise.reject(e);
}

const foo = {
  bar: new Error(),
};
Promise.reject(foo.bar);

class CustomError extends Error {
  // ...
}
Promise.reject(new CustomError());

// new Promise

new Promise((resolve, reject) => reject(new Error()));

try {
  // ...
} catch (e) {
  new Promise((resolve, reject) => reject(e));
}

new Promise((resolve, reject) => {
  const foo = {
    bar: new Error(),
  };
  return reject(foo.bar);
});

new Promise((resolve, reject) => {
  class CustomError extends Error {
    // ...
  }
  return reject(new CustomError());
});
```
