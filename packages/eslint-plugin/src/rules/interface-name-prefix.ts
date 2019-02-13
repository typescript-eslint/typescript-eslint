/**
 * @fileoverview Enforces interface names are prefixed with "I".
 * @author Danny Fritz
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type Options = ['never' | 'always'];
type MessageIds = 'noPrefix';

export default util.createRule<Options, MessageIds>({
  name: 'interface-name-prefix',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require that interface names be prefixed with `I`',
      tslintRuleName: 'interface-name',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    messages: {
      noPrefix: 'Interface name must not be prefixed with "I".',
    },
    schema: [
      {
        enum: ['never', 'always'],
      },
    ],
  },
  defaultOptions: ['never'],
  create(context, [option]) {
    const never = option !== 'always';

    /**
     * Checks if a string is prefixed with "I".
     * @param name The string to check
     */
    function isPrefixedWithI(name: string): boolean {
      if (typeof name !== 'string') {
        return false;
      }

      return /^I[A-Z]/.test(name);
    }

    return {
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration): void {
        if (never) {
          if (isPrefixedWithI(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'noPrefix',
            });
          }
        } else {
          if (!isPrefixedWithI(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'noPrefix',
            });
          }
        }
      },
    };
  },
});
