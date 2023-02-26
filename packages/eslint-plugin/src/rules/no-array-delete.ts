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
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      arrayDeleteViolation:
        'Using the delete operator on an array is dangerous.',
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

        const target = originalNode.getChildAt(0),
          key = originalNode.getChildAt(2);

        const targetType = util.getConstrainedTypeAtLocation(checker, target),
          keyType = util.getConstrainedTypeAtLocation(checker, key);

        if (
          !isTypeArrayTypeOrArrayInUnionOfTypes(targetType, checker) ||
          !isTypeNumberOrNumberLiteralOrNumberLikeType(keyType)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'arrayDeleteViolation',
          suggest: [
            {
              messageId: 'arrayDeleteViolation',
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
  for (const t of unionTypeParts(type)) {
    if (checker.isArrayType(t)) {
      return true;
    }
  }

  return false;
}

function isTypeNumberOrNumberLiteralOrNumberLikeType(type: ts.Type): boolean {
  return (
    (type.flags &
      (ts.TypeFlags.Number |
        ts.TypeFlags.NumberLiteral |
        ts.TypeFlags.NumberLike)) !==
    0
  );
}
