import path from 'path';
import rule from '../../src/rules/unbound-method';
import { RuleTester } from '../RuleTester';

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('unbound-method', rule, {
  valid: [
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

instance.bound();
instance.unbound();

ContainsMethods.boundStatic();
ContainsMethods.unboundStatic();

{
    const bound = instance.bound;
    const boundStatic = ContainsMethods;
}
{
    const { bound } = instance;
    const { boundStatic } = ContainsMethods;
}

(instance.bound)();
(instance.unbound)();

(ContainsMethods.boundStatic)();
(ContainsMethods.unboundStatic)();

instance.bound\`\`;
instance.unbound\`\`;

if (instance.bound) { }
if (instance.unbound) { }

if (instance.bound !== undefined) { }
if (instance.unbound !== undefined) { }

if (ContainsMethods.boundStatic) { }
if (ContainsMethods.unboundStatic) { }

if (ContainsMethods.boundStatic !== undefined) { }
if (ContainsMethods.unboundStatic !== undefined) { }

while (instance.bound) { }
while (instance.unbound) { }

while (instance.bound !== undefined) { }
while (instance.unbound !== undefined) { }

while (ContainsMethods.boundStatic) { }
while (ContainsMethods.unboundStatic) { }

while (ContainsMethods.boundStatic !== undefined) { }
while (ContainsMethods.unboundStatic !== undefined) { }

instance.bound as any;
ContainsMethods.boundStatic as any;

instance.bound++;
+instance.bound;
++instance.bound;
instance.bound--;
-instance.bound;
--instance.bound;
instance.bound += 1;
instance.bound -= 1;
instance.bound *= 1;
instance.bound /= 1;

instance.bound || 0;
instane.bound && 0;

instance.bound ? 1 : 0;
instance.unbound ? 1 : 0;

ContainsMethods.boundStatic++;
+ContainsMethods.boundStatic;
++ContainsMethods.boundStatic;
ContainsMethods.boundStatic--;
-ContainsMethods.boundStatic;
--ContainsMethods.boundStatic;
ContainsMethods.boundStatic += 1;
ContainsMethods.boundStatic -= 1;
ContainsMethods.boundStatic *= 1;
ContainsMethods.boundStatic /= 1;

ContainsMethods.boundStatic || 0;
instane.boundStatic && 0;

ContainsMethods.boundStatic ? 1 : 0;
ContainsMethods.unboundStatic ? 1 : 0;

typeof instance.bound === 'function';
typeof instance.unbound === 'function';

typeof ContainsMethods.boundStatic === 'function';
typeof ContainsMethods.unboundStatic === 'function';
    `,
    `interface RecordA {
  readonly type: "A"
  readonly a: {}
}
interface RecordB {
  readonly type: "B"
  readonly b: {}
}
type AnyRecord = RecordA | RecordB

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
  ],
  invalid: [
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;
  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

const instance = new ContainsMethods();

{
  const unbound = instance.unbound;
  const unboundStatic = ContainsMethods.unboundStatic;
}
{
  const { unbound } = instance.unbound;
  const { unboundStatic } = ContainsMethods.unboundStatic;
}

<any>instance.unbound;
instance.unbound as any;

<any>ContainsMethods.unboundStatic;
ContainsMethods.unboundStatic as any;

instance.unbound++;
+instance.unbound;
++instance.unbound;
instance.unbound--;
-instance.unbound;
--instance.unbound;
instance.unbound += 1;
instance.unbound -= 1;
instance.unbound *= 1;
instance.unbound /= 1;

instance.unbound || 0;
instance.unbound && 0;

ContainsMethods.unboundStatic++;
+ContainsMethods.unboundStatic;
++ContainsMethods.unboundStatic;
ContainsMethods.unboundStatic--;
-ContainsMethods.unboundStatic;
--ContainsMethods.unboundStatic;
ContainsMethods.unboundStatic += 1;
ContainsMethods.unboundStatic -= 1;
ContainsMethods.unboundStatic *= 1;
ContainsMethods.unboundStatic /= 1;

ContainsMethods.unboundStatic || 0;
ContainsMethods.unboundStatic && 0;
`,
      errors: [
        {
          line: 12,
          messageId: 'unbound',
        },
        {
          line: 13,
          messageId: 'unbound',
        },
        {
          line: 16,
          messageId: 'unbound',
        },
        {
          line: 17,
          messageId: 'unbound',
        },
        {
          line: 20,
          messageId: 'unbound',
        },
        {
          line: 21,
          messageId: 'unbound',
        },
        {
          line: 23,
          messageId: 'unbound',
        },
        {
          line: 24,
          messageId: 'unbound',
        },
        {
          line: 27,
          messageId: 'unbound',
        },
        {
          line: 30,
          messageId: 'unbound',
        },
        {
          line: 32,
          messageId: 'unbound',
        },
        {
          line: 33,
          messageId: 'unbound',
        },
        {
          line: 34,
          messageId: 'unbound',
        },
        {
          line: 35,
          messageId: 'unbound',
        },
        {
          line: 37,
          messageId: 'unbound',
        },
        {
          line: 41,
          messageId: 'unbound',
        },
        {
          line: 44,
          messageId: 'unbound',
        },
        {
          line: 46,
          messageId: 'unbound',
        },
        {
          line: 47,
          messageId: 'unbound',
        },
        {
          line: 48,
          messageId: 'unbound',
        },
        {
          line: 49,
          messageId: 'unbound',
        },
        {
          line: 51,
          messageId: 'unbound',
        },
      ],
    },
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
  ],
});
