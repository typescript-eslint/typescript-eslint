import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';
import { getScope } from '@typescript-eslint/utils/eslint-utils';

import { createRule } from '../util';

type Options = [
  {
    allowPackageJson?: boolean;
  },
];
type MessageIds = 'noVarReqs';

export default createRule<Options, MessageIds>({
  name: 'no-var-requires',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow `require` statements except in import statements',
      recommended: 'recommended',
    },
    messages: {
      noVarReqs: 'Require statement not part of import statement.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowPackageJson: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  defaultOptions: [{ allowPackageJson: false }],
  create(context, options) {
    return {
      'CallExpression[callee.name="require"]'(
        node: TSESTree.CallExpression,
      ): void {
        if (
          options[0].allowPackageJson &&
          node.arguments[0]?.type === AST_NODE_TYPES.Literal &&
          typeof node.arguments[0].value === 'string' &&
          node.arguments[0].value.endsWith('/package.json')
        ) {
          return;
        }
        const parent =
          node.parent.type === AST_NODE_TYPES.ChainExpression
            ? node.parent.parent
            : node.parent;

        if (
          [
            AST_NODE_TYPES.CallExpression,
            AST_NODE_TYPES.MemberExpression,
            AST_NODE_TYPES.NewExpression,
            AST_NODE_TYPES.TSAsExpression,
            AST_NODE_TYPES.TSTypeAssertion,
            AST_NODE_TYPES.VariableDeclarator,
          ].includes(parent.type)
        ) {
          const variable = ASTUtils.findVariable(getScope(context), 'require');

          if (!variable?.identifiers.length) {
            context.report({
              node,
              messageId: 'noVarReqs',
            });
          }
        }
      },
    };
  },
});
