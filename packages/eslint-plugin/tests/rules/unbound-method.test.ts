import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, { MessageIds, Options } from '../../src/rules/unbound-method';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

function addContainsMethodsClass(code: string): string {
  return `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

${code}
  `;
}
function addContainsMethodsClassInvalid(
  code: string[],
): TSESLint.InvalidTestCase<MessageIds, Options>[] {
  return code.map(c => ({
    code: addContainsMethodsClass(c),
    errors: [
      {
        line: 12,
        messageId: 'unbound',
      },
    ],
  }));
}

ruleTester.run('unbound-method', rule, {
  valid: [
    'Promise.resolve().then(console.log);',
    "['1', '2', '3'].map(Number.parseInt);",
    '[5.2, 7.1, 3.6].map(Math.floor);',
    'const x = console.log;',
    ...[
      'instance.bound();',
      'instance.unbound();',

      'ContainsMethods.boundStatic();',
      'ContainsMethods.unboundStatic();',

      'const bound = instance.bound;',
      'const boundStatic = ContainsMethods;',

      'const { bound } = instance;',
      'const { boundStatic } = ContainsMethods;',

      '(instance.bound)();',
      '(instance.unbound)();',

      '(ContainsMethods.boundStatic)();',
      '(ContainsMethods.unboundStatic)();',

      'instance.bound``;',
      'instance.unbound``;',

      'if (instance.bound) { }',
      'if (instance.unbound) { }',

      'if (instance.bound !== undefined) { }',
      'if (instance.unbound !== undefined) { }',

      'if (ContainsMethods.boundStatic) { }',
      'if (ContainsMethods.unboundStatic) { }',

      'if (ContainsMethods.boundStatic !== undefined) { }',
      'if (ContainsMethods.unboundStatic !== undefined) { }',

      'if (ContainsMethods.boundStatic && instance) { }',
      'if (ContainsMethods.unboundStatic && instance) { }',

      'if (instance.bound || instance) { }',
      'if (instance.unbound || instance) { }',

      'ContainsMethods.unboundStatic && 0 || ContainsMethods;',

      '(instance.bound || instance) ? 1 : 0',
      '(instance.unbound || instance) ? 1 : 0',

      'while (instance.bound) { }',
      'while (instance.unbound) { }',

      'while (instance.bound !== undefined) { }',
      'while (instance.unbound !== undefined) { }',

      'while (ContainsMethods.boundStatic) { }',
      'while (ContainsMethods.unboundStatic) { }',

      'while (ContainsMethods.boundStatic !== undefined) { }',
      'while (ContainsMethods.unboundStatic !== undefined) { }',

      'instance.bound as any;',
      'ContainsMethods.boundStatic as any;',

      'instance.bound++;',
      '+instance.bound;',
      '++instance.bound;',
      'instance.bound--;',
      '-instance.bound;',
      '--instance.bound;',
      'instance.bound += 1;',
      'instance.bound -= 1;',
      'instance.bound *= 1;',
      'instance.bound /= 1;',

      'instance.bound || 0;',
      'instance.bound && 0;',

      'instance.bound ? 1 : 0;',
      'instance.unbound ? 1 : 0;',

      'ContainsMethods.boundStatic++;',
      '+ContainsMethods.boundStatic;',
      '++ContainsMethods.boundStatic;',
      'ContainsMethods.boundStatic--;',
      '-ContainsMethods.boundStatic;',
      '--ContainsMethods.boundStatic;',
      'ContainsMethods.boundStatic += 1;',
      'ContainsMethods.boundStatic -= 1;',
      'ContainsMethods.boundStatic *= 1;',
      'ContainsMethods.boundStatic /= 1;',

      'ContainsMethods.boundStatic || 0;',
      'instane.boundStatic && 0;',

      'ContainsMethods.boundStatic ? 1 : 0;',
      'ContainsMethods.unboundStatic ? 1 : 0;',

      "typeof instance.bound === 'function';",
      "typeof instance.unbound === 'function';",

      "typeof ContainsMethods.boundStatic === 'function';",
      "typeof ContainsMethods.unboundStatic === 'function';",

      'instance.unbound = () => {};',
      'instance.unbound = instance.unbound.bind(instance);',
      'if (!!instance.unbound) {}',
      'void instance.unbound',
      'delete instance.unbound',
    ].map(addContainsMethodsClass),
    `
interface RecordA {
  readonly type: 'A';
  readonly a: {};
}
interface RecordB {
  readonly type: 'B';
  readonly b: {};
}
type AnyRecord = RecordA | RecordB;

function test(obj: AnyRecord) {
  switch (obj.type) {
  }
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/496
    `
class CommunicationError {
  constructor() {
    const x = CommunicationError.prototype;
  }
}
    `,
    `
class CommunicationError {}
const x = CommunicationError.prototype;
    `,
    // optional chain
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

function foo(instance: ContainsMethods | null) {
  instance?.bound();
  instance?.unbound();

  instance?.bound++;

  if (instance?.bound) {
  }
  if (instance?.unbound) {
  }

  typeof instance?.bound === 'function';
  typeof instance?.unbound === 'function';
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/1425
    `
interface OptionalMethod {
  mightBeDefined?(): void;
}

const x: OptionalMethod = {};
declare const myCondition: boolean;
if (myCondition || x.mightBeDefined) {
  console.log('hello world');
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/1256
    `
class A {
  unbound(): void {
    this.unbound = undefined;
    this.unbound = this.unbound.bind(this);
  }
}
    `,
    'const { parseInt } = Number;',
    'const { log } = console;',
    `
let parseInt;
({ parseInt } = Number);
    `,
    `
let log;
({ log } = console);
    `,
    `
const foo = {
  bar: 'bar',
};
const { bar } = foo;
    `,
    `
class Foo {
  unbnound() {}
  bar = 4;
}
const { bar } = new Foo();
    `,
    `
class Foo {
  bound = () => 'foo';
}
const { bound } = new Foo();
    `,
  ],
  invalid: [
    {
      code: `
class Console {
  log(str) {
    process.stdout.write(str);
  }
}

const console = new Console();

Promise.resolve().then(console.log);
      `,
      errors: [
        {
          line: 10,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
import { console } from './class';
const x = console.log;
      `,
      errors: [
        {
          line: 3,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: addContainsMethodsClass(`
function foo(arg: ContainsMethods | null) {
  const unbound = arg?.unbound;
  arg.unbound += 1;
  arg?.unbound as any;
}
      `),
      errors: [
        {
          line: 14,
          messageId: 'unbound',
        },
        {
          line: 15,
          messageId: 'unbound',
        },
        {
          line: 16,
          messageId: 'unbound',
        },
      ],
    },
    ...addContainsMethodsClassInvalid([
      'const unbound = instance.unbound;',
      'const unboundStatic = ContainsMethods.unboundStatic;',

      'const { unbound } = instance;',
      'const { unboundStatic } = ContainsMethods;',

      '<any>instance.unbound;',
      'instance.unbound as any;',

      '<any>ContainsMethods.unboundStatic;',
      'ContainsMethods.unboundStatic as any;',

      'instance.unbound || 0;',
      'ContainsMethods.unboundStatic || 0;',

      'instance.unbound ? instance.unbound : null',
    ]),
    {
      code: `
class ContainsMethods {
  unbound?(): void;

  static unboundStatic?(): void;
}

new ContainsMethods().unbound;

ContainsMethods.unboundStatic;
      `,
      options: [
        {
          ignoreStatic: true,
        },
      ],
      errors: [
        {
          line: 8,
          messageId: 'unbound',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/496
    {
      code: `
class CommunicationError {
  foo() {}
}
const x = CommunicationError.prototype.foo;
      `,
      errors: [
        {
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      // Promise.all is not auto-bound to Promise
      code: 'const x = Promise.all;',
      errors: [
        {
          line: 1,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound() {}
}
const instance = new Foo();

let x;

x = instance.unbound; // THIS SHOULD ERROR
instance.unbound = x; // THIS SHOULD NOT
      `,
      errors: [
        {
          line: 9,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
const unbound = new Foo().unbound;
      `,
      errors: [
        {
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound() {}
}
const { unbound } = new Foo();
      `,
      errors: [
        {
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
const { unbound } = new Foo();
      `,
      errors: [
        {
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound() {}
}
let unbound;
({ unbound } = new Foo());
      `,
      errors: [
        {
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
let unbound;
({ unbound } = new Foo());
      `,
      errors: [
        {
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class CommunicationError {
  foo() {}
}
const { foo } = CommunicationError.prototype;
      `,
      errors: [
        {
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class CommunicationError {
  foo() {}
}
let foo;
({ foo } = CommunicationError.prototype);
      `,
      errors: [
        {
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
import { console } from './class';
const { log } = console;
      `,
      errors: [
        {
          line: 3,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: 'const { all } = Promise;',
      errors: [
        {
          line: 1,
          messageId: 'unbound',
        },
      ],
    },
  ],
});
