---
description: 'Disallow aliasing `this`.'
---

> 🛑 This file is source code, not the primary documentation location! 🛑
>
> See **https://typescript-eslint.io/rules/no-this-alias** for documentation.

Assigning a variable to `this` instead of properly using arrow lambdas may be a symptom of pre-ES6 practices
or not managing scope well.

## Examples

<!--tabs-->

### ❌ Incorrect

```js
const self = this;

setTimeout(function () {
  self.doWork();
});
```

### ✅ Correct

```js
setTimeout(() => {
  this.doWork();
});
```

## Options

### `allowDestructuring`

It can sometimes be useful to destructure properties from a class instance, such as retrieving multiple properties from the instance in one of its methods.
`allowDestructuring` allows those destructures and is `true` by default.
You can explicitly disallow them by setting `allowDestructuring` to `false`.

Examples of code for the `{ "allowDestructuring": false }` option:

<!--tabs-->

#### ❌ Incorrect

```ts option='{ "allowDestructuring": false }'
class ComponentLike {
  props: unknown;
  state: unknown;

  render() {
    const { props, state } = this;

    console.log(props);
    console.log(state);
  }
}
```

#### ✅ Correct

```ts option='{ "allowDestructuring": false }'
class ComponentLike {
  props: unknown;
  state: unknown;

  render() {
    console.log(this.props);
    console.log(this.state);
  }
}
```

### `allowedNames`

`no-this-alias` can alternately be used to allow only a specific list of names as `this` aliases.
We recommend against this except as a transitory step towards fixing all rule violations.

Examples of code for the `{ "allowedNames": ["self"] }` option:

<!--tabs-->

#### ❌ Incorrect

```ts option='{ "allowedNames": ["self"] }'
class Example {
  method() {
    const that = this;
  }
}
```

#### ✅ Correct

```ts option='{ "allowedNames": ["self"] }'
class Example {
  method() {
    const self = this;
  }
}
```

## When Not To Use It

If you need to assign `this` to variables, you shouldn’t use this rule.
