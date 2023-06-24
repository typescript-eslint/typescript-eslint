import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    allowAny?: boolean;
    allowBoolean?: boolean;
    allowNullish?: boolean;
    allowNumberAndString?: boolean;
    allowRegExp?: boolean;
    checkCompoundAssignments?: boolean;
  },
];

type MessageIds = 'bigintAndNumber' | 'invalid' | 'mismatched';

export default util.createRule<Options, MessageIds>({
  name: 'restrict-plus-operands',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require both operands of addition to be the same type and be `bigint`, `number`, or `string`',
      recommended: 'error',
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
            description: 'Whether to allow `any` typed values.',
            type: 'boolean',
          },
          allowBoolean: {
            description: 'Whether to allow `boolean` typed values.',
            type: 'boolean',
          },
          allowNullish: {
            description:
              'Whether to allow potentially `null` or `undefined` typed values.',
            type: 'boolean',
          },
          allowNumberAndString: {
            description:
              'Whether to allow `bigint`/`number` typed values and `string` typed values to be added together.',
            type: 'boolean',
          },
          allowRegExp: {
            description: 'Whether to allow `regexp` typed values.',
            type: 'boolean',
          },
          checkCompoundAssignments: {
            description: 'Whether to check compound assignments such as `+=`.',
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      checkCompoundAssignments: false,
    },
  ],
  create(
    context,
    [
      {
        checkCompoundAssignments,
        allowAny,
        allowBoolean,
        allowNullish,
        allowNumberAndString,
        allowRegExp,
      },
    ],
  ) {
    const service = util.getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

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
        util.getConstrainedTypeAtLocation(
          typeChecker,
          service.esTreeNodeToTSNodeMap.get(node),
        ),
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
            util.isTypeFlagSet(
              baseType,
              ts.TypeFlags.Null | ts.TypeFlags.Undefined,
            ))
        ) {
          context.report({
            data: {
              stringLike,
              type: typeChecker.typeToString(baseType),
            },
            messageId: 'invalid',
            node: baseNode,
          });
          hadIndividualComplaint = true;
          continue;
        }

        // RegExps also contain ts.TypeFlags.Any & ts.TypeFlags.Object
        for (const subBaseType of tsutils.unionTypeParts(baseType)) {
          const typeName = util.getTypeName(typeChecker, subBaseType);
          if (
            typeName === 'RegExp'
              ? !allowRegExp ||
                tsutils.isTypeFlagSet(otherType, ts.TypeFlags.NumberLike)
              : (!allowAny && util.isTypeAnyType(subBaseType)) ||
                isDeeplyObjectType(subBaseType)
          ) {
            context.report({
              data: {
                stringLike,
                type: typeChecker.typeToString(subBaseType),
              },
              messageId: 'invalid',
              node: baseNode,
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
          isTypeFlagSetInUnion(otherType, ts.TypeFlags.NumberLike)
        ) {
          return context.report({
            data: {
              stringLike,
              left: typeChecker.typeToString(leftType),
              right: typeChecker.typeToString(rightType),
            },
            messageId: 'mismatched',
            node,
          });
        }

        if (
          isTypeFlagSetInUnion(baseType, ts.TypeFlags.NumberLike) &&
          isTypeFlagSetInUnion(otherType, ts.TypeFlags.BigIntLike)
        ) {
          return context.report({
            data: {
              left: typeChecker.typeToString(leftType),
              right: typeChecker.typeToString(rightType),
            },
            messageId: 'bigintAndNumber',
            node,
          });
        }
      }
    }

    return {
      "BinaryExpression[operator='+']": checkPlusOperands,
      ...(checkCompoundAssignments && {
        "AssignmentExpression[operator='+=']"(node): void {
          checkPlusOperands(node);
        },
      }),
    };
  },
});

function isDeeplyObjectType(type: ts.Type): boolean {
  return type.isIntersection()
    ? tsutils.intersectionTypeParts(type).every(tsutils.isObjectType)
    : tsutils.unionTypeParts(type).every(tsutils.isObjectType);
}

function isTypeFlagSetInUnion(type: ts.Type, flag: ts.TypeFlags): boolean {
  return tsutils
    .unionTypeParts(type)
    .some(subType => tsutils.isTypeFlagSet(subType, flag));
}
