import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type MemberExpressionWithCallExpressionParent = TSESTree.MemberExpression & {
  parent: TSESTree.CallExpression;
};

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

export default util.createRule({
  name: 'prefer-reduce-type-parameter',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce using type parameter when calling `Array#reduce` instead of casting',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      preferTypeParameter:
        'Unnecessary cast: Array#reduce accepts a type parameter for the default value.',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = util.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      'CallExpression > MemberExpression.callee'(
        callee: MemberExpressionWithCallExpressionParent,
      ): void {
        if (getMemberExpressionName(callee) !== 'reduce') {
          return;
        }

        const [, secondArg] = callee.parent.arguments;

        if (
          callee.parent.arguments.length < 2 ||
          !util.isTypeAssertion(secondArg)
        ) {
          return;
        }

        // Get the symbol of the `reduce` method.
        const calleeObjType = util.getConstrainedTypeAtLocation(
          services,
          callee.object,
        );

        // Check the owner type of the `reduce` method.
        if (checker.isArrayType(calleeObjType)) {
          context.report({
            messageId: 'preferTypeParameter',
            node: secondArg,
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
                    `<${context
                      .getSourceCode()
                      .getText(secondArg.typeAnnotation)}>`,
                  ),
                );
              }

              return fixes;
            },
          });

          return;
        }
      },
    };
  },
});
