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
  type: AST_NODE_TYPES.TSTypeAliasDeclaration,
};

const extraSemicolon: any = {
  message: 'Extra semicolon.',
  type: AST_NODE_TYPES.TSTypeAliasDeclaration,
};

ruleTester.run<MessageIds, Options>('semi', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/366
    { code: 'type Foo = {}', options: ['never'] },
    { code: 'type Foo = {};' },
  ],
  invalid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/366
    {
      code: 'type Foo = {};',
      options: ['never'] as Options,
      errors: [extraSemicolon],
    },
    {
      code: 'type Foo = {}',
      errors: [missingError],
    },
  ],
});
