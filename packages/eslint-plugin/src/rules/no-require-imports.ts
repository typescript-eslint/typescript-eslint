import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';
import { getScope } from '@typescript-eslint/utils/eslint-utils';

import * as util from '../util';

type Options = [
  {
    allowPackageJson?: boolean;
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
          allowPackageJson: {
            type: 'boolean',
          },
        },
      },
    ],
    messages: {
      noRequireImports: 'A `require()` style import is forbidden.',
    },
  },
  defaultOptions: [{ allowPackageJson: false }],
  create(context, options) {
    function isPackageJsonImport(
      specifier: TSESTree.Node | undefined,
    ): boolean {
      if (!specifier) {
        return false;
      }
      return (
        specifier.type === AST_NODE_TYPES.Literal &&
        typeof specifier.value === 'string' &&
        specifier.value.endsWith('/package.json')
      );
    }
    return {
      'CallExpression[callee.name="require"]'(
        node: TSESTree.CallExpression,
      ): void {
        if (
          options[0].allowPackageJson &&
          isPackageJsonImport(node.arguments[0])
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
          options[0].allowPackageJson &&
          isPackageJsonImport(node.expression)
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
