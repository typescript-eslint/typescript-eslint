import { TSESTree } from '@typescript-eslint/experimental-utils';
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
      'CallExpression > Identifier[name="require"]'(
        node: TSESTree.Identifier,
      ): void {
        context.report({
          node: node.parent!,
          messageId: 'noRequireImports',
        });
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
