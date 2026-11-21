import type { TSESLint } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createRule, nullThrows, NullThrowsReasons } from '../util';

function hasAssignmentBeforeNode(
  variable: TSESLint.Scope.Variable,
  node: TSESTree.Node,
): boolean {
  return (
    variable.references.some(
      ref => ref.isWrite() && ref.identifier.range[1] < node.range[1],
    ) ||
    // Parameters, imports, functions, and the like always hold a value.
    // Variable initializers are already counted as write references above.
    variable.defs.some(def => {
      switch (def.type) {
        case DefinitionType.Variable:
          return def.node.definite || def.parent.declare;
        // Type-only declarations can merge with an unassigned `let`.
        case DefinitionType.TSModuleName:
        case DefinitionType.Type:
          return false;
        default:
          return true;
      }
    })
  );
}

export default createRule({
  name: 'no-non-null-asserted-nullish-coalescing',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow non-null assertions in the left operand of a nullish coalescing operator',
      recommended: 'strict',
    },
    hasSuggestions: true,
    messages: {
      noNonNullAssertedNullishCoalescing:
        'The nullish coalescing operator is designed to handle undefined and null - using a non-null assertion is not needed.',
      suggestRemovingNonNull: 'Remove the non-null assertion.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    return {
      'LogicalExpression[operator = "??"] > TSNonNullExpression.left'(
        node: TSESTree.TSNonNullExpression,
      ): void {
        if (node.expression.type === TSESTree.AST_NODE_TYPES.Identifier) {
          const scope = context.sourceCode.getScope(node);
          const identifier = node.expression;
          const variable = ASTUtils.findVariable(scope, identifier.name);
          if (variable && !hasAssignmentBeforeNode(variable, node)) {
            return;
          }
        }

        context.report({
          node,
          messageId: 'noNonNullAssertedNullishCoalescing',
          /*
          Use a suggestion instead of a fixer, because this can break type checks.
          The resulting type of the nullish coalesce is only influenced by the right operand if the left operand can be `null` or `undefined`.
          After removing the non-null assertion the type of the left operand might contain `null` or `undefined` and then the type of the right operand
          might change the resulting type of the nullish coalesce.
          See the following example:

          function test(x?: string): string {
            const bar = x! ?? false; // type analysis reports `bar` has type `string`
            //          x  ?? false; // type analysis reports `bar` has type `string | false`
            return bar;
          }
          */
          suggest: [
            {
              messageId: 'suggestRemovingNonNull',
              fix(fixer): TSESLint.RuleFix {
                const exclamationMark = nullThrows(
                  context.sourceCode.getLastToken(
                    node,
                    ASTUtils.isNonNullAssertionPunctuator,
                  ),
                  NullThrowsReasons.MissingToken('!', 'Non-null Assertion'),
                );
                return fixer.remove(exclamationMark);
              },
            },
          ],
        });
      },
    };
  },
});
