import rule from '../../src/rules/semi';
import { RuleTester } from '../RuleTester';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

// the base rule doesn't use a message id...
const missingError: any = {
  message: 'Missing semicolon.',
};

const extraSemicolon: any = {
  message: 'Extra semicolon.',
};

ruleTester.run<MessageIds, Options>('semi', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/366
    { code: 'type Foo = {}', options: ['never'] },
    { code: 'type Foo = {};' },
    // https://github.com/typescript-eslint/typescript-eslint/issues/409
    {
      code: `
class PanCamera extends FreeCamera {
  public invertY: boolean = false;
}
`,
    },
    {
      code: `
class PanCamera extends FreeCamera {
  public invertY: boolean = false
}
`,
      options: ['never'],
    },
  ],
  invalid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/366
    {
      code: 'type Foo = {};',
      options: ['never'] as Options,
      errors: [
        { ...extraSemicolon, type: AST_NODE_TYPES.TSTypeAliasDeclaration },
      ],
    },
    {
      code: 'type Foo = {}',
      errors: [
        { ...missingError, type: AST_NODE_TYPES.TSTypeAliasDeclaration },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/409
    {
      code: `
class PanCamera extends FreeCamera {
  public invertY: boolean = false
}
`,
      errors: [{ ...missingError, type: AST_NODE_TYPES.ClassProperty }],
    },
    {
      code: `
class PanCamera extends FreeCamera {
  public invertY: boolean = false;
}
`,
      options: ['never'],
      errors: [{ ...extraSemicolon, type: AST_NODE_TYPES.ClassProperty }],
    },
  ],
});
