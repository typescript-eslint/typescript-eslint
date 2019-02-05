/**
 * @fileoverview Enforce valid definition of `new` and `constructor`.
 * @author Armano <https://github.com/armano2>
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [];
type MessageIds = 'errorMessageInterface' | 'errorMessageClass';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce valid definition of `new` and `constructor`.',
      extraDescription: [util.tslintRule('no-misused-new')],
      category: 'Best Practices',
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
    function getTypeReferenceName(
      node:
        | TSESTree.TSTypeAnnotation
        | TSESTree.TypeNode
        | TSESTree.EntityName
        | undefined
    ): string | null {
      if (node) {
        switch (node.type) {
          case AST_NODE_TYPES.TSTypeAnnotation:
            return getTypeReferenceName(node.typeAnnotation);
          case AST_NODE_TYPES.TSTypeReference:
            return getTypeReferenceName(node.typeName);
          case AST_NODE_TYPES.Identifier:
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
    function isMatchingParentType(
      parent: undefined | TSESTree.Node,
      returnType: TSESTree.TSTypeAnnotation | undefined
    ): boolean {
      if (
        parent &&
        'id' in parent &&
        parent.id &&
        parent.id.type === AST_NODE_TYPES.Identifier
      ) {
        return getTypeReferenceName(returnType) === parent.id.name;
      }
      return false;
    }

    return {
      'TSInterfaceBody > TSConstructSignatureDeclaration'(
        node: TSESTree.TSConstructSignatureDeclaration
      ) {
        if (
          isMatchingParentType(
            node.parent!.parent as TSESTree.TSInterfaceDeclaration,
            node.returnType
          )
        ) {
          // constructor
          context.report({
            node,
            messageId: 'errorMessageInterface'
          });
        }
      },
      "TSMethodSignature[key.name='constructor']"(
        node: TSESTree.TSMethodSignature
      ) {
        context.report({
          node,
          messageId: 'errorMessageInterface'
        });
      },
      "ClassBody > MethodDefinition[key.name='new']"(
        node: TSESTree.MethodDefinition
      ) {
        if (node.value.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression) {
          if (
            node.parent &&
            isMatchingParentType(node.parent.parent, node.value.returnType)
          ) {
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
export default rule;
