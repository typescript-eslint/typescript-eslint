/**
 * @fileoverview Prefer an interface declaration over a type literal (type T = { ... })
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
        'Prefer an interface declaration over a type literal (type T = { ... })',
      extraDescription: [util.tslintRule('interface-over-type-literal')],
      category: 'TypeScript',
      url: util.metaDocsUrl('prefer-interface'),
      recommended: 'error'
    },
    fixable: 'code',
    messages: {
      interfaceOverType: 'Use an interface instead of a type literal.'
    },
    schema: []
  },
  create(context: Rule.RuleContext) {
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      // VariableDeclaration with kind type has only one VariableDeclarator
      "TSTypeAliasDeclaration[typeAnnotation.type='TSTypeLiteral']"(node) {
        context.report({
          node: node.id,
          messageId: 'interfaceOverType',
          fix(fixer) {
            const typeNode = node.typeParameters || node.id;

            const fixes = [
              fixer.replaceText(sourceCode.getFirstToken(node), 'interface'),
              fixer.replaceTextRange(
                [typeNode.range[1], node.typeAnnotation.range[0]],
                ' '
              )
            ];

            const afterToken = sourceCode.getTokenAfter(node.typeAnnotation);

            if (
              afterToken &&
              afterToken.type === 'Punctuator' &&
              afterToken.value === ';'
            ) {
              fixes.push(fixer.remove(afterToken));
            }

            return fixes;
          }
        });
      }
    };
  }
};
export = rule;
