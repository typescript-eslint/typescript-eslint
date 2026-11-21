import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, nullThrows, NullThrowsReasons } from '../util';

export default createRule({
  name: 'consistent-type-definitions',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce type definitions to consistently use either `interface` or `type`',
      recommended: 'stylistic',
    },
    fixable: 'code',
    messages: {
      interfaceOverType: 'Use an `interface` instead of a `type`.',
      typeOverInterface: 'Use a `type` instead of an `interface`.',
    },
    schema: [
      {
        type: 'string',
        description: 'Which type definition syntax to prefer.',
        enum: ['interface', 'type'],
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: ['interface'],
  create(context, [option]) {
    /**
     * Whether the node is inside a global augmentation (`global {}`),
     * where an interface may merge with an existing global interface
     */
    function isCurrentlyTraversedNodeWithinModuleDeclaration(
      node: TSESTree.Node,
    ): boolean {
      return context.sourceCode
        .getAncestors(node)
        .some(
          node =>
            node.type === AST_NODE_TYPES.TSModuleDeclaration &&
            node.kind === 'global',
        );
    }

    return {
      ...(option === 'interface' && {
        "TSTypeAliasDeclaration[typeAnnotation.type='TSTypeLiteral']"(
          node: TSESTree.TSTypeAliasDeclaration,
        ): void {
          context.report({
            node: node.id,
            messageId: 'interfaceOverType',
            fix(fixer) {
              const typeToken = nullThrows(
                context.sourceCode.getTokenBefore(
                  node.id,
                  token => token.value === 'type',
                ),
                NullThrowsReasons.MissingToken('type keyword', 'type alias'),
              );

              const equalsToken = nullThrows(
                context.sourceCode.getTokenBefore(
                  node.typeAnnotation,
                  token => token.value === '=',
                ),
                NullThrowsReasons.MissingToken('=', 'type alias'),
              );

              const beforeEqualsToken = nullThrows(
                context.sourceCode.getTokenBefore(equalsToken, {
                  includeComments: true,
                }),
                NullThrowsReasons.MissingToken('before =', 'type alias'),
              );

              return [
                // replace 'type' with 'interface'.
                fixer.replaceText(typeToken, 'interface'),

                // delete from the = to the { of the type, and put a space to be pretty.
                fixer.replaceTextRange(
                  [beforeEqualsToken.range[1], node.typeAnnotation.range[0]],
                  ' ',
                ),

                // remove from the closing } through the end of the statement.
                fixer.removeRange([
                  node.typeAnnotation.range[1],
                  node.range[1],
                ]),
              ];
            },
          });
        },
      }),
      ...(option === 'type' && {
        TSInterfaceDeclaration(node): void {
          const fix = isCurrentlyTraversedNodeWithinModuleDeclaration(node)
            ? null
            : (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
                const typeNode = node.typeParameters ?? node.id;
                const fixes: TSESLint.RuleFix[] = [];

                const interfaceToken = nullThrows(
                  context.sourceCode.getTokenBefore(node.id),
                  NullThrowsReasons.MissingToken(
                    'interface keyword',
                    'interface',
                  ),
                );
                fixes.push(
                  fixer.replaceText(interfaceToken, 'type'),
                  fixer.replaceTextRange(
                    [typeNode.range[1], node.body.range[0]],
                    ' = ',
                  ),
                );

                node.extends.forEach(heritage => {
                  const typeIdentifier = context.sourceCode.getText(heritage);
                  fixes.push(
                    fixer.insertTextAfter(node.body, ` & ${typeIdentifier}`),
                  );
                });

                if (
                  node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration
                ) {
                  fixes.push(
                    fixer.removeRange([node.parent.range[0], node.range[0]]),
                    fixer.insertTextAfter(
                      node.body,
                      `\nexport default ${node.id.name}`,
                    ),
                  );
                }

                return fixes;
              };
          context.report({
            node: node.id,
            messageId: 'typeOverInterface',
            /**
             * remove automatically fix when the interface is within a declare global
             * @see {@link https://github.com/typescript-eslint/typescript-eslint/issues/2707}
             */
            fix,
          });
        },
      }),
    };
  },
});
