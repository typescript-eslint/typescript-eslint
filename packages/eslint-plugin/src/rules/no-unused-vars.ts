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
      extendsBaseRule: true,
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    function markParameterAsUsed(node: TSESTree.Node): void {
      switch (node.type) {
        case AST_NODE_TYPES.Identifier:
          context.markVariableAsUsed(node.name);
          break;
        case AST_NODE_TYPES.AssignmentPattern:
          markParameterAsUsed(node.left);
          break;
        case AST_NODE_TYPES.RestElement:
          markParameterAsUsed(node.argument);
          break;
      }
    }

    return Object.assign({}, rules, {
      TSParameterProperty(node: TSESTree.TSParameterProperty) {
        // just assume parameter properties are used
        markParameterAsUsed(node.parameter);
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
