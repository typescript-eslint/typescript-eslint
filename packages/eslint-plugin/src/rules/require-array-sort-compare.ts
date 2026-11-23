import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getTypeName,
  isStaticMemberAccessOfValue,
} from '../util';

export type Options = [
  {
    ignoreStringArrays?: boolean;
  },
];
export type MessageIds = 'requireCompare';

export default createRule<Options, MessageIds>({
  name: 'require-array-sort-compare',
  meta: {
    type: 'problem',
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
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreStringArrays: {
            type: 'boolean',
            description:
              'Whether to ignore arrays in which all elements are strings.',
          },
        },
      },
    ],
  },

  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [
    {
      ignoreStringArrays: true,
    },
  ],

  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isArrayOrTupleType(type: ts.Type): type is ts.TypeReference {
      return checker.isArrayType(type) || checker.isTupleType(type);
    }

    /**
     * Check if a given array or tuple type's elements are all strings.
     */
    function isStringArrayType(type: ts.TypeReference): boolean {
      // Before TS 5.1, a constrained type parameter's array type has an extra `this` type argument
      const typeArgs = checker
        .getTypeArguments(type)
        .slice(0, type.target.typeParameters?.length);

      return typeArgs.every(arg => {
        const typeName = getTypeName(
          checker,
          checker.getBaseConstraintOfType(arg) ?? arg,
        );

        return typeName === 'string';
      });
    }

    function checkSortArgument(callee: TSESTree.MemberExpression): void {
      if (!isStaticMemberAccessOfValue(callee, context, 'sort', 'toSorted')) {
        return;
      }

      // `array?.sort()` doesn't call `sort` on a nullish `array`
      const calleeObjTypes = tsutils.unionConstituents(
        checker.getNonNullableType(
          getConstrainedTypeAtLocation(services, callee.object),
        ),
      );

      if (
        calleeObjTypes.every(isArrayOrTupleType) &&
        !(options.ignoreStringArrays && calleeObjTypes.every(isStringArrayType))
      ) {
        context.report({ node: callee.parent, messageId: 'requireCompare' });
      }
    }

    return {
      'CallExpression[arguments.length=0] > MemberExpression':
        checkSortArgument,
    };
  },
});
