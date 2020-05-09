import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-this-alias';
import { RuleTester } from '../RuleTester';

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

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
      options: [
        {
          allowDestructuring: true,
        },
      ],
      errors: [idError],
    },
    {
      code: 'const self = this;',
      errors: [idError],
    },
    {
      code: 'const { props, state } = this;',
      options: [
        {
          allowDestructuring: false,
        },
      ],
      errors: [destructureError],
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
      options: [
        {
          allowDestructuring: false,
        },
      ],
      errors: [
        idError,
        idError,
        idError,
        destructureError,
        destructureError,
        arrayDestructureError,
        arrayDestructureError,
      ],
    },
  ],
});
