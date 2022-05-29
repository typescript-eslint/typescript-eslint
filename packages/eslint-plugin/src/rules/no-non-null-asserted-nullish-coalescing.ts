import { ASTUtils, TSESTree, TSESLint } from '@typescript-eslint/utils';
import { Definition, DefinitionType } from '@typescript-eslint/scope-manager';
import * as util from '../util';

function hasAssignmentBeforeNode(
  variable: TSESLint.Scope.Variable,
  node: TSESTree.Node,
): boolean {
  return (
    variable.references.some(
      ref => ref.isWrite() && ref.identifier.range[1] < node.range[1],
    ) ||
    variable.defs.some(
      def =>
        isDefinitionWithAssignment(def) && def.node.range[1] < node.range[1],
    )
  );
}

function isDefinitionWithAssignment(definition: Definition): boolean {
  if (definition.type !== DefinitionType.Variable) {
    return false;
  }

  const variableDeclarator = definition.node;
  return (
    variableDeclarator.definite === true || variableDeclarator.init !== null
  );
}

export default util.createRule({
  name: 'no-non-null-asserted-nullish-coalescing',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow non-null assertions in the left operand of a nullish coalescing operator',
      recommended: 'strict',
    },
    messages: {
      noNonNullAssertedNullishCoalescing:
        'The nullish coalescing operator is designed to handle undefined and null - using a non-null assertion is not needed.',
      suggestRemovingNonNull: 'Remove the non-null assertion.',
    },
    schema: [],
    hasSuggestions: true,
  },
  defaultOptions: [],
  create(context) {
    return {
      'LogicalExpression[operator = "??"] > TSNonNullExpression.left'(
        node: TSESTree.TSNonNullExpression,
      ): void {
        if (node.expression.type === TSESTree.AST_NODE_TYPES.Identifier) {
          const scope = context.getScope();
          const identifier = node.expression;
          const variable = ASTUtils.findVariable(scope, identifier.name);
          if (variable && !hasAssignmentBeforeNode(variable, node)) {
            return;
          }
        }

        const sourceCode = context.getSourceCode();

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
                const exclamationMark = util.nullThrows(
                  sourceCode.getLastToken(
                    node,
                    ASTUtils.isNonNullAssertionPunctuator,
                  ),
                  util.NullThrowsReasons.MissingToken(
                    '!',
                    'Non-null Assertion',
                  ),
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
