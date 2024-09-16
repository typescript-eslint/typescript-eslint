import type { TSESTree } from '@typescript-eslint/utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
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
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    /**
     * Check if a given node is an array which all elements are string.
     */
    function isStringArrayNode(node: TSESTree.Expression): boolean {
      const type = services.getTypeAtLocation(node);

      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        const typeArgs = checker.getTypeArguments(type);
        return typeArgs.every(arg => getTypeName(checker, arg) === 'string');
      }
      return false;
    }

    function checkSortArgument(callee: TSESTree.MemberExpression): void {
      const calleeObjType = getConstrainedTypeAtLocation(
        services,
        callee.object,
      );

      if (options.ignoreStringArrays && isStringArrayNode(callee.object)) {
        return;
      }

      if (isTypeArrayTypeOrUnionOfArrayTypes(calleeObjType, checker)) {
        context.report({ messageId: 'requireCompare', node: callee.parent });
      }
    }

    return {
      "CallExpression[arguments.length=0] > MemberExpression[property.name='sort'][computed=false]":
        checkSortArgument,
      "CallExpression[arguments.length=0] > MemberExpression[property.name='toSorted'][computed=false]":
        checkSortArgument,
    };
  },
  defaultOptions: [
    {
      ignoreStringArrays: true,
    },
  ],

  meta: {
    docs: {
      description:
        'Require `Array#sort` and `Array#toSorted` calls to always provide a `compareFunction`',
      requiresTypeChecking: true,
    },
    messages: {
      requireCompare: "Require 'compare' argument.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          ignoreStringArrays: {
            description:
              'Whether to ignore arrays in which all elements are strings.',
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
  name: 'require-array-sort-compare',
});
