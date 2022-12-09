/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import type { MessageIds, Options } from '../../src/rules/block-spacing';
import rule from '../../src/rules/block-spacing';
import type { InvalidTestCase } from '../RuleTester';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

type InvalidBlockSpacingTestCase = InvalidTestCase<
  'missing' | 'extra',
  ['always' | 'never']
>;

const options = [['always'], ['never']] as const;
const typeDeclaration = [
  {
    nodeType: AST_NODE_TYPES.TSInterfaceBody,
    stringPrefix: 'interface Foo ',
  },
  {
    nodeType: AST_NODE_TYPES.TSTypeLiteral,
    stringPrefix: 'type Foo = ',
  },
];
const emptyBlocks = ['{}', '{ }'];
const singlePropertyBlocks = ['{bar: true}', '{ bar: true }'];

ruleTester.run('block-spacing', rule, {
  valid: [
    // Empty blocks don't apply
    ...options.flatMap(options =>
      typeDeclaration.flatMap(typeDec =>
        emptyBlocks.map(blockType => ({
          code: typeDec.stringPrefix + blockType,
          options,
        })),
      ),
    ),
  ],
  invalid: [
    ...options.flatMap(options =>
      typeDeclaration.flatMap(typeDec =>
        singlePropertyBlocks.flatMap<InvalidBlockSpacingTestCase>(
          (blockType, blockIndex) => {
            if (
              (options[0] === 'always' && blockType.startsWith('{ ')) ||
              (options[0] === 'never' && blockType.startsWith('{bar'))
            ) {
              return [];
            }
            return {
              code: typeDec.stringPrefix + blockType,
              options,
              output:
                typeDec.stringPrefix + singlePropertyBlocks[1 - blockIndex],
              errors: [
                {
                  type: typeDec.nodeType,
                  // line: 1,
                  // column: 1,
                  messageId: options[0] === 'always' ? 'missing' : 'extra',
                  data: { location: 'after', token: '{' },
                },
                {
                  type: typeDec.nodeType,
                  // line: 1,
                  // column: 8,
                  messageId: options[0] === 'always' ? 'missing' : 'extra',
                  data: { location: 'before', token: '}' },
                },
              ],
            };
          },
        ),
      ),
    ),
  ],
});
