import type { TSESTree } from '@typescript-eslint/utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getTypeArguments,
  getTypeName,
  isTypeArrayTypeOrUnionOfArrayTypes,
} from '../util';

export type Options = [
  {
    ignoreStringArrays?: boolean;
  },
];
export type MessageIds = 'requireCompare';

export default createRule<Options, MessageIds>({
  name: 'require-array-sort-compare',
  defaultOptions: [
    {
      ignoreStringArrays: true,
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
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    /**
     * Check if a given node is an array which all elements are string.
     * @param node
     */
    function isStringArrayNode(node: TSESTree.Expression): boolean {
      const type = services.getTypeAtLocation(node);

      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        const typeArgs = getTypeArguments(type, checker);
        return typeArgs.every(arg => getTypeName(checker, arg) === 'string');
      }
      return false;
    }

    return {
      "CallExpression[arguments.length=0] > MemberExpression[property.name='sort'][computed=false]"(
        callee: TSESTree.MemberExpression,
      ): void {
        const calleeObjType = getConstrainedTypeAtLocation(
          services,
          callee.object,
        );

        if (options.ignoreStringArrays && isStringArrayNode(callee.object)) {
          return;
        }

        if (isTypeArrayTypeOrUnionOfArrayTypes(calleeObjType, checker)) {
          context.report({ node: callee.parent, messageId: 'requireCompare' });
        }
      },
    };
  },
});
