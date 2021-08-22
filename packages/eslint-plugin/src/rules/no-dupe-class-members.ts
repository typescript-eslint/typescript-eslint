import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import * as util from '../util';

const baseRule = getESLintCoreRule('no-dupe-class-members');

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-dupe-class-members',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate class members',
      category: 'Possible Errors',
      recommended: false,
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    function wrapMemberDefinitionListener(
      coreListener: (node: TSESTree.MethodDefinition) => void,
    ): (node: TSESTree.MethodDefinition) => void {
      return (node: TSESTree.MethodDefinition): void => {
        if (node.computed) {
          return;
        }

        if (node.value.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression) {
          return;
        }

        return coreListener(node);
      };
    }

    return {
      ...rules,
      // for ESLint <= v7
      ...(rules.MethodDefinition
        ? {
            MethodDefinition: wrapMemberDefinitionListener(
              rules.MethodDefinition,
            ),
          }
        : {}),
      // for ESLint v8
      ...(rules['MethodDefinition, PropertyDefinition']
        ? {
            'MethodDefinition, PropertyDefinition':
              wrapMemberDefinitionListener(
                rules['MethodDefinition, PropertyDefinition'],
              ),
          }
        : {}),
    };
  },
});
