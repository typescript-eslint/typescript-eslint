import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils } from '@typescript-eslint/utils';

import * as util from '../util';

export default util.createRule({
  name: 'no-require-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow invocation of `require()`',
      recommended: false,
    },
    schema: [],
    messages: {
      noRequireImports: 'A `require()` style import is forbidden.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'CallExpression[callee.name="require"]'(
        node: TSESTree.CallExpression,
      ): void {
        const variable = ASTUtils.findVariable(context.getScope(), 'require');

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
        context.report({
          node,
          messageId: 'noRequireImports',
        });
      },
    };
  },
});
