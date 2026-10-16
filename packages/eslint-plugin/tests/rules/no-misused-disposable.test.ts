import rule from '../../src/rules/no-misused-disposable';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-misused-disposable', rule, {
  valid: [
    `
declare function makeDisposable(): Disposable;
using foo = makeDisposable();
    `,
    `
declare function makeAsyncDisposable(): AsyncDisposable;
async function test() {
  await using foo = makeAsyncDisposable();
}
    `,
    `
declare function makeDisposable(): Disposable;
new (class {
  constructor() {
    using foo = makeDisposable();
  }
})();
    `,
    `
declare function makeDisposable(): Disposable;
function foo() {
  return makeDisposable();
}
    `,
    `
declare function makeDisposable(): Disposable;
function foo() {
  const x = makeDisposable();
  return x;
}
    `,
    // passed as an argument to a function accepting a disposable
    `
declare function makeDisposable(): Disposable;
declare function acceptsDisposable(d: Disposable): void;
acceptsDisposable(makeDisposable());
    `,
    `
declare function makeDisposable(): Disposable;
declare function acceptsDisposable(d: Disposable): void;
function foo() {
  const x = makeDisposable();
  acceptsDisposable(x);
}
    `,
    `
declare function makeDisposable(): Disposable;
declare function doSomething(): void;

function foo() {
  const x = makeDisposable();
  doSomething();
  x[Symbol.dispose]();
}
    `,
    // regression test for control flow bug when a loop follows the disposal
    `
declare function makeDisposable(): Disposable;
declare function doSomething(): void;

function foo() {
  const x = makeDisposable();
  doSomething();
  x[Symbol.dispose]();

  for (const item of [1, 2, 3]) {
  }
}
    `,
    `
declare function makeDisposable(): Disposable;
declare function doSomething(): void;

function foo() {
  const x = makeDisposable();
  try {
    doSomething();
  } finally {
    x[Symbol.dispose]();
  }
}
    `,
    `
declare function makeDisposable(): Disposable;
declare function doSomething(): void;

function foo() {
  const x = makeDisposable();
  try {
    doSomething();
  } finally {
    x?.[Symbol.dispose]?.();
  }
}
    `,
    `
declare function makeDisposable(): Disposable;
declare function doSomething(): void;
const symbolDisposeAlias = Symbol.dispose;

function foo() {
  const x = makeDisposable();
  try {
    doSomething();
  } finally {
    x[symbolDisposeAlias]();
  }
}
    `,
    `
declare function makeAsyncDisposable(): AsyncDisposable;
declare function doSomething(): void;

async function foo() {
  const x = makeAsyncDisposable();
  try {
    doSomething();
  } finally {
    await x[Symbol.asyncDispose]();
  }
}
    `,
    `
declare function makeDisposable(): Disposable;
function foo() {
  const x = makeDisposable();
  if (Math.random() > 0.5) {
    return x;
  }
  return x;
}
    `,
    `
declare function makeDisposable(): Disposable;

function foo() {
  const x = makeDisposable();
  if (Math.random() > 0.5) {
    x[Symbol.dispose]();
    return;
  }
  return x;
}
    `,
    `
declare function makeThing(): { a: string };
declare function acceptsDisposable(d: Disposable): void;
acceptsDisposable(makeThing());
    `,
    `
declare function makeDisposable(): Disposable;
declare const cond: boolean;

using foo = cond ? makeDisposable() : makeDisposable();
    `,
    `
declare function f(): void;
declare function makeDisposable(): Disposable;
using foo = (f(), makeDisposable());
    `,
    `
declare function makeDisposable(): Disposable;
declare const cond: boolean;
using foo = cond && makeDisposable();
    `,
    `
declare function makeDisposable(): Disposable;
declare const cond: boolean;
using foo = cond || makeDisposable();
    `,
    `
declare function makeDisposable(): Disposable | undefined;
declare const cond: boolean;
using foo = makeDisposable() || cond;
    `,
    `
declare function makeDisposable(): Disposable;
declare const cond: boolean;
using foo = makeDisposable() || cond;
    `,
    `
declare function makeDisposable(): Disposable | undefined;
declare const cond: boolean;
using foo = makeDisposable() || makeDisposable();
    `,
    `
declare function makeDisposable(): Disposable;
const foo = () => {
  return makeDisposable();
};
    `,
    `
declare function makeDisposable(): Disposable;
class Foo {
  method() {
    return makeDisposable();
  }
}
    `,
    `
declare function makeDisposable(): Disposable;
function foo(items: number[]) {
  for (const item of items) {
    const x = makeDisposable();
    x[Symbol.dispose]();
  }
}
    `,
    `
declare function makeDisposable(): Disposable;
function foo(x: number) {
  switch (x) {
    case 1: {
      const d1 = makeDisposable();
      d1[Symbol.dispose]();
      break;
    }
    default: {
      const d2 = makeDisposable();
      return d2;
    }
  }
}
    `,
    `
declare function makeDisposable(): Disposable;
declare const cond: true | undefined;
const foo = cond && makeDisposable();
foo?.[Symbol.dispose]();
    `,
    `
declare function makeDisposable(): Disposable;
let foo = makeDisposable();
foo[Symbol.dispose]();
    `,
    `
declare function makeDisposable(): Disposable;
function outer() {
  const x = makeDisposable();
  function inner() {
    return x;
  }
  return x;
}
    `,

    `
declare function makeDisposable(): Disposable;
function foo(items: number[]) {
  for (const item of items) {
    const x = makeDisposable();
    if (item > 0) {
      x[Symbol.dispose]();
    } else {
      return x;
    }
  }
}
    `,
    `
declare function makeDisposable(): Disposable;
let foo;
if (Math.random() > 0.5) {
  foo = makeDisposable();
} else {
  foo = makeDisposable();
}
foo[Symbol.dispose]();
    `,
    `
declare function makeDisposable(): Disposable;
let foo;
if (Math.random() > 0.5) {
  foo = makeDisposable();
} else {
  foo = makeDisposable();
}
using bar = foo;
    `,
    `
declare function makeDisposable(): Disposable;
const foo = makeDisposable();
using bar = foo;
    `,
    `
declare function makeDisposable(): Disposable;

using d = makeDisposable() satisfies {};
    `,
    `
declare function makeDisposable(): Disposable;

using d = makeDisposable() as {};
    `,
    // member accesses aren't considered to have "produced" a disposable,
    // just accessed it
    `
declare const o: { d: Disposable };
console.log(o.d);
    `,
    `
declare function makeDisposable(): Disposable;
let foo;
if (Math.random() > 0.5) {
  foo = makeDisposable();
} else {
  foo = makeDisposable();
}
if (Math.random() > 0.5) {
  foo ||= 42;
}

using bar = foo;
    `,
    `
declare function makeDisposable(): Disposable;
let foo;
if (Math.random() > 0.5) {
  foo = makeDisposable();
} else {
  foo = makeDisposable();
}
if (Math.random() > 0.5) {
  foo ??= 42;
}

using bar = foo;
    `,
    // iteration handles disposable iterables: for...of
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
for (const x of makeIterableDisposable()) {
  console.log(x);
}
    `,
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const it = makeIterableDisposable();
for (const x of it) {
  console.log(x);
}
    `,
    // for await...of handles sync-disposable async-iterables
    `
interface AsyncIterableDisposable extends Disposable, AsyncIterable<number> {}
declare function makeAsyncIterableDisposable(): AsyncIterableDisposable;
async function f() {
  for await (const x of makeAsyncIterableDisposable()) {
    console.log(x);
  }
}
    `,
    // for await...of also handles sync iterables
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
async function f() {
  const it = makeIterableDisposable();
  for await (const x of it) {
    console.log(x);
  }
}
    `,
    // array spread
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const arr = [...makeIterableDisposable()];
    `,
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const it = makeIterableDisposable();
const arr = [...it];
    `,
    // array destructuring
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const [...nums] = makeIterableDisposable();
    `,
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const it = makeIterableDisposable();
const [first] = it;
    `,
    // partial (even empty) destructuring closes the iterator via
    // IteratorClose, the same way an early \`break\` out of \`for...of\` does
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const [] = makeIterableDisposable();
    `,
    // array destructuring assignment
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const it = makeIterableDisposable();
let first;
[first] = it;
    `,
    // call and new argument spread
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
declare function sum(...nums: number[]): number;
sum(...makeIterableDisposable());
    `,
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
declare function sum(...nums: number[]): number;
const it = makeIterableDisposable();
sum(...it);
    `,
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
class Holder {
  constructor(...nums: number[]) {}
}
new Holder(...makeIterableDisposable());
    `,
    // yield* delegation
    `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
function* gen() {
  yield* makeIterableDisposable();
}
    `,
    `
interface AsyncIterableDisposable extends Disposable, AsyncIterable<number> {}
declare function makeAsyncIterableDisposable(): AsyncIterableDisposable;
async function* gen() {
  yield* makeAsyncIterableDisposable();
}
    `,
    // async-disposable sync-iterables are handled by sync iteration too
    `
interface IterableAsyncDisposable extends AsyncDisposable, Iterable<number> {}
declare function makeIterableAsyncDisposable(): IterableAsyncDisposable;
for (const x of makeIterableAsyncDisposable()) {
  console.log(x);
}
    `,
    // async-disposable async-iterables are handled by async iteration
    `
interface AsyncIterableAsyncDisposable
  extends AsyncDisposable, AsyncIterable<number> {}
declare function makeAsyncIterableAsyncDisposable(): AsyncIterableAsyncDisposable;
async function f() {
  for await (const x of makeAsyncIterableAsyncDisposable()) {
    console.log(x);
  }
}
    `,
    // a manually-advanced generator, correctly managed with \`using\`, from
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/Symbol.dispose
    `
function* generateNumbers() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log('Cleaning up');
  }
}

function doSomething() {
  using numbers = generateNumbers();
  const res1 = numbers.next();
  // Not iterating the rest of the numbers
  // Before the function exits, the iterator is disposed
  // Logs "Cleaning up"
}

doSomething();
    `,
  ],
  invalid: [
    {
      code: `
declare function makeDisposable(): Disposable;
makeDisposable();
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
const foo = makeDisposable();
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
let foo = makeDisposable();
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
interface MyDisposable extends Disposable {
  prop: string;
}
declare function makeDisposable(): MyDisposable;
makeDisposable().prop;
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
declare function acceptsAnything(v: unknown): void;
acceptsAnything(makeDisposable());
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
function foo() {
  const x = makeDisposable();
  if (Math.random() > 0.5) {
    return x;
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
function foo() {
  const x = makeDisposable();
  if (Math.random() > 0.5) {
    x[Symbol.dispose]();
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
function outer() {
  const x = makeDisposable();
  function inner() {
    return x;
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
interface MyDisposable extends Disposable {
  prop: string;
}
declare function makeDisposable(): MyDisposable;
function foo() {
  const x = makeDisposable();
  console.log(x.prop);
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare class MyDisposable implements Disposable {
  [Symbol.dispose](): void;
}
new MyDisposable();
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
function foo(items: number[]) {
  for (const item of items) {
    const x = makeDisposable();
    if (item > 0) {
      continue;
    }
    x[Symbol.dispose]();
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
function foo(x: number) {
  switch (x) {
    case 1: {
      const d1 = makeDisposable();
      break;
    }
    default: {
      const d2 = makeDisposable();
      return d2;
    }
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
function foo(items: number[]) {
  for (const item of items) {
    const x = makeDisposable();
    if (item > 0) {
      x[Symbol.dispose]();
    }
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
function foo(items: number[]) {
  for (const item of items) {
    const x = makeDisposable();
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
function foo(items: number[]) {
  for (const item of items) {
    makeDisposable();
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function f(): void;
declare function makeDisposable(): Disposable;
using foo = (makeDisposable(), f());
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
declare const cond: boolean;
using foo = makeDisposable() && cond;
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
class Foo {
  method(): unknown {
    return makeDisposable();
  }
}
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
let foo = makeDisposable();
foo = makeDisposable();
foo[Symbol.dispose]();
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
let foo;
if (Math.random() > 0.5) {
  foo = makeDisposable();
} else {
  foo = makeDisposable();
}
if (Math.random() > 0.5) {
  foo = 42;
}

using bar = foo;
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
let foo;
if (Math.random() > 0.5) {
  foo = makeDisposable();
} else {
  foo = makeDisposable();
}
if (Math.random() > 0.5) {
  foo &&= 42;
}

using bar = foo;
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
let foo;
if (Math.random() > 0.5) {
  foo = makeDisposable();
} else {
  foo = makeDisposable();
}
if (Math.random() > 0.5) {
  foo = makeDisposable();
}

using bar = foo;
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
let foo;
if (Math.random() > 0.5) {
  foo = makeDisposable();
} else {
  foo = makeDisposable();
}
if (Math.random() > 0.5) {
  throw new Error('oops');
}

using bar = foo;
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;
declare function acceptsAsyncDisposable(d: AsyncDisposable): void;

acceptsAsyncDisposable(makeDisposable());
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;

makeDisposable() satisfies {};
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    {
      code: `
declare function makeDisposable(): Disposable;

makeDisposable() as {};
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    // object spread copies properties; it does not iterate
    {
      code: `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const obj = { ...makeIterableDisposable() };
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    // sync iteration does not handle an async-only iterable
    {
      code: `
interface AsyncIterableDisposable extends Disposable, AsyncIterable<number> {}
declare function makeAsyncIterableDisposable(): AsyncIterableDisposable;
const arr = [...makeAsyncIterableDisposable()];
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    // a disposable iterable that is never iterated is still misused
    {
      code: `
interface IterableDisposable extends Disposable, Iterable<number> {}
declare function makeIterableDisposable(): IterableDisposable;
const it = makeIterableDisposable();
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
    // manually advancing a generator with .next() is not iteration syntax;
    // without \`using\`, the generator's cleanup never runs. This is the
    // mistake the MDN Iterator[Symbol.dispose] example exists to prevent.
    {
      code: `
function* generateNumbers() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log('Cleaning up');
  }
}

function doSomething() {
  const numbers = generateNumbers();
  const res1 = numbers.next();
}

doSomething();
      `,
      errors: [{ messageId: 'misusedDisposable' }],
    },
  ],
});
