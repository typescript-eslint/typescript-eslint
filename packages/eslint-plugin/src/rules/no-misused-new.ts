/**
 * @fileoverview Enforce valid definition of `new` and `constructor`.
 * @author Armano <https://github.com/armano2>
 */

import RuleModule from '../RuleModule';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce valid definition of `new` and `constructor`.',
      extraDescription: [util.tslintRule('no-misused-new')],
      category: 'TypeScript',
      url: util.metaDocsUrl('no-misused-new'),
      recommended: 'error'
    },
    schema: [],
    messages: {
      errorMessageInterface: 'Interfaces cannot be constructed, only classes.',
      errorMessageClass: 'Class cannon have method named `new`.'
    }
  },

  //----------------------------------------------------------------------
  // Public
  //----------------------------------------------------------------------

  create(context) {
    /**
     * @param {ASTNode} node type to be inspected.
     * @returns name of simple type or null
     */
    function getTypeReferenceName(node): string | null {
      if (node) {
        switch (node.type) {
          case 'TSTypeAnnotation':
            return getTypeReferenceName(node.typeAnnotation);
          case 'TSTypeReference':
            return getTypeReferenceName(node.typeName);
          case 'Identifier':
            return node.name;
          default:
            break;
        }
      }
      return null;
    }

    /**
     * @param {ASTNode} parent parent node.
     * @param {ASTNode} returnType type to be compared
     */
    function isMatchingParentType(parent, returnType): boolean {
      if (parent && parent.id && parent.id.type === 'Identifier') {
        return getTypeReferenceName(returnType) === parent.id.name;
      }
      return false;
    }

    return {
      'TSInterfaceBody > TSConstructSignatureDeclaration'(node) {
        if (isMatchingParentType(node.parent.parent, node.returnType)) {
          // constructor
          context.report({
            node,
            messageId: 'errorMessageInterface'
          });
        }
      },
      "TSMethodSignature[key.name='constructor']"(node) {
        context.report({
          node,
          messageId: 'errorMessageInterface'
        });
      },
      "ClassBody > MethodDefinition[key.name='new']"(node) {
        if (
          node.value &&
          (node.value.type === 'TSEmptyBodyFunctionExpression' ||
            (node.value.type === 'TSDeclareFunction' && !node.value.body))
        ) {
          if (isMatchingParentType(node.parent.parent, node.value.returnType)) {
            context.report({
              node,
              messageId: 'errorMessageClass'
            });
          }
        }
      }
    };
  }
};
export = rule;
