import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/lines-between-class-members';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const schema = util.deepMerge(
  { ...baseRule.meta.schema },
  {
    1: {
      exceptAfterOverload: {
        type: 'booleean',
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
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    schema,
    messages: baseRule.meta.messages ?? {
      never: 'Unexpected blank line between class members.',
      always: 'Expected blank line between class members.',
    },
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
