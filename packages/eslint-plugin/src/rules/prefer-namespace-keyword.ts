/**
 * @fileoverview Enforces the use of the keyword `namespace` over `module` to declare custom TypeScript modules.
 * @author Patricio Trevino
 * @author Armano <https://github.com/armano2>
 */

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [];
type MessageIds = 'useNamespace';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require the use of the `namespace` keyword instead of the `module` keyword to declare custom TypeScript modules.',
      extraDescription: [util.tslintRule('no-internal-module')],
      category: 'Best Practices',
      url: util.metaDocsUrl('prefer-namespace-keyword'),
      recommended: 'error'
    },
    fixable: 'code',
    messages: {
      useNamespace:
        "Use 'namespace' instead of 'module' to declare custom TypeScript modules."
    },
    schema: []
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      TSModuleDeclaration(node: TSESTree.TSModuleDeclaration) {
        // Do nothing if the name is a string.
        if (!node.id || node.id.type === AST_NODE_TYPES.Literal) {
          return;
        }
        // Get tokens of the declaration header.
        const moduleType = sourceCode.getTokenBefore(node.id);

        if (
          moduleType &&
          moduleType.type === AST_NODE_TYPES.Identifier &&
          moduleType.value === 'module'
        ) {
          context.report({
            node,
            messageId: 'useNamespace',
            fix(fixer) {
              return fixer.replaceText(moduleType, 'namespace');
            }
          });
        }
      }
    };
  }
};
export default rule;
