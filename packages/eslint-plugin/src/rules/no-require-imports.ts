import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'no-require-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows invocation of `require()`',
      category: 'Best Practices',
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
