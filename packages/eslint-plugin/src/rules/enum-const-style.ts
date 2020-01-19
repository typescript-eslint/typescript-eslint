import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Messages = 'noNonConstEnums' | 'noConstEnums';
type Options = ['always' | 'never'];

export default util.createRule<Options, Messages>({
  name: 'enum-const-style',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce const enum style',
      category: 'Stylistic Issues',
      recommended: false,
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
  create(context, [options]) {
    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
        if (options === 'always' && !node.const) {
          context.report({
            node,
            messageId: 'noNonConstEnums',
          });
        } else if (options === 'never' && node.const) {
          context.report({
            node,
            messageId: 'noConstEnums',
          });
        }
      },
    };
  },
});
