import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/block-spacing';
import type { InvalidTestCase, ValidTestCase } from '../RuleTester';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

type InvalidBlockSpacingTestCase = InvalidTestCase<
  'missing' | 'extra',
  ['always' | 'never']
>;

const options = ['always', 'never'] as const;
const typeDeclaration = [
  {
    nodeType: AST_NODE_TYPES.TSInterfaceBody,
    stringPrefix: 'interface Foo ',
  },
  {
    nodeType: AST_NODE_TYPES.TSTypeLiteral,
    stringPrefix: 'type Foo = ',
  },
  {
    nodeType: AST_NODE_TYPES.TSEnumDeclaration,
    stringPrefix: 'enum Foo ',
  },
  {
    nodeType: AST_NODE_TYPES.TSEnumDeclaration,
    stringPrefix: 'const enum Foo ',
  },
];
const emptyBlocks = ['{}', '{ }'];
const singlePropertyBlocks = ['{bar: true}', '{ bar: true }'];

ruleTester.run('block-spacing', rule, {
  valid: [
    // Empty blocks don't apply
    ...options.flatMap(option =>
      typeDeclaration.flatMap(typeDec =>
        emptyBlocks.map<ValidTestCase<['always' | 'never']>>(blockType => ({
          code: typeDec.stringPrefix + blockType,
          options: [option],
        })),
      ),
    ),
  ],
  invalid: [
    ...options.flatMap(option =>
      typeDeclaration.flatMap(typeDec => {
        return singlePropertyBlocks.flatMap<InvalidBlockSpacingTestCase>(
          (blockType, blockIndex) => {
            // These are actually valid, so filter them out
            if (
              (option === 'always' && blockType.startsWith('{ ')) ||
              (option === 'never' && blockType.startsWith('{bar'))
            ) {
              return [];
            }
            const reverseBlockType = singlePropertyBlocks[1 - blockIndex];
            let code = `${typeDec.stringPrefix}${blockType};  /* ${option} */`;
            let output = `${typeDec.stringPrefix}${reverseBlockType};  /* ${option} */`;
            if (typeDec.nodeType === AST_NODE_TYPES.TSEnumDeclaration) {
              output = output.replace(':', '=');
              code = code.replace(':', '=');
            }

            return {
              code,
              options: [option],
              output,
              errors: [
                {
                  type: typeDec.nodeType,
                  messageId: option === 'always' ? 'missing' : 'extra',
                  data: { location: 'after', token: '{' },
                },
                {
                  type: typeDec.nodeType,
                  messageId: option === 'always' ? 'missing' : 'extra',
                  data: { location: 'before', token: '}' },
                },
              ],
            };
          },
        );
      }),
    ),
  ],
});
