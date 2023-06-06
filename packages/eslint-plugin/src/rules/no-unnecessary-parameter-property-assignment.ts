import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

export const messageId = 'noUnnecessaryParameterPropertyAssignment';

export default util.createRule({
  name: 'no-unnecessary-parameter-property-assignment',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow unnecessary assignment of constructor property parameter to itself',
      recommended: 'error',
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      [messageId]:
        'Assignment has no effect as roperty parameter is already defined in the constructor.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parameterProperties = new Set<string>();
    return {
      'ClassDeclaration, ClassExpression'(): void {
        parameterProperties.clear();
      },
      'MethodDefinition[kind="constructor"] > FunctionExpression > TSParameterProperty'(
        property: TSESTree.TSParameterProperty,
      ): void {
        if (property.parameter.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        parameterProperties.add(property.parameter.name);
      },
      'MethodDefinition[kind="constructor"] > FunctionExpression AssignmentExpression'(
        node: TSESTree.AssignmentExpression,
      ): void {
        const { left, right } = node;
        if (
          left.type !== AST_NODE_TYPES.MemberExpression ||
          right.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        if (left.property.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (left.property.name !== right.name) {
          return;
        }

        if (!parameterProperties.has(left.property.name)) {
          return;
        }

        context.report({
          node,
          messageId,
        });
      },
    };
  },
});
