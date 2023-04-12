import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('lines-between-class-members');

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = Object.values(
  util.deepMerge(
    { ...baseRule.meta.schema },
    {
      1: {
        properties: {
          exceptAfterOverload: {
            type: 'boolean',
            default: true,
          },
        },
      },
    },
  ),
);

export default util.createRule<Options, MessageIds>({
  name: 'lines-between-class-members',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require or disallow an empty line between class members',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    'always',
    {
      exceptAfterOverload: true,
      exceptAfterSingleLine: false,
    },
  ],
  create(context, [firstOption, secondOption]) {
    const rules = baseRule.create(context);
    const exceptAfterOverload =
      secondOption?.exceptAfterOverload && firstOption === 'always';

    function isOverload(node: TSESTree.Node): boolean {
      return (
        (node.type === AST_NODE_TYPES.TSAbstractMethodDefinition ||
          node.type === AST_NODE_TYPES.MethodDefinition) &&
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
