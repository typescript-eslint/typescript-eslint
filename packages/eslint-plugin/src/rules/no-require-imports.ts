import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import * as util from '../util';

type Options = [
  {
    allow?: string[];
    allowAsImport?: boolean;
  },
];
type MessageIds = 'noRequireImports';

export default util.createRule<Options, MessageIds>({
  name: 'no-require-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow invocation of `require()`',
      recommended: 'recommended',
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
          allowAsImport: {
            type: 'boolean',
            description: 'Allows `require` statements in import declarations.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noRequireImports: 'A `require()` style import is forbidden.',
    },
  },
  defaultOptions: [{ allow: [], allowAsImport: false }],
  create(context, options) {
    const allowAsImport = options[0].allowAsImport;
    const allowPatterns = options[0].allow?.map(
      pattern => new RegExp(pattern, 'u'),
    );
    function isImportPathAllowed(importPath: string): boolean | undefined {
      return allowPatterns?.some(pattern => importPath.match(pattern));
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
          const argValue = util.getStaticStringValue(node.arguments[0]);
          if (typeof argValue === 'string' && isImportPathAllowed(argValue)) {
            return;
          }
        }
        const variable = ASTUtils.findVariable(
          context.sourceCode.getScope(node),
          'require',
        );
        const parent =
          node.parent.type === AST_NODE_TYPES.ChainExpression
            ? node.parent.parent
            : node.parent;

        if (allowAsImport) {
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
            if (!variable?.identifiers.length) {
              context.report({
                node,
                messageId: 'noRequireImports',
              });
            }
          }
        } else {
          // ignore non-global require usage as it's something user-land custom instead
          // of the commonjs standard
          if (!variable?.identifiers.length) {
            context.report({
              node,
              messageId: 'noRequireImports',
            });
          }
        }
      },
      TSExternalModuleReference(node): void {
        if (isStringOrTemplateLiteral(node.expression)) {
          const argValue = util.getStaticStringValue(node.expression);
          if (typeof argValue === 'string' && isImportPathAllowed(argValue)) {
            return;
          }
        }
        if (
          allowAsImport &&
          node.parent.type === AST_NODE_TYPES.TSImportEqualsDeclaration
        ) {
          return;
        }
        context.report({
          node,
          messageId: 'noRequireImports',
        });
      },
    };
  },
});
