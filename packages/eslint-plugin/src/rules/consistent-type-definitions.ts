import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

export default util.createRule({
  name: 'consistent-type-definitions',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce type definitions to consistently use either `interface` or `type`',
      recommended: 'stylistic',
    },
    messages: {
      interfaceOverType: 'Use an `interface` instead of a `type`.',
      typeOverInterface: 'Use a `type` instead of an `interface`.',
    },
    schema: [
      {
        enum: ['interface', 'type'],
      },
    ],
    fixable: 'code',
  },
  defaultOptions: ['interface'],
  create(context, [option]) {
    const sourceCode = context.getSourceCode();

    /**
     * Iterates from the highest parent to the currently traversed node
     * to determine whether any node in tree is globally declared module declaration
     */
    function isCurrentlyTraversedNodeWithinModuleDeclaration(): boolean {
      return context
        .getAncestors()
        .some(
          node =>
            node.type === AST_NODE_TYPES.TSModuleDeclaration &&
            node.declare &&
            node.global,
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
              const typeNode = node.typeParameters ?? node.id;
              const fixes: TSESLint.RuleFix[] = [];

              const firstToken = sourceCode.getTokenBefore(node.id);
              if (firstToken) {
                fixes.push(fixer.replaceText(firstToken, 'interface'));
                fixes.push(
                  fixer.replaceTextRange(
                    [typeNode.range[1], node.typeAnnotation.range[0]],
                    ' ',
                  ),
                );
              }

              const afterToken = sourceCode.getTokenAfter(node.typeAnnotation);
              if (
                afterToken &&
                afterToken.type === AST_TOKEN_TYPES.Punctuator &&
                afterToken.value === ';'
              ) {
                fixes.push(fixer.remove(afterToken));
              }

              return fixes;
            },
          });
        },
      }),
      ...(option === 'type' && {
        TSInterfaceDeclaration(node): void {
          const fix = isCurrentlyTraversedNodeWithinModuleDeclaration()
            ? null
            : (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
                const typeNode = node.typeParameters ?? node.id;
                const fixes: TSESLint.RuleFix[] = [];

                const firstToken = sourceCode.getTokenBefore(node.id);
                if (firstToken) {
                  fixes.push(fixer.replaceText(firstToken, 'type'));
                  fixes.push(
                    fixer.replaceTextRange(
                      [typeNode.range[1], node.body.range[0]],
                      ' = ',
                    ),
                  );
                }

                if (node.extends) {
                  node.extends.forEach(heritage => {
                    const typeIdentifier = sourceCode.getText(heritage);
                    fixes.push(
                      fixer.insertTextAfter(node.body, ` & ${typeIdentifier}`),
                    );
                  });
                }

                if (
                  node.parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration
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
