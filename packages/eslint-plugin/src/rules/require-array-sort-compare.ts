import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export type Options = [
  {
    ignoreStringArrays?: boolean;
  },
];
export type MessageIds = 'requireCompare';

export default util.createRule<Options, MessageIds>({
  name: 'require-array-sort-compare',
  defaultOptions: [
    {
      ignoreStringArrays: false,
    },
  ],

  meta: {
    type: 'problem',
    docs: {
      description:
        'Requires `Array#sort` calls to always provide a `compareFunction`',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      requireCompare: "Require 'compare' argument.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreStringArrays: {
            type: 'boolean',
          },
        },
      },
    ],
  },

  create(context, [options]) {
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();

    /**
     * Check if a given node is an array which all elements are string.
     * @param node
     */
    function isStringArrayNode(node: TSESTree.ArrayExpression): boolean {
      return node.elements.every(element => {
        const type = checker.getTypeAtLocation(
          service.esTreeNodeToTSNodeMap.get(element),
        );
        return util.getTypeName(checker, type) === 'string';
      });
    }

    return {
      ":matches(CallExpression, OptionalCallExpression)[arguments.length=0] > :matches(MemberExpression, OptionalMemberExpression)[property.name='sort'][computed=false]"(
        callee: TSESTree.MemberExpression | TSESTree.OptionalMemberExpression,
      ): void {
        const tsNode = service.esTreeNodeToTSNodeMap.get(callee.object);
        const calleeObjType = util.getConstrainedTypeAtLocation(
          checker,
          tsNode,
        );

        if (
          options.ignoreStringArrays &&
          callee.object.type === AST_NODE_TYPES.ArrayExpression &&
          isStringArrayNode(callee.object)
        ) {
          return;
        }

        if (util.isTypeArrayTypeOrUnionOfArrayTypes(calleeObjType, checker)) {
          context.report({ node: callee.parent!, messageId: 'requireCompare' });
        }
      },
    };
  },
});
