import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeAssertion,
} from '../util';

type MemberExpressionWithCallExpressionParent = {
  parent: TSESTree.CallExpression;
} & TSESTree.MemberExpression;

const getMemberExpressionName = (
  member: TSESTree.MemberExpression,
): string | null => {
  if (!member.computed) {
    return member.property.name;
  }

  if (
    member.property.type === AST_NODE_TYPES.Literal &&
    typeof member.property.value === 'string'
  ) {
    return member.property.value;
  }

  return null;
};

export default createRule({
  name: 'prefer-reduce-type-parameter',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce using type parameter when calling `Array#reduce` instead of casting',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferTypeParameter:
        'Unnecessary cast: Array#reduce accepts a type parameter for the default value.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isArrayType(type: ts.Type): boolean {
      return tsutils
        .unionTypeParts(type)
        .every(unionPart =>
          tsutils
            .intersectionTypeParts(unionPart)
            .every(t => checker.isArrayType(t) || checker.isTupleType(t)),
        );
    }

    return {
      'CallExpression > MemberExpression.callee'(
        callee: MemberExpressionWithCallExpressionParent,
      ): void {
        if (getMemberExpressionName(callee) !== 'reduce') {
          return;
        }

        const [, secondArg] = callee.parent.arguments;

        if (callee.parent.arguments.length < 2 || !isTypeAssertion(secondArg)) {
          return;
        }

        // Get the symbol of the `reduce` method.
        const calleeObjType = getConstrainedTypeAtLocation(
          services,
          callee.object,
        );

        // Check the owner type of the `reduce` method.
        if (isArrayType(calleeObjType)) {
          context.report({
            fix: fixer => {
              const fixes = [
                fixer.removeRange([
                  secondArg.range[0],
                  secondArg.expression.range[0],
                ]),
                fixer.removeRange([
                  secondArg.expression.range[1],
                  secondArg.range[1],
                ]),
              ];

              if (!callee.parent.typeArguments) {
                fixes.push(
                  fixer.insertTextAfter(
                    callee,
                    `<${context.sourceCode.getText(secondArg.typeAnnotation)}>`,
                  ),
                );
              }

              return fixes;
            },
            messageId: 'preferTypeParameter',
            node: secondArg,
          });

          return;
        }
      },
    };
  },
});
