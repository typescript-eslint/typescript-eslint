import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-this-alias';

const ruleTester = new RuleTester();

ruleTester.run('no-this-alias', rule, {
  valid: [
    'const self = foo(this);',
    {
      code: `
const { props, state } = this;
const { length } = this;
const { length, toString } = this;
const [foo] = this;
const [foo, bar] = this;
      `,
      options: [
        {
          allowDestructuring: true,
        },
      ],
    },
    {
      code: 'const self = this;',
      options: [
        {
          allowedNames: ['self'],
        },
      ],
    },
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/281
    `
declare module 'foo' {
  declare const aVar: string;
}
    `,
  ],

  invalid: [
    {
      code: 'const self = this;',
      errors: [{ messageId: 'thisAssignment' }],
      options: [
        {
          allowDestructuring: true,
        },
      ],
    },
    {
      code: 'const self = this;',
      errors: [{ messageId: 'thisAssignment' }],
    },
    {
      code: `
let that;
that = this;
      `,
      errors: [{ messageId: 'thisAssignment' }],
    },
    {
      code: 'const { props, state } = this;',
      errors: [{ messageId: 'thisDestructure' }],
      options: [
        {
          allowDestructuring: false,
        },
      ],
    },
    {
      code: `
var unscoped = this;

function testFunction() {
  let inFunction = this;
}
const testLambda = () => {
  const inLambda = this;
};
      `,
      errors: [
        { messageId: 'thisAssignment' },
        { messageId: 'thisAssignment' },
        { messageId: 'thisAssignment' },
      ],
    },
    {
      code: `
class TestClass {
  constructor() {
    const inConstructor = this;
    const asThis: this = this;

    const asString = 'this';
    const asArray = [this];
    const asArrayString = ['this'];
  }

  public act(scope: this = this) {
    const inMemberFunction = this;
    const { act } = this;
    const { act, constructor } = this;
    const [foo] = this;
    const [foo, bar] = this;
  }
}
      `,
      errors: [
        { messageId: 'thisAssignment' },
        { messageId: 'thisAssignment' },
        { messageId: 'thisAssignment' },
        { messageId: 'thisDestructure' },
        { messageId: 'thisDestructure' },
        { messageId: 'thisDestructure' },
        { messageId: 'thisDestructure' },
      ],
      options: [
        {
          allowDestructuring: false,
        },
      ],
    },
  ],
});
