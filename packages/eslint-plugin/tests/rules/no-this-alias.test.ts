import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-this-alias';

const ruleTester = new RuleTester();

ruleTester.run('no-this-alias', rule, {
  assertionOptions: {
    requireData: true,
  },
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
      options: [{ allowDestructuring: true }],
    },
    {
      code: 'const self = this;',
      options: [{ allowedNames: ['self'] }],
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
      errors: [
        {
          column: 7,
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'thisAssignment',
        },
      ],
      options: [{ allowDestructuring: true }],
    },
    {
      code: 'const self = this;',
      errors: [
        {
          column: 7,
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'thisAssignment',
        },
      ],
    },
    {
      code: `
let that;
that = this;
      `,
      errors: [
        {
          column: 1,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'thisAssignment',
        },
      ],
    },
    {
      code: 'const { props, state } = this;',
      errors: [
        {
          column: 7,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'thisDestructure',
        },
      ],
      options: [{ allowDestructuring: false }],
    },
    {
      code: `
var unscoped = this;
      `,
      errors: [
        {
          column: 5,
          endColumn: 13,
          endLine: 2,
          line: 2,
          messageId: 'thisAssignment',
        },
      ],
    },
    {
      code: `
function testFunction() {
  let inFunction = this;
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'thisAssignment',
        },
      ],
    },
    {
      code: `
const testLambda = () => {
  const inLambda = this;
};
      `,
      errors: [
        {
          column: 9,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'thisAssignment',
        },
      ],
    },
    {
      code: `
class TestClass {
  constructor() {
    const inConstructor = this;

    const asString = 'this';
    const asArray = [this];
    const asArrayString = ['this'];
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'thisAssignment',
        },
      ],
      options: [{ allowDestructuring: false }],
    },
    {
      code: `
class TestClass {
  constructor() {
    const asThis: this = this;

    const asString = 'this';
    const asArray = [this];
    const asArrayString = ['this'];
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'thisAssignment',
        },
      ],
      options: [{ allowDestructuring: false }],
    },
    {
      code: `
class TestClass {
  public act(scope: this = this) {
    const inMemberFunction = this;
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 27,
          endLine: 4,
          line: 4,
          messageId: 'thisAssignment',
        },
      ],
      options: [{ allowDestructuring: false }],
    },
    {
      code: `
class TestClass {
  public act(scope: this = this) {
    const { act } = this;
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'thisDestructure',
        },
      ],
      options: [{ allowDestructuring: false }],
    },
    {
      code: `
class TestClass {
  public act(scope: this = this) {
    const { act, constructor } = this;
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'thisDestructure',
        },
      ],
      options: [{ allowDestructuring: false }],
    },
    {
      code: `
class TestClass {
  public act(scope: this = this) {
    const [foo] = this;
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'thisDestructure',
        },
      ],
      options: [{ allowDestructuring: false }],
    },
    {
      code: `
class TestClass {
  public act(scope: this = this) {
    const [foo, bar] = this;
  }
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'thisDestructure',
        },
      ],
      options: [{ allowDestructuring: false }],
    },
  ],
});
