import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';
import { getScope } from '@typescript-eslint/utils/eslint-utils';

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
    return {
      'CallExpression[callee.name="require"]'(
        node: TSESTree.CallExpression,
      ): void {
        if (
          node.arguments[0]?.type === AST_NODE_TYPES.Literal &&
          typeof node.arguments[0].value === 'string' &&
          isImportPathAllowed(node.arguments[0].value)
        ) {
          return;
        }
        const variable = ASTUtils.findVariable(getScope(context), 'require');

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
        if (
          node.expression.type === AST_NODE_TYPES.Literal &&
          typeof node.expression.value === 'string' &&
          isImportPathAllowed(node.expression.value)
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
