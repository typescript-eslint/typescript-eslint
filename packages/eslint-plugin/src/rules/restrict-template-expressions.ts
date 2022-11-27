import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    allowNumber?: boolean;
    allowBoolean?: boolean;
    allowAny?: boolean;
    allowNullish?: boolean;
    allowRegExp?: boolean;
  },
];

type MessageId = 'invalidType';

export default util.createRule<Options, MessageId>({
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
        properties: {
          allowNumber: {
            description:
              'Whether to allow `number` typed values in template expressions.',
            type: 'boolean',
          },
          allowBoolean: {
            description:
              'Whether to allow `boolean` typed values in template expressions.',
            type: 'boolean',
          },
          allowAny: {
            description:
              'Whether to allow `any` typed values in template expressions.',
            type: 'boolean',
          },
          allowNullish: {
            description:
              'Whether to allow `nullish` typed values in template expressions.',
            type: 'boolean',
          },
          allowRegExp: {
            description:
              'Whether to allow `regexp` typed values in template expressions.',
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowNumber: true,
    },
  ],
  create(context, [options]) {
    const service = util.getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    function isUnderlyingTypePrimitive(type: ts.Type): boolean {
      if (util.isTypeFlagSet(type, ts.TypeFlags.StringLike)) {
        return true;
      }

      if (
        options.allowNumber &&
        util.isTypeFlagSet(
          type,
          ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike,
        )
      ) {
        return true;
      }

      if (
        options.allowBoolean &&
        util.isTypeFlagSet(type, ts.TypeFlags.BooleanLike)
      ) {
        return true;
      }

      if (options.allowAny && util.isTypeAnyType(type)) {
        return true;
      }

      if (
        options.allowRegExp &&
        util.getTypeName(typeChecker, type) === 'RegExp'
      ) {
        return true;
      }

      if (
        options.allowNullish &&
        util.isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined)
      ) {
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
          const expressionType = util.getConstrainedTypeAtLocation(
            typeChecker,
            service.esTreeNodeToTSNodeMap.get(expression),
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
              data: { type: typeChecker.typeToString(expressionType) },
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
