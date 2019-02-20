/**
 * @fileoverview Enforce usage of const enum.
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

export default util.createRule({
  name: 'enum-const-style',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce usage of const enum',
      tslintRuleName: 'enum-const-style',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    messages: {
      noNonConstEnums: 'enums are forbidden. Use const enums',
      noConstEnums: 'const enums are forbidden. Use enum',
    },
    schema: [
      {
        enum: ['always', 'never'],
      },
    ],
  },
  defaultOptions: ['never'],
  create(context, [option]) {
    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration) {
        switch (option) {
          default:
          case 'never':
            if (node.const) {
              context.report({
                node,
                messageId: 'noConstEnums',
              });
            }
            break;
          case 'always':
            if (!node.const) {
              context.report({
                node,
                messageId: 'noNonConstEnums',
              });
            }
            break;
        }
      },
    };
  },
});
