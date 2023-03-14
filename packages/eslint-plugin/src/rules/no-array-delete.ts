import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { unionTypeParts } from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

export default util.createRule({
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
    },
    schema: [],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      "UnaryExpression[operator='delete'] > MemberExpression[computed]"(
        node: TSESTree.MemberExpressionComputedName & {
          parent: TSESTree.UnaryExpression;
        },
      ): void {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const target = originalNode.getChildAt(0);
        const key = originalNode.getChildAt(2);

        const targetType = util.getConstrainedTypeAtLocation(checker, target);

        if (!util.isTypeAnyArrayType) {
          return;
        }

        const keyType = util.getConstrainedTypeAtLocation(checker, key);

        if (
          !isTypeArrayTypeOrArrayInUnionOfTypes(targetType, checker) ||
          !isTypeNumberOrNumberLiteralOrNumberLikeType(keyType)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'arrayDelete',
          suggest: [
            {
              messageId: 'arrayDelete',
              fix(fixer): TSESLint.RuleFix {
                return fixer.replaceText(
                  node.parent,
                  `${target.getText()}.splice(${key.getText()}, 1)`,
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

function isTypeNumberOrNumberLiteralOrNumberLikeType(type: ts.Type): boolean {
  return util.isTypeFlagSet(
    type,
    ts.TypeFlags.Number | ts.TypeFlags.NumberLiteral | ts.TypeFlags.NumberLike,
  );
}
