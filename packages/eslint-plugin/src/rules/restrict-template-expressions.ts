import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getTypeName,
  isTypeAnyType,
  isTypeFlagSet,
  isTypeNeverType,
} from '../util';

const optionsObj = {
  Any: isTypeAnyType,
  Array: (type, checker, rec): boolean => {
    if (!checker.isArrayType(type)) {
      return false;
    }
    const numberIndexType = type.getNumberIndexType();
    return !numberIndexType || rec(numberIndexType);
  },
  Boolean: (type): boolean => isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
  Nullish: (type): boolean =>
    isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined),
  Number: (type): boolean =>
    isTypeFlagSet(type, ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike),
  RegExp: (type, checker): boolean => getTypeName(checker, type) === 'RegExp',
  Never: isTypeNeverType,
} satisfies Record<
  string,
  (
    type: ts.Type,
    checker: ts.TypeChecker,
    rec: (type: ts.Type) => boolean,
  ) => boolean
>;
const optionsArr = Object.entries(optionsObj).map(([_type, fn]) => {
  const type = _type as keyof typeof optionsObj;
  return { type, option: `allow${type}` as const, fn };
});
type Options = [{ [Type in (typeof optionsArr)[number]['option']]?: boolean }];

type MessageId = 'invalidType';

export default createRule<Options, MessageId>({
  name: 'restrict-template-expressions',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce template literal expressions to be of `string` type',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      invalidType: 'Invalid type "{{type}}" of template literal expression.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: Object.fromEntries(
          optionsArr.map(({ option, type }) => [
            option,
            {
              description: `Whether to allow \`${type.toLowerCase()}\` typed values in template expressions.`,
              type: 'boolean',
            },
          ]),
        ),
      },
    ],
  },
  defaultOptions: [
    {
      allowAny: true,
      allowBoolean: true,
      allowNullish: true,
      allowNumber: true,
      allowRegExp: true,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        // don't check tagged template literals
        if (node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }

        for (const expression of node.expressions) {
          const expressionType = getConstrainedTypeAtLocation(
            services,
            expression,
          );

          if (!isInnerUnionOrIntersectionConformingTo(expressionType)) {
            context.report({
              node: expression,
              messageId: 'invalidType',
              data: { type: checker.typeToString(expressionType) },
            });
          }
        }
      },
    };

    function isInnerUnionOrIntersectionConformingTo(type: ts.Type): boolean {
      return rec(type);

      function rec(innerType: ts.Type): boolean {
        if (innerType.isUnion()) {
          return innerType.types.every(rec);
        }

        if (innerType.isIntersection()) {
          return innerType.types.some(rec);
        }

        return (
          isTypeFlagSet(innerType, ts.TypeFlags.StringLike) ||
          optionsArr.some(
            ({ option, fn }) => options[option] && fn(innerType, checker, rec),
          )
        );
      }
    }
  },
});
