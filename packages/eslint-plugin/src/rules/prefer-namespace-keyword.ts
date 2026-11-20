import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, nullThrows, NullThrowsReasons } from '../util';

export default createRule({
  name: 'prefer-namespace-keyword',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require using `namespace` keyword over `module` keyword to declare custom TypeScript modules',
      recommended: 'recommended',
    },
    fixable: 'code',
    messages: {
      useNamespace:
        "Use 'namespace' instead of 'module' to declare custom TypeScript modules.",
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    return {
      TSModuleDeclaration(node): void {
        // `declare module 'foo'` declares an external module, not a namespace
        if (node.kind !== 'module' || node.id.type === AST_NODE_TYPES.Literal) {
          return;
        }

        context.report({
          node,
          messageId: 'useNamespace',
          fix(fixer) {
            const moduleKeyword = nullThrows(
              context.sourceCode.getTokenBefore(node.id),
              NullThrowsReasons.MissingToken('module', 'module declaration'),
            );
            return fixer.replaceText(moduleKeyword, 'namespace');
          },
        });
      },
    };
  },
});
