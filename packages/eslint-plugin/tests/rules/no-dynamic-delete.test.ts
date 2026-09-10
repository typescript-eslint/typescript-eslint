import rule from '../../src/rules/no-dynamic-delete';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-dynamic-delete', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
const container: { [i: string]: 0 } = {};
delete container.aaa;
    `,
    `
const container: { [i: string]: 0 } = {};
delete container.delete;
    `,
    `
const container: { [i: string]: 0 } = {};
delete container[7];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container[-7];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['-Infinity'];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['+Infinity'];
    `,
    `
const value = 1;
delete value;
    `,
    `
const value = 1;
delete -value;
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['aaa'];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['delete'];
    `,
    `
const container: { [i: string]: 0 } = {};
delete container['NaN'];
    `,
  ],
  invalid: [
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container['aa' + 'b'];
      `,
      errors: [
        {
          column: 18,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[+7];
      `,
      errors: [
        {
          column: 18,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[-Infinity];
      `,
      errors: [
        {
          column: 18,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[+Infinity];
      `,
      errors: [
        {
          column: 18,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[NaN];
      `,
      errors: [
        {
          column: 18,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
const name = 'name';
delete container[name];
      `,
      errors: [
        {
          column: 18,
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
const getName = () => 'aaa';
delete container[getName()];
      `,
      errors: [
        {
          column: 18,
          endColumn: 27,
          endLine: 4,
          line: 4,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
const name = { foo: { bar: 'bar' } };
delete container[name.foo.bar];
      `,
      errors: [
        {
          column: 18,
          endColumn: 30,
          endLine: 4,
          line: 4,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[+'Infinity'];
      `,
      errors: [
        {
          column: 18,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
    {
      code: `
const container: { [i: string]: 0 } = {};
delete container[typeof 1];
      `,
      errors: [
        {
          column: 18,
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'dynamicDelete',
        },
      ],
      output: null,
    },
  ],
});
