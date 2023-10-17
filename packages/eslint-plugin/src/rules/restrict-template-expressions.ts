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

type Options = [
  {
    allowAny?: boolean;
    allowBoolean?: boolean;
    allowNullish?: boolean;
    allowNumber?: boolean;
    allowRegExp?: boolean;
    allowNever?: boolean;
  },
];

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
        properties: {
          allowAny: {
            description:
              'Whether to allow `any` typed values in template expressions.',
            type: 'boolean',
          },
          allowBoolean: {
            description:
              'Whether to allow `boolean` typed values in template expressions.',
            type: 'boolean',
          },
          allowNullish: {
            description:
              'Whether to allow `nullish` typed values in template expressions.',
            type: 'boolean',
          },
          allowNumber: {
            description:
              'Whether to allow `number` typed values in template expressions.',
            type: 'boolean',
          },
          allowRegExp: {
            description:
              'Whether to allow `regexp` typed values in template expressions.',
            type: 'boolean',
          },
          allowNever: {
            description:
              'Whether to allow `never` typed values in template expressions.',
            type: 'boolean',
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
      allowNumber: true,
      allowRegExp: true,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isUnderlyingTypePrimitive(type: ts.Type): boolean {
      if (isTypeFlagSet(type, ts.TypeFlags.StringLike)) {
        return true;
      }

      if (
        options.allowNumber &&
        isTypeFlagSet(type, ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike)
      ) {
        return true;
      }

      if (
        options.allowBoolean &&
        isTypeFlagSet(type, ts.TypeFlags.BooleanLike)
      ) {
        return true;
      }

      if (options.allowAny && isTypeAnyType(type)) {
        return true;
      }

      if (options.allowRegExp && getTypeName(checker, type) === 'RegExp') {
        return true;
      }

      if (
        options.allowNullish &&
        isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined)
      ) {
        return true;
      }

      if (options.allowNever && isTypeNeverType(type)) {
        return true;
      }

      return false;
    }

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

          if (
            !isInnerUnionOrIntersectionConformingTo(
              expressionType,
              isUnderlyingTypePrimitive,
            )
          ) {
            context.report({
              node: expression,
              messageId: 'invalidType',
              data: { type: checker.typeToString(expressionType) },
            });
          }
        }
      },
    };

    function isInnerUnionOrIntersectionConformingTo(
      type: ts.Type,
      predicate: (underlyingType: ts.Type) => boolean,
    ): boolean {
      return rec(type);

      function rec(innerType: ts.Type): boolean {
        if (innerType.isUnion()) {
          return innerType.types.every(rec);
        }

        if (innerType.isIntersection()) {
          return innerType.types.some(rec);
        }

        return predicate(innerType);
      }
    }
  },
});
