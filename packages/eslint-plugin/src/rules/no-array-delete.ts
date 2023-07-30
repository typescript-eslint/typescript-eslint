import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { unionTypeParts } from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type MessageIds = 'arrayDelete' | 'suggestFunctionalDelete';

export default util.createRule<[], MessageIds>({
  name: 'no-array-delete',
  meta: {
    hasSuggestions: true,
    docs: {
      description: 'Disallow delete operator for arrays',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      arrayDelete: 'Using the delete operator on an array is dangerous.',
      suggestFunctionalDelete:
        'Using Array.slice instead of delete keyword prevents empty array element.',
    },
    schema: [],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      "UnaryExpression[operator='delete'] > MemberExpression[computed]"(
        node: TSESTree.MemberExpressionComputedName & {
          parent: TSESTree.UnaryExpression;
        },
      ): void {
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const target = originalNode.getChildAt(0);
        const key = originalNode.getChildAt(2);

        const targetType = util.getConstrainedTypeAtLocation(checker, target);

        if (!isTypeArrayTypeOrArrayInUnionOfTypes(targetType, checker)) {
          return;
        }

        const keyType = util.getConstrainedTypeAtLocation(checker, key);

        if (!util.isTypeFlagSet(keyType, ts.TypeFlags.NumberLike)) {
          return;
        }

        context.report({
          node,
          messageId: 'arrayDelete',
          suggest: [
            {
              messageId: 'suggestFunctionalDelete',
              fix(fixer): TSESLint.RuleFix | null {
                const requiresParens =
                  node.property.type === AST_NODE_TYPES.SequenceExpression;
                const keyText = key.getText();

                if (util.isTypeFlagSet(keyType, ts.TypeFlags.String)) {
                  return null;
                }

                return fixer.replaceText(
                  node.parent,
                  `${target.getText()}.splice(${
                    requiresParens ? `(${keyText})` : keyText
                  }, 1)`,
                );
              },
            },
          ],
        });
      },
    };
  },
});

function isTypeArrayTypeOrArrayInUnionOfTypes(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  return unionTypeParts(type).some(checker.isArrayType);
}
