---
description: 'Require using Error objects as Promise rejection reasons.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/prefer-promise-reject-errors** for documentation.

It is considered good practice to only pass instances of the built-in `Error` object to the `reject()` function for user-defined errors in Promises. `Error` objects automatically store a stack trace, which can be used to debug an error by determining where it came from. If a Promise is rejected with a non-`Error` value, it can be difficult to determine where the rejection occurred.

This rule restricts what can be used as an Promise rejection reason.

## Examples

<!--tabs-->

### ❌ Incorrect

```ts
// Promise.reject

Promise.reject('error');

Promise.reject(0);

Promise.reject(undefined);

Promise.reject(null);

const err = new Error();
Promise.reject('an ' + err);

const err = new Error();
Promise.reject(`${err}`);

const err = '';
Promise.reject(err);

function err() {
  return '';
}
Promise.reject(err());

const foo = {
  bar: '',
};
Promise.reject(foo.bar);

// new Promise

new Promise((resolve, reject) => reject('error'));

new Promise((resolve, reject) => reject(0));

new Promise((resolve, reject) => reject(undefined));

new Promise((resolve, reject) => reject(null));

new Promise((resolve, reject) => {
  const err = new Error();
  reject('an ' + err);
});

new Promise((resolve, reject) => {
  const err = new Error();
  reject(`${err}`);
});

const err = '';
new Promise((resolve, reject) => reject(err));

new Promise((resolve, reject) => {
  function err() {
    return '';
  }
  return reject(err());
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

Promise.reject(new Error('error'));

const e = new Error('error');
Promise.reject(e);

try {
  Promise.reject(new Error('error'));
} catch (e) {
  Promise.reject(e);
}

const err = new Error();
Promise.reject(err);

function err() {
  return new Error();
}
Promise.reject(err());

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

new Promise((resolve, reject) => reject(new Error('error')));

new Promise((resolve, reject) => {
  const e = new Error('error');
  return reject(e);
});

try {
  new Promise((resolve, reject) => reject(new Error('error')));
} catch (e) {
  new Promise((resolve, reject) => reject(e));
}

new Promise((resolve, reject) => {
  const err = new Error();
  return reject(err);
});

new Promise((resolve, reject) => {
  function err() {
    return new Error();
  }
  return reject(err());
});

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
