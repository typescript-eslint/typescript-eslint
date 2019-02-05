/**
 * @fileoverview Forbids the use of classes as namespaces
 * @author Jed Fox
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [
  {
    allowConstructorOnly?: boolean;
    allowEmpty?: boolean;
    allowStaticOnly?: boolean;
  }
];
type MessageIds = 'empty' | 'onlyStatic' | 'onlyConstructor';

const defaultOptions: Options = [
  {
    allowConstructorOnly: false,
    allowEmpty: false,
    allowStaticOnly: false
  }
];

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Forbids the use of classes as namespaces',
      extraDescription: [util.tslintRule('no-unnecessary-class')],
      category: 'Best Practices',
      url: util.metaDocsUrl('no-extraneous-class'),
      recommended: false
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowConstructorOnly: {
            type: 'boolean'
          },
          allowEmpty: {
            type: 'boolean'
          },
          allowStaticOnly: {
            type: 'boolean'
          }
        }
      }
    ],
    messages: {
      empty: 'Unexpected empty class.',
      onlyStatic: 'Unexpected class with only static properties.',
      onlyConstructor: 'Unexpected class with only a constructor.'
    }
  },

  create(context) {
    const {
      allowConstructorOnly,
      allowEmpty,
      allowStaticOnly
    } = util.applyDefault(defaultOptions, context.options)[0];

    function getReportNode(node: TSESTree.ClassBody): TSESTree.Node {
      if (!node.parent) {
        return node;
      }
      if ('id' in node.parent && node.parent.id) {
        return node.parent.id;
      }

      return node.parent;
    }

    return {
      ClassBody(node: TSESTree.ClassBody) {
        const parent = node.parent as
          | TSESTree.ClassDeclaration
          | TSESTree.ClassExpression
          | undefined;

        if (!parent || parent.superClass) {
          return;
        }

        const reportNode = getReportNode(node);

        if (node.body.length === 0) {
          if (allowEmpty) {
            return;
          }

          context.report({
            node: reportNode,
            messageId: 'empty'
          });

          return;
        }

        let onlyStatic = true;
        let onlyConstructor = true;

        for (const prop of node.body) {
          if ('kind' in prop && prop.kind === 'constructor') {
            if (
              prop.value.params.some(
                param => param.type === AST_NODE_TYPES.TSParameterProperty
              )
            ) {
              onlyConstructor = false;
              onlyStatic = false;
            }
          } else {
            onlyConstructor = false;
            if ('static' in prop && !prop.static) {
              onlyStatic = false;
            }
          }
          if (!(onlyStatic || onlyConstructor)) break;
        }

        if (onlyConstructor) {
          if (!allowConstructorOnly) {
            context.report({
              node: reportNode,
              messageId: 'onlyConstructor'
            });
          }
          return;
        }
        if (onlyStatic && !allowStaticOnly) {
          context.report({
            node: reportNode,
            messageId: 'onlyStatic'
          });
        }
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
