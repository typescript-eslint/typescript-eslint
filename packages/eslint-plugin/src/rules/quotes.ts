import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('quotes');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'quotes',
  meta: {
    type: 'layout',
    docs: {
      description:
        'Enforce the consistent use of either backticks, double, or single quotes',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'code',
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
    schema: baseRule.meta.schema,
  },
  defaultOptions: [
    'double',
    {
      allowTemplateLiterals: false,
      avoidEscape: false,
    },
  ],
  create(context, [option]) {
    const rules = baseRule.create(context);

    function isAllowedAsNonBacktick(node: TSESTree.Literal): boolean {
      const parent = node.parent;

      switch (parent?.type) {
        case AST_NODE_TYPES.TSAbstractMethodDefinition:
        case AST_NODE_TYPES.TSMethodSignature:
        case AST_NODE_TYPES.TSPropertySignature:
        case AST_NODE_TYPES.TSModuleDeclaration:
        case AST_NODE_TYPES.TSLiteralType:
        case AST_NODE_TYPES.TSExternalModuleReference:
          return true;

        case AST_NODE_TYPES.TSEnumMember:
          return node === parent.id;

        case AST_NODE_TYPES.TSAbstractPropertyDefinition:
        case AST_NODE_TYPES.PropertyDefinition:
          return node === parent.key;

        default:
          return false;
      }
    }

    return {
      Literal(node): void {
        if (option === 'backtick' && isAllowedAsNonBacktick(node)) {
          return;
        }

        rules.Literal(node);
      },

      TemplateLiteral(node): void {
        rules.TemplateLiteral(node);
      },
    };
  },
});
