import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export default createRule({
  name: 'prefer-namespace-keyword',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require using `namespace` keyword over `module` keyword to declare custom TypeScript modules',
      recommended: 'stylistic',
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
    return {
      TSModuleDeclaration(node): void {
        // Do nothing if the name is a string.
        if (node.id.type === AST_NODE_TYPES.Literal) {
          return;
        }
        // Get tokens of the declaration header.
        const moduleType = context.sourceCode.getTokenBefore(node.id);

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
