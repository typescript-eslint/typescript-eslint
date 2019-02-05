/**
 * @fileoverview Prevent TypeScript-specific variables being falsely marked as unused
 * @author James Henry
 */

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import baseRule from 'eslint/lib/rules/no-unused-vars';
import * as util from '../util';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule
} from '../tsestree-utils';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused variables',
      extraDescription: [util.tslintRule('no-unused-variable')],
      category: 'Variables',
      url: util.metaDocsUrl('no-unused-vars'),
      recommended: 'warn'
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages
  },

  create(context) {
    const rules = baseRule.create(context);

    /**
     * Mark this function parameter as used
     * @param node The node currently being traversed
     */
    function markThisParameterAsUsed(node: TSESTree.Identifier): void {
      if (node.name) {
        const variable = context
          .getScope()
          .variables.find(scopeVar => scopeVar.name === node.name);

        if (variable) {
          variable.eslintUsed = true;
        }
      }
    }

    /**
     * Mark heritage clause as used
     * @param node The node currently being traversed
     */
    function markHeritageAsUsed(node: TSESTree.Expression): void {
      switch (node.type) {
        case AST_NODE_TYPES.Identifier:
          context.markVariableAsUsed(node.name);
          break;
        case AST_NODE_TYPES.MemberExpression:
          markHeritageAsUsed(node.object);
          break;
        case AST_NODE_TYPES.CallExpression:
          markHeritageAsUsed(node.callee);
          break;
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return Object.assign({}, rules, {
      "FunctionDeclaration Identifier[name='this']": markThisParameterAsUsed,
      "FunctionExpression Identifier[name='this']": markThisParameterAsUsed,
      'TSTypeReference Identifier'(node: TSESTree.Identifier) {
        context.markVariableAsUsed(node.name);
      },
      TSInterfaceHeritage(node: TSESTree.TSInterfaceHeritage) {
        if (node.expression) {
          markHeritageAsUsed(node.expression);
        }
      },
      TSClassImplements(node: TSESTree.TSClassImplements) {
        if (node.expression) {
          markHeritageAsUsed(node.expression);
        }
      },
      'TSParameterProperty Identifier'(node: TSESTree.Identifier) {
        // just assume parameter properties are used
        context.markVariableAsUsed(node.name);
      },
      'TSEnumMember Identifier'(node: TSESTree.Identifier) {
        context.markVariableAsUsed(node.name);
      },
      '*[declare=true] Identifier'(node: TSESTree.Identifier) {
        context.markVariableAsUsed(node.name);
        const scope = context.getScope();
        const { variableScope } = scope;
        if (variableScope !== scope) {
          const superVar = variableScope.set.get(node.name);
          if (superVar) superVar.eslintUsed = true;
        }
      }
    });
  }
};
export default rule;
export { Options, MessageIds };
