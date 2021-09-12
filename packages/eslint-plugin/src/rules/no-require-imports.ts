import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
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
        const variable = getVariableByName(context.getScope(), 'require');

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

/**
 * Finds the variable by a given name in a given scope and its upper scopes.
 * @param initScope A scope to start find.
 * @param name A variable name to find.
 * @returns A found variable or `null`.
 */
function getVariableByName(
  initScope: TSESLint.Scope.Scope | null,
  name: string,
): TSESLint.Scope.Variable | null {
  let scope = initScope;

  while (scope) {
    const variable = scope.set.get(name);

    if (variable) {
      return variable;
    }

    scope = scope.upper;
  }

  return null;
}
