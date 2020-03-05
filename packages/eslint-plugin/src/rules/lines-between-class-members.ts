import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/lines-between-class-members';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'lines-between-class-members',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require or disallow an empty line between class members',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    schema: [
      {
        enum: ['always', 'never'],
      },
      {
        type: 'object',
        properties: {
          exceptAfterSingleLine: {
            type: 'boolean',
            default: false,
          },
          exceptAfterOverload: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: true,
      },
    ],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    'always',
    {
      exceptAfterOverload: true,
      exceptAfterSingleLine: false,
    },
  ],
  create(context, options) {
    const rules = baseRule.create(context);
    const exceptAfterOverload =
      options[1]?.exceptAfterOverload && options[0] === 'always';

    function isOverload(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.MethodDefinition &&
        node.value.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression
      );
    }

    return {
      ClassBody(node): void {
        const body = exceptAfterOverload
          ? node.body.filter(node => !isOverload(node))
          : node.body;

        rules.ClassBody({ ...node, body });
      },
    };
  },
});
