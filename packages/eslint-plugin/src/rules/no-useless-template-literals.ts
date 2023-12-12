import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeFlagSet,
  isUndefinedIdentifier,
} from '../util';

type MessageId = 'noUselessTemplateLiteral';

export default createRule<[], MessageId>({
  name: 'no-useless-template-literals',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary template literals',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      noUselessTemplateLiteral:
        'Template literal expression is unnecessary and can be simplified.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);

    function isUnderlyingTypeString(
      expression: TSESTree.Expression,
    ): expression is TSESTree.StringLiteral | TSESTree.Identifier {
      const type = getConstrainedTypeAtLocation(services, expression);

      const isString = (t: ts.Type): boolean => {
        return isTypeFlagSet(t, ts.TypeFlags.StringLike);
      };

      if (type.isUnion()) {
        return type.types.every(isString);
      }

      if (type.isIntersection()) {
        return type.types.some(isString);
      }

      return isString(type);
    }

    return {
      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        if (node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }

        const hasSingleStringVariable =
          node.quasis.length === 2 &&
          node.quasis[0].value.raw === '' &&
          node.quasis[1].value.raw === '' &&
          node.expressions.length === 1 &&
          isUnderlyingTypeString(node.expressions[0]);

        if (hasSingleStringVariable) {
          context.report({
            node: node.expressions[0],
            messageId: 'noUselessTemplateLiteral',
          });

          return;
        }

        const literalsOrUndefinedExpressions = node.expressions.filter(
          (expression): expression is TSESTree.Literal | TSESTree.Identifier =>
            expression.type === AST_NODE_TYPES.Literal ||
            isUndefinedIdentifier(expression),
        );

        literalsOrUndefinedExpressions.forEach(expression => {
          context.report({
            node: expression,
            messageId: 'noUselessTemplateLiteral',
          });
        });
      },
    };
  },
});
