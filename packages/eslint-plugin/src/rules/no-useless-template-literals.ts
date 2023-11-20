import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeFlagSet,
} from '../util';

type MessageId = 'noUselessTemplateLiteral';

export default createRule<[], MessageId>({
  name: 'no-useless-template-literals',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary template literals',
      recommended: 'recommended',
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

    function isUnderlyingTypeString(expression: TSESTree.Expression): boolean {
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
          node.expressions[0].type === AST_NODE_TYPES.Identifier &&
          isUnderlyingTypeString(node.expressions[0]);

        if (hasSingleStringVariable) {
          context.report({
            node,
            messageId: 'noUselessTemplateLiteral',
          });

          return;
        }

        const allowedChars = ['\r', '\n', "'", '"'];

        const hasStringWithAllowedChars = node.quasis.some(quasi => {
          return new RegExp(`[${allowedChars.join('')}]`).test(quasi.value.raw);
        });

        if (hasStringWithAllowedChars) {
          return;
        }

        const allAreLiterals = node.expressions.every(expression => {
          return expression.type === AST_NODE_TYPES.Literal;
        });

        if (allAreLiterals) {
          context.report({
            node,
            messageId: 'noUselessTemplateLiteral',
          });
        }
      },
    };
  },
});
