import rule from '../../src/rules/no-misused-promises';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-misused-promises', rule, {
  valid: [
    `
if (true) {
}
    `,
    {
      code: `
if (Promise.resolve()) {
}
      `,
      options: [{ checksConditionals: false }],
    },
    `
if (true) {
} else if (false) {
} else {
}
    `,
    {
      code: `
if (Promise.resolve()) {
} else if (Promise.resolve()) {
} else {
}
      `,
      options: [{ checksConditionals: false }],
    },
    'for (;;) {}',
    'for (let i; i < 10; i++) {}',
    {
      code: 'for (let i; Promise.resolve(); i++) {}',
      options: [{ checksConditionals: false }],
    },
    'do {} while (true);',
    {
      code: 'do {} while (Promise.resolve());',
      options: [{ checksConditionals: false }],
    },
    'while (true) {}',
    {
      code: 'while (Promise.resolve()) {}',
      options: [{ checksConditionals: false }],
    },
    'true ? 123 : 456;',
    {
      code: 'Promise.resolve() ? 123 : 456;',
      options: [{ checksConditionals: false }],
    },
    `
if (!true) {
}
    `,
    {
      code: `
if (!Promise.resolve()) {
}
      `,
      options: [{ checksConditionals: false }],
    },
    '(await Promise.resolve()) || false;',
    {
      code: 'Promise.resolve() || false;',
      options: [{ checksConditionals: false }],
    },
    '(true && (await Promise.resolve())) || false;',
    {
      code: '(true && Promise.resolve()) || false;',
      options: [{ checksConditionals: false }],
    },
    'false || (true && Promise.resolve());',
    '(true && Promise.resolve()) || false;',
    `
async function test() {
  if (await Promise.resolve()) {
  }
}
    `,
    `
async function test() {
  const mixed: Promise | undefined = Promise.resolve();
  if (mixed) {
    await mixed;
  }
}
    `,
    `
if (~Promise.resolve()) {
}
    `,
    `
interface NotQuiteThenable {
  then(param: string): void;
  then(): void;
}
const value: NotQuiteThenable = { then() {} };
if (value) {
}
    `,
    '[1, 2, 3].forEach(val => {});',
    {
      code: '[1, 2, 3].forEach(async val => {});',
      options: [{ checksVoidReturn: false }],
    },
    'new Promise((resolve, reject) => resolve());',
    {
      code: 'new Promise(async (resolve, reject) => resolve());',
      options: [{ checksVoidReturn: false }],
    },
    `
Promise.all(
  ['abc', 'def'].map(async val => {
    await val;
  }),
);
    `,
    `
const fn: (arg: () => Promise<void> | void) => void = () => {};
fn(() => Promise.resolve());
    `,
    `
declare const returnsPromise: (() => Promise<void>) | null;
if (returnsPromise?.()) {
}
    `,
    `
declare const returnsPromise: { call: () => Promise<void> } | null;
if (returnsPromise?.call()) {
}
    `,
    'Promise.resolve() ?? false;',
    `
function test(a: Promise<void> | undefinded) {
  const foo = a ?? Promise.reject();
}
    `,
    `
function test(p: Promise<boolean> | undefined, bool: boolean) {
  if (p ?? bool) {
  }
}
    `,
    `
async function test(p: Promise<boolean | undefined>, bool: boolean) {
  if ((await p) ?? bool) {
  }
}
    `,
    `
async function test(p: Promise<boolean> | undefined) {
  if (await (p ?? Promise.reject())) {
  }
}
    `,
    `
let f;
f = async () => 10;
    `,
    `
let f: () => Promise<void>;
f = async () => 10;
const g = async () => 0;
const h: () => Promise<void> = async () => 10;
    `,
    `
const obj = {
  f: async () => 10,
};
    `,
    `
const f = async () => 123;
const obj = {
  f,
};
    `,
    `
const obj = {
  async f() {
    return 0;
  },
};
    `,
    `
type O = { f: () => Promise<void>; g: () => Promise<void> };
const g = async () => 0;
const obj: O = {
  f: async () => 10,
  g,
};
    `,
    `
type O = { f: () => Promise<void> };
const name = 'f';
const obj: O = {
  async [name]() {
    return 10;
  },
};
    `,
    `
const obj: number = {
  g() {
    return 10;
  },
};
    `,
    `
const obj = {
  f: async () => 'foo',
  async g() {
    return 0;
  },
};
    `,
    `
function f() {
  return async () => 0;
}
function g() {
  return;
}
    `,
    {
      code: `
type O = {
  bool: boolean;
  func: () => Promise<void>;
};
const Component = (obj: O) => null;
<Component bool func={async () => 10} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
const Component: any = () => null;
<Component func={async () => 10} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
interface ItLike {
  (name: string, callback: () => Promise<void>): void;
  (name: string, callback: () => void): void;
}

declare const it: ItLike;

it('', async () => {});
      `,
    },
    {
      code: `
interface ItLike {
  (name: string, callback: () => void): void;
  (name: string, callback: () => Promise<void>): void;
}

declare const it: ItLike;

it('', async () => {});
      `,
    },
    {
      code: `
interface ItLike {
  (name: string, callback: () => void): void;
}
interface ItLike {
  (name: string, callback: () => Promise<void>): void;
}

declare const it: ItLike;

it('', async () => {});
      `,
    },
    {
      code: `
interface ItLike {
  (name: string, callback: () => Promise<void>): void;
}
interface ItLike {
  (name: string, callback: () => void): void;
}

declare const it: ItLike;

it('', async () => {});
      `,
    },
    {
      code: `
interface Props {
  onEvent: (() => void) | (() => Promise<void>);
}

declare function Component(props: Props): any;

const _ = <Component onEvent={async () => {}} />;
      `,
      filename: 'react.tsx',
    },
  ],

  invalid: [
    {
      code: `
if (Promise.resolve()) {
}
      `,
      errors: [
        {
          line: 2,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
if (Promise.resolve()) {
} else if (Promise.resolve()) {
} else {
}
      `,
      errors: [
        {
          line: 2,
          messageId: 'conditional',
        },
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'for (let i; Promise.resolve(); i++) {}',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'do {} while (Promise.resolve());',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'while (Promise.resolve()) {}',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'Promise.resolve() ? 123 : 456;',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
if (!Promise.resolve()) {
}
      `,
      errors: [
        {
          line: 2,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: 'Promise.resolve() || false;',
      errors: [
        {
          line: 1,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
[Promise.resolve(), Promise.reject()].forEach(async val => {
  await val;
});
      `,
      errors: [
        {
          line: 2,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
new Promise(async (resolve, reject) => {
  await Promise.resolve();
  resolve();
});
      `,
      errors: [
        {
          line: 2,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
const fnWithCallback = (arg: string, cb: (err: any, res: string) => void) => {
  cb(null, arg);
};

fnWithCallback('val', async (err, res) => {
  await res;
});
      `,
      errors: [
        {
          line: 6,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
const fnWithCallback = (arg: string, cb: (err: any, res: string) => void) => {
  cb(null, arg);
};

fnWithCallback('val', (err, res) => Promise.resolve(res));
      `,
      errors: [
        {
          line: 6,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
const fnWithCallback = (arg: string, cb: (err: any, res: string) => void) => {
  cb(null, arg);
};

fnWithCallback('val', (err, res) => {
  if (err) {
    return 'abc';
  } else {
    return Promise.resolve(res);
  }
});
      `,
      errors: [
        {
          line: 6,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
const fnWithCallback:
  | ((arg: string, cb: (err: any, res: string) => void) => void)
  | null = (arg, cb) => {
  cb(null, arg);
};

fnWithCallback?.('val', (err, res) => Promise.resolve(res));
      `,
      errors: [
        {
          line: 8,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
const fnWithCallback:
  | ((arg: string, cb: (err: any, res: string) => void) => void)
  | null = (arg, cb) => {
  cb(null, arg);
};

fnWithCallback('val', (err, res) => {
  if (err) {
    return 'abc';
  } else {
    return Promise.resolve(res);
  }
});
      `,
      errors: [
        {
          line: 8,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
function test(bool: boolean, p: Promise<void>) {
  if (bool || p) {
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
function test(bool: boolean, p: Promise<void>) {
  if (bool && p) {
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
function test(a: any, p: Promise<void>) {
  if (a ?? p) {
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
function test(p: Promise<void> | undefined) {
  if (p ?? Promise.reject()) {
  }
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'conditional',
        },
      ],
    },
    {
      code: `
let f: () => void;
f = async () => {
  return 3;
};
      `,
      errors: [
        {
          line: 3,
          messageId: 'voidReturnVariable',
        },
      ],
    },
    {
      code: `
let f: () => void;
f = async () => {
  return 3;
};
      `,
      errors: [
        {
          line: 3,
          messageId: 'voidReturnVariable',
        },
      ],
      options: [{ checksVoidReturn: { variables: true } }],
    },
    {
      code: `
const f: () => void = async () => {
  return 0;
};
const g = async () => 1,
  h: () => void = async () => {};
      `,
      errors: [
        {
          line: 2,
          messageId: 'voidReturnVariable',
        },
        {
          line: 6,
          messageId: 'voidReturnVariable',
        },
      ],
    },
    {
      code: `
const obj: {
  f?: () => void;
} = {};
obj.f = async () => {
  return 0;
};
      `,
      errors: [
        {
          line: 5,
          messageId: 'voidReturnVariable',
        },
      ],
    },
    {
      code: `
type O = { f: () => void };
const obj: O = {
  f: async () => 'foo',
};
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
type O = { f: () => void };
const obj: O = {
  f: async () => 'foo',
};
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnProperty',
        },
      ],
      options: [{ checksVoidReturn: { properties: true } }],
    },
    {
      code: `
type O = { f: () => void };
const f = async () => 0;
const obj: O = {
  f,
};
      `,
      errors: [
        {
          line: 5,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
type O = { f: () => void };
const obj: O = {
  async f() {
    return 0;
  },
};
      `,
      errors: [
        {
          line: 4,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
type O = { f: () => void; g: () => void; h: () => void };
function f(): O {
  const h = async () => 0;
  return {
    async f() {
      return 123;
    },
    g: async () => 0,
    h,
  };
}
      `,
      errors: [
        {
          line: 6,
          messageId: 'voidReturnProperty',
        },
        {
          line: 9,
          messageId: 'voidReturnProperty',
        },
        {
          line: 10,
          messageId: 'voidReturnProperty',
        },
      ],
    },
    {
      code: `
function f(): () => void {
  return async () => 0;
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'voidReturnReturnValue',
        },
      ],
    },
    {
      code: `
function f(): () => void {
  return async () => 0;
}
      `,
      errors: [
        {
          line: 3,
          messageId: 'voidReturnReturnValue',
        },
      ],
      options: [{ checksVoidReturn: { returns: true } }],
    },
    {
      code: `
type O = {
  func: () => void;
};
const Component = (obj: O) => null;
<Component func={async () => 0} />;
      `,
      filename: 'react.tsx',
      errors: [
        {
          line: 6,
          messageId: 'voidReturnAttribute',
        },
      ],
    },
    {
      code: `
type O = {
  func: () => void;
};
const Component = (obj: O) => null;
<Component func={async () => 0} />;
      `,
      filename: 'react.tsx',
      errors: [
        {
          line: 6,
          messageId: 'voidReturnAttribute',
        },
      ],
      options: [{ checksVoidReturn: { attributes: true } }],
    },
    {
      code: `
type O = {
  func: () => void;
};
const g = async () => 'foo';
const Component = (obj: O) => null;
<Component func={g} />;
      `,
      filename: 'react.tsx',
      errors: [
        {
          line: 7,
          messageId: 'voidReturnAttribute',
        },
      ],
    },
    {
      code: `
interface ItLike {
  (name: string, callback: () => number): void;
  (name: string, callback: () => void): void;
}

declare const it: ItLike;

it('', async () => {});
      `,
      errors: [
        {
          line: 9,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
interface ItLike {
  (name: string, callback: () => number): void;
}
interface ItLike {
  (name: string, callback: () => void): void;
}

declare const it: ItLike;

it('', async () => {});
      `,
      errors: [
        {
          line: 11,
          messageId: 'voidReturnArgument',
        },
      ],
    },
    {
      code: `
interface ItLike {
  (name: string, callback: () => void): void;
}
interface ItLike {
  (name: string, callback: () => number): void;
}

declare const it: ItLike;

it('', async () => {});
      `,
      errors: [
        {
          line: 11,
          messageId: 'voidReturnArgument',
        },
      ],
    },
  ],
});
