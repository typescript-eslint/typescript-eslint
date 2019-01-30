/**
 * @fileoverview Forbids an object literal to appear in a type assertion expression
 * @author Armano <https://github.com/armano2>
 */

import RuleModule from '../RuleModule';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
  {
    allowAsParameter: false
  }
];

const rule: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbids an object literal to appear in a type assertion expression',
      extraDescription: [util.tslintRule('no-object-literal-type-assertion')],
      category: 'TypeScript',
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
  create(context: Rule.RuleContext) {
    const { allowAsParameter } = util.applyDefault(
      defaultOptions,
      context.options
    )[0];

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    /**
     * Check whatever node should be reported
     * @param {ASTNode} node the node to be evaluated.
     */
    function checkType(node): boolean {
      if (node) {
        switch (node.type) {
          case 'TSAnyKeyword':
          case 'TSUnknownKeyword':
            return false;
          default:
            break;
        }
      }
      return true;
    }

    return {
      'TSTypeAssertion, TSAsExpression'(node) {
        if (
          allowAsParameter &&
          (node.parent.type === 'NewExpression' ||
            node.parent.type === 'CallExpression')
        ) {
          return;
        }

        if (
          checkType(node.typeAnnotation) &&
          node.expression.type === 'ObjectExpression'
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
export = rule;
