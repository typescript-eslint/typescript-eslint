/**
 * @fileoverview Forbids an object literal to appear in a type assertion expression
 * @author Armano <https://github.com/armano2>
 */

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [
  {
    allowAsParameter?: boolean;
  }
];
type MessageIds = 'unexpectedTypeAssertion';

const defaultOptions: Options = [
  {
    allowAsParameter: false
  }
];

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbids an object literal to appear in a type assertion expression',
      extraDescription: [util.tslintRule('no-object-literal-type-assertion')],
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('no-object-literal-type-assertions'),
      recommended: 'error'
    },
    messages: {
      unexpectedTypeAssertion:
        'Type assertion on object literals is forbidden, use a type annotation instead.'
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowAsParameter: {
            type: 'boolean'
          }
        }
      }
    ]
  },
  create(context) {
    const { allowAsParameter } = util.applyDefault(
      defaultOptions,
      context.options
    )[0];

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    /**
     * Check whatever node should be reported
     * @param node the node to be evaluated.
     */
    function checkType(node: TSESTree.TypeNode): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.TSAnyKeyword:
        case AST_NODE_TYPES.TSUnknownKeyword:
          return false;
        default:
          return true;
      }
    }

    return {
      'TSTypeAssertion, TSAsExpression'(
        node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression
      ) {
        if (
          allowAsParameter &&
          node.parent &&
          (node.parent.type === AST_NODE_TYPES.NewExpression ||
            node.parent.type === AST_NODE_TYPES.CallExpression)
        ) {
          return;
        }

        if (
          checkType(node.typeAnnotation) &&
          node.expression.type === AST_NODE_TYPES.ObjectExpression
        ) {
          context.report({
            node,
            messageId: 'unexpectedTypeAssertion'
          });
        }
      }
    };
  }
};
export default rule;
