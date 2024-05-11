import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import { createRule, getStaticStringValue } from '../util';

type Options = [
  {
    allow: string[];
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
          allow: {
            type: 'array',
            items: { type: 'string' },
            description: 'Patterns of import paths to allow requiring from.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ allow: [] }],
  create(context, options) {
    const allowPatterns = options[0].allow.map(
      pattern => new RegExp(pattern, 'u'),
    );
    function isImportPathAllowed(importPath: string): boolean {
      return allowPatterns.some(pattern => importPath.match(pattern));
    }

    function isStringOrTemplateLiteral(node: TSESTree.Node): boolean {
      return (
        (node.type === AST_NODE_TYPES.Literal &&
          typeof node.value === 'string') ||
        node.type === AST_NODE_TYPES.TemplateLiteral
      );
    }

    return {
      'CallExpression[callee.name="require"]'(
        node: TSESTree.CallExpression,
      ): void {
        if (node.arguments[0] && isStringOrTemplateLiteral(node.arguments[0])) {
          const argValue = getStaticStringValue(node.arguments[0]);
          if (typeof argValue === 'string' && isImportPathAllowed(argValue)) {
            return;
          }
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
          const variable = ASTUtils.findVariable(
            context.sourceCode.getScope(node),
            'require',
          );

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
