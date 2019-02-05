/**
 * @fileoverview Disallows the declaration of empty interfaces.
 * @author Patricio Trevino
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [];
type MessageIds = 'noEmpty' | 'noEmptyWithSuper';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the declaration of empty interfaces',
      extraDescription: [util.tslintRule('no-empty-interface')],
      category: 'Best Practices',
      url: util.metaDocsUrl('no-empty-interface'),
      recommended: 'error'
    },
    messages: {
      noEmpty: 'An empty interface is equivalent to `{}`.',
      noEmptyWithSuper:
        'An interface declaring no members is equivalent to its supertype.'
    },
    schema: []
  },

  //----------------------------------------------------------------------
  // Public
  //----------------------------------------------------------------------

  create(context) {
    return {
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        if (node.body.body.length !== 0) {
          return;
        }
        let messageId: MessageIds | null = null;
        if (!node.extends || node.extends.length === 0) {
          messageId = 'noEmpty';
        } else if (node.extends.length === 1) {
          messageId = 'noEmptyWithSuper';
        }
        if (!messageId) {
          return;
        }

        context.report({
          node: node.id,
          messageId
        });
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
