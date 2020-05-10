import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

type Options = [
  {
    allowNumber?: boolean;
    allowBoolean?: boolean;
    allowAny?: boolean;
    allowNullable?: boolean;
  },
];

type MessageId = 'invalidType';

export default util.createRule<Options, MessageId>({
  name: 'restrict-template-expressions',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce template literal expressions to be of string type',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      invalidType: 'Invalid type of template literal expression.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowNumber: { type: 'boolean' },
          allowBoolean: { type: 'boolean' },
          allowAny: { type: 'boolean' },
          allowNullable: { type: 'boolean' },
        },
      },
    ],
  },
  defaultOptions: [{}],
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

      if (options.allowAny && util.isTypeFlagSet(type, ts.TypeFlags.Any)) {
        return true;
      }

      if (
        options.allowNullable &&
        util.isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined)
      ) {
        return true;
      }

      return false;
    }

    return {
      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        // don't check tagged template literals
        if (node.parent!.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }

        for (const expression of node.expressions) {
          if (
            !isUnderlyingExpressionTypeConfirmingTo(
              expression,
              isUnderlyingTypePrimitive,
            )
          ) {
            context.report({
              node: expression,
              messageId: 'invalidType',
            });
          }
        }
      },
    };

    function isUnderlyingExpressionTypeConfirmingTo(
      expression: TSESTree.Expression,
      predicate: (underlyingType: ts.Type) => boolean,
    ): boolean {
      return rec(getExpressionNodeType(expression));

      function rec(type: ts.Type): boolean {
        if (type.isUnion()) {
          return type.types.every(rec);
        }

        if (type.isIntersection()) {
          return type.types.some(rec);
        }

        return predicate(type);
      }
    }

    /**
     * Helper function to extract the TS type of an TSESTree expression.
     */
    function getExpressionNodeType(node: TSESTree.Expression): ts.Type {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      return util.getConstrainedTypeAtLocation(typeChecker, tsNode);
    }
  },
});
