import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import * as util from '../util';

type Options = [
  {
    allow: string[];
  },
];
type MessageIds = 'noRequireImports';

export default util.createRule<Options, MessageIds>({
  name: 'no-require-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow invocation of `require()`',
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
    messages: {
      noRequireImports: 'A `require()` style import is forbidden.',
    },
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
          const argValue = util.getStaticStringValue(node.arguments[0]);
          if (typeof argValue === 'string' && isImportPathAllowed(argValue)) {
            return;
          }
        }
        const variable = ASTUtils.findVariable(
          context.sourceCode.getScope(node),
          'require',
        );

        // ignore non-global require usage as it's something user-land custom instead
        // of the commonjs standard
        if (!variable?.identifiers.length) {
          context.report({
            node,
            messageId: 'noRequireImports',
          });
        }
      },
      TSExternalModuleReference(node): void {
        if (isStringOrTemplateLiteral(node.expression)) {
          const argValue = util.getStaticStringValue(node.expression);
          if (typeof argValue === 'string' && isImportPathAllowed(argValue)) {
            return;
          }
        }
        context.report({
          node,
          messageId: 'noRequireImports',
        });
      },
    };
  },
});
