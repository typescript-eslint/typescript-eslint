import { TSESTree } from '@typescript-eslint/experimental-utils';
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
    function isStringArrayNode(node: TSESTree.LeftHandSideExpression): boolean {
      const type = checker.getTypeAtLocation(
        service.esTreeNodeToTSNodeMap.get(node),
      );
      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        const typeArgs = checker.getTypeArguments(type);
        return typeArgs.every(
          arg => util.getTypeName(checker, arg) === 'string',
        );
      }
      return false;
    }

    return {
      "CallExpression[arguments.length=0] > MemberExpression[property.name='sort'][computed=false]"(
        callee: TSESTree.MemberExpression,
      ): void {
        const tsNode = service.esTreeNodeToTSNodeMap.get(callee.object);
        const calleeObjType = util.getConstrainedTypeAtLocation(
          checker,
          tsNode,
        );

        if (options.ignoreStringArrays && isStringArrayNode(callee.object)) {
          return;
        }

        if (util.isTypeArrayTypeOrUnionOfArrayTypes(calleeObjType, checker)) {
          context.report({ node: callee.parent!, messageId: 'requireCompare' });
        }
      },
    };
  },
});
