import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-useless-constructor');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

/**
 * Check if method with accessibility is not useless
 */
function checkAccessibility(node: TSESTree.MethodDefinition): boolean {
  switch (node.accessibility) {
    case 'protected':
    case 'private':
      return false;
    case 'public':
      if (node.parent.parent.superClass) {
        return false;
      }
      break;
  }
  return true;
}

/**
 * Check if method is not useless due to typescript parameter properties and decorators
 */
function checkParams(node: TSESTree.MethodDefinition): boolean {
  return !node.value.params.some(
    param =>
      param.type === AST_NODE_TYPES.TSParameterProperty ||
      param.decorators.length,
  );
}

export default createRule<Options, MessageIds>({
  name: 'no-useless-constructor',
  meta: {
    type: 'problem',
    // defaultOptions, -- base rule does not use defaultOptions
    docs: {
      extendsBaseRule: true,
      recommended: 'strict',
      description: 'Disallow unnecessary constructors',
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
    schema: baseRule.meta.schema,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);
    return {
      MethodDefinition(node): void {
        if (
          node.value.type === AST_NODE_TYPES.FunctionExpression &&
          checkAccessibility(node) &&
          checkParams(node)
        ) {
          rules.MethodDefinition(node);
        }
      },
    };
  },
});
