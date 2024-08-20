import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-this-alias';

const idError = {
  messageId: 'thisAssignment' as const,
  type: AST_NODE_TYPES.Identifier,
};
const destructureError = {
  messageId: 'thisDestructure' as const,
  type: AST_NODE_TYPES.ObjectPattern,
};
const arrayDestructureError = {
  messageId: 'thisDestructure' as const,
  type: AST_NODE_TYPES.ArrayPattern,
};

const ruleTester = new RuleTester();

ruleTester.run('no-this-alias', rule, {
  invalid: [
    {
      code: 'const self = this;',
      errors: [idError],
      options: [
        {
          allowDestructuring: true,
        },
      ],
    },
    {
      code: 'const self = this;',
      errors: [idError],
    },
    {
      code: `
let that;
that = this;
      `,
      errors: [idError],
    },
    {
      code: 'const { props, state } = this;',
      errors: [destructureError],
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
      errors: [idError, idError, idError],
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
        idError,
        idError,
        idError,
        destructureError,
        destructureError,
        arrayDestructureError,
        arrayDestructureError,
      ],
      options: [
        {
          allowDestructuring: false,
        },
      ],
    },
  ],

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
});
