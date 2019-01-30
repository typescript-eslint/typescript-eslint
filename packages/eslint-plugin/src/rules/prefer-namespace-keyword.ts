/**
 * @fileoverview Enforces the use of the keyword `namespace` over `module` to declare custom TypeScript modules.
 * @author Patricio Trevino
 * @author Armano <https://github.com/armano2>
 */

import RuleModule from '../RuleModule';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require the use of the `namespace` keyword instead of the `module` keyword to declare custom TypeScript modules.',
      extraDescription: [util.tslintRule('no-internal-module')],
      category: 'TypeScript',
      url: util.metaDocsUrl('prefer-namespace-keyword'),
      recommended: 'error'
    },
    fixable: 'code',
    schema: []
  },

  create(context: Rule.RuleContext) {
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      TSModuleDeclaration(node) {
        // Do nothing if the name is a string.
        if (!node.id || node.id.type === 'Literal') {
          return;
        }
        // Get tokens of the declaration header.
        const moduleType = sourceCode.getTokenBefore(node.id);

        if (
          moduleType &&
          moduleType.type === 'Identifier' &&
          moduleType.value === 'module'
        ) {
          context.report({
            node,
            message:
              "Use 'namespace' instead of 'module' to declare custom TypeScript modules.",
            fix(fixer) {
              return fixer.replaceText(moduleType, 'namespace');
            }
          });
        }
      }
    };
  }
};
export = rule;
