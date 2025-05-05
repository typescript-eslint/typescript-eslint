import type { TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getTypeName,
  isTypeAnyType,
  isTypeFlagSet,
} from '../util';

export type Options = [
  {
    allowAny?: boolean;
    allowBoolean?: boolean;
    allowNullish?: boolean;
    allowNumberAndString?: boolean;
    allowRegExp?: boolean;
    skipCompoundAssignments?: boolean;
  },
];

export type MessageIds = 'bigintAndNumber' | 'invalid' | 'mismatched';

export default createRule<Options, MessageIds>({
  name: 'restrict-plus-operands',
  meta: {
    type: 'problem',
    docs: {
      recommended: {
        recommended: true,
        strict: [
          {
            allowAny: false,
            allowBoolean: false,
            allowNullish: false,
            allowNumberAndString: false,
            allowRegExp: false,
          },
        ],
      },
      description:
        'Require both operands of addition to be the same type and be `bigint`, `number`, or `string`',
      requiresTypeChecking: true,
    },
    messages: {
      bigintAndNumber:
        "Numeric '+' operations must either be both bigints or both numbers. Got `{{left}}` + `{{right}}`.",
      invalid:
        "Invalid operand for a '+' operation. Operands must each be a number or {{stringLike}}. Got `{{type}}`.",
      mismatched:
        "Operands of '+' operations must be a number or {{stringLike}}. Got `{{left}}` + `{{right}}`.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowAny: {
            type: 'boolean',
            description: 'Whether to allow `any` typed values.',
          },
          allowBoolean: {
            type: 'boolean',
            description: 'Whether to allow `boolean` typed values.',
          },
          allowNullish: {
            type: 'boolean',
            description:
              'Whether to allow potentially `null` or `undefined` typed values.',
          },
          allowNumberAndString: {
            type: 'boolean',
            description:
              'Whether to allow `bigint`/`number` typed values and `string` typed values to be added together.',
          },
          allowRegExp: {
            type: 'boolean',
            description: 'Whether to allow `regexp` typed values.',
          },
          skipCompoundAssignments: {
            type: 'boolean',
            description: 'Whether to skip compound assignments such as `+=`.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowAny: true,
      allowBoolean: true,
      allowNullish: true,
      allowNumberAndString: true,
      allowRegExp: true,
      skipCompoundAssignments: false,
    },
  ],
  create(
    context,
    [
      {
        allowAny,
        allowBoolean,
        allowNullish,
        allowNumberAndString,
        allowRegExp,
        skipCompoundAssignments,
      },
    ],
  ) {
    const services = getParserServices(context);
    const typeChecker = services.program.getTypeChecker();

    const stringLikes = [
      allowAny && '`any`',
      allowBoolean && '`boolean`',
      allowNullish && '`null`',
      allowRegExp && '`RegExp`',
      allowNullish && '`undefined`',
    ].filter((value): value is string => typeof value === 'string');
    const stringLike = stringLikes.length
      ? stringLikes.length === 1
        ? `string, allowing a string + ${stringLikes[0]}`
        : `string, allowing a string + any of: ${stringLikes.join(', ')}`
      : 'string';

    function getTypeConstrained(node: TSESTree.Node): ts.Type {
      return typeChecker.getBaseTypeOfLiteralType(
        getConstrainedTypeAtLocation(services, node),
      );
    }

    function checkPlusOperands(
      node: TSESTree.AssignmentExpression | TSESTree.BinaryExpression,
    ): void {
      const leftType = getTypeConstrained(node.left);
      const rightType = getTypeConstrained(node.right);

      if (
        leftType === rightType &&
        tsutils.isTypeFlagSet(
          leftType,
          ts.TypeFlags.BigIntLike |
            ts.TypeFlags.NumberLike |
            ts.TypeFlags.StringLike,
        )
      ) {
        return;
      }

      let hadIndividualComplaint = false;

      for (const [baseNode, baseType, otherType] of [
        [node.left, leftType, rightType],
        [node.right, rightType, leftType],
      ] as const) {
        if (
          isTypeFlagSetInUnion(
            baseType,
            ts.TypeFlags.ESSymbolLike |
              ts.TypeFlags.Never |
              ts.TypeFlags.Unknown,
          ) ||
          (!allowAny && isTypeFlagSetInUnion(baseType, ts.TypeFlags.Any)) ||
          (!allowBoolean &&
            isTypeFlagSetInUnion(baseType, ts.TypeFlags.BooleanLike)) ||
          (!allowNullish &&
            isTypeFlagSet(baseType, ts.TypeFlags.Null | ts.TypeFlags.Undefined))
        ) {
          context.report({
            node: baseNode,
            messageId: 'invalid',
            data: {
              type: typeChecker.typeToString(baseType),
              stringLike,
            },
          });
          hadIndividualComplaint = true;
          continue;
        }

        // RegExps also contain ts.TypeFlags.Any & ts.TypeFlags.Object
        for (const subBaseType of tsutils.unionConstituents(baseType)) {
          const typeName = getTypeName(typeChecker, subBaseType);
          if (
            typeName === 'RegExp'
              ? !allowRegExp ||
                tsutils.isTypeFlagSet(otherType, ts.TypeFlags.NumberLike)
              : (!allowAny && isTypeAnyType(subBaseType)) ||
                isDeeplyObjectType(subBaseType)
          ) {
            context.report({
              node: baseNode,
              messageId: 'invalid',
              data: {
                type: typeChecker.typeToString(subBaseType),
                stringLike,
              },
            });
            hadIndividualComplaint = true;
            continue;
          }
        }
      }

      if (hadIndividualComplaint) {
        return;
      }

      for (const [baseType, otherType] of [
        [leftType, rightType],
        [rightType, leftType],
      ] as const) {
        if (
          !allowNumberAndString &&
          isTypeFlagSetInUnion(baseType, ts.TypeFlags.StringLike) &&
          isTypeFlagSetInUnion(
            otherType,
            ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike,
          )
        ) {
          return context.report({
            node,
            messageId: 'mismatched',
            data: {
              left: typeChecker.typeToString(leftType),
              right: typeChecker.typeToString(rightType),
              stringLike,
            },
          });
        }

        if (
          isTypeFlagSetInUnion(baseType, ts.TypeFlags.NumberLike) &&
          isTypeFlagSetInUnion(otherType, ts.TypeFlags.BigIntLike)
        ) {
          return context.report({
            node,
            messageId: 'bigintAndNumber',
            data: {
              left: typeChecker.typeToString(leftType),
              right: typeChecker.typeToString(rightType),
            },
          });
        }
      }
    }

    return {
      "BinaryExpression[operator='+']": checkPlusOperands,
      ...(!skipCompoundAssignments && {
        "AssignmentExpression[operator='+=']"(node): void {
          checkPlusOperands(node);
        },
      }),
    };
  },
});

function isDeeplyObjectType(type: ts.Type): boolean {
  return type.isIntersection()
    ? tsutils.intersectionConstituents(type).every(tsutils.isObjectType)
    : tsutils.unionConstituents(type).every(tsutils.isObjectType);
}

function isTypeFlagSetInUnion(type: ts.Type, flag: ts.TypeFlags): boolean {
  return tsutils
    .unionConstituents(type)
    .some(subType => tsutils.isTypeFlagSet(subType, flag));
}
