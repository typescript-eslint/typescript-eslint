import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'prefer-namespace-keyword',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require the use of the `namespace` keyword instead of the `module` keyword to declare custom TypeScript modules',
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      useNamespace:
        "Use 'namespace' instead of 'module' to declare custom TypeScript modules.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      TSModuleDeclaration(node): void {
        // Do nothing if the name is a string.
        if (!node.id || node.id.type === AST_NODE_TYPES.Literal) {
          return;
        }
        // Get tokens of the declaration header.
        const moduleType = sourceCode.getTokenBefore(node.id);

        if (
          moduleType &&
          moduleType.type === AST_TOKEN_TYPES.Identifier &&
          moduleType.value === 'module'
        ) {
          context.report({
            node,
            messageId: 'useNamespace',
            fix(fixer) {
              return fixer.replaceText(moduleType, 'namespace');
            },
          });
        }
      },
    };
  },
});
