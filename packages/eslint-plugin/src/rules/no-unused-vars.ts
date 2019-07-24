import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-unused-vars';
import * as util from '../util';

export default util.createRule({
  name: 'no-unused-vars',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused variables',
      category: 'Variables',
      recommended: 'warn',
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

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

    return Object.assign({}, rules, {
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
          if (superVar) {
            superVar.eslintUsed = true;
          }
        }
      },
    });
  },
});
