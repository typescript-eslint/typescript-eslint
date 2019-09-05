import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/quotes';
import * as util from '../util';

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'quotes',
  meta: {
    type: 'layout',
    docs: {
      description:
        'Enforce the consistent use of either backticks, double, or single quotes',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
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

    const isModuleDeclaration = (node: TSESTree.Literal): boolean => {
      return (
        !!node.parent && node.parent.type === AST_NODE_TYPES.TSModuleDeclaration
      );
    };

    const isTypeLiteral = (node: TSESTree.Literal): boolean => {
      return !!node.parent && node.parent.type === AST_NODE_TYPES.TSLiteralType;
    };

    return {
      Literal(node): void {
        if (
          option === 'backtick' &&
          (isModuleDeclaration(node) || isTypeLiteral(node))
        ) {
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
