import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import * as util from '../util';

const baseRule = getESLintCoreRule('no-useless-constructor');

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

/**
 * Check if method with accessibility is not useless
 */
function checkAccessibility(node: TSESTree.MethodDefinition): boolean {
  switch (node.accessibility) {
    case 'protected':
    case 'private':
      return false;
    case 'public':
      if (
        node.parent &&
        node.parent.type === AST_NODE_TYPES.ClassBody &&
        node.parent.parent &&
        'superClass' in node.parent.parent &&
        node.parent.parent.superClass
      ) {
        return false;
      }
      break;
  }
  return true;
}

/**
 * Check if method is not unless due to typescript parameter properties and decorators
 */
function checkParams(node: TSESTree.MethodDefinition): boolean {
  return (
    !node.value.params ||
    !node.value.params.some(
      param =>
        param.type === AST_NODE_TYPES.TSParameterProperty ||
        param.decorators?.length,
    )
  );
}

export default util.createRule<Options, MessageIds>({
  name: 'no-useless-constructor',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary constructors',
      recommended: 'strict',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    // TODO: this rule has only had messages since v7.0 - remove this when we remove support for v6
    messages: baseRule.meta.messages ?? {
      noUselessConstructor: 'Useless constructor.',
    },
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);
    return {
      MethodDefinition(node): void {
        if (
          node.value &&
          node.value.type === AST_NODE_TYPES.FunctionExpression &&
          node.value.body &&
          checkAccessibility(node) &&
          checkParams(node)
        ) {
          rules.MethodDefinition(node);
        }
      },
    };
  },
});
