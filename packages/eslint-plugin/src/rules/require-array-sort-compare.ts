import type { TSESTree } from '@typescript-eslint/utils';

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
        'Require `Array#sort` calls to always provide a `compareFunction`',
      requiresTypeChecking: true,
    },
    messages: {
      requireCompare: "Require 'compare' argument.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreStringArrays: {
            description:
              'Whether to ignore arrays in which all elements are strings.',
            type: 'boolean',
          },
        },
      },
    ],
  },

  create(context, [options]) {
    const services = util.getParserServices(context);
    const checker = services.program.getTypeChecker();

    /**
     * Check if a given node is an array which all elements are string.
     * @param node
     */
    function isStringArrayNode(node: TSESTree.Expression): boolean {
      const type = services.getTypeAtLocation(node);

      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        const typeArgs = util.getTypeArguments(type, checker);
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
        const calleeObjType = util.getConstrainedTypeAtLocation(
          services,
          callee.object,
        );

        if (options.ignoreStringArrays && isStringArrayNode(callee.object)) {
          return;
        }

        if (util.isTypeArrayTypeOrUnionOfArrayTypes(calleeObjType, checker)) {
          context.report({ node: callee.parent, messageId: 'requireCompare' });
        }
      },
    };
  },
});
