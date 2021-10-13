import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import * as util from '../util';

const baseRule = getESLintCoreRule('lines-between-class-members');

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = util.deepMerge(
  { ...baseRule.meta.schema },
  {
    1: {
      exceptAfterOverload: {
        type: 'boolean',
        default: true,
      },
    },
  },
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
  create(context, options) {
    const rules = baseRule.create(context);
    const exceptAfterOverload =
      options[1]?.exceptAfterOverload && options[0] === 'always';

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
