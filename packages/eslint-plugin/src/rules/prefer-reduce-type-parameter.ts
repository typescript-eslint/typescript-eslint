import type { TSESTree } from '@typescript-eslint/utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isStaticMemberAccessOfValue,
  isTypeAssertion,
} from '../util';
import { isArrayType } from '../util/isArrayType';

type MemberExpressionWithCallExpressionParent = {
  parent: TSESTree.CallExpression;
} & TSESTree.MemberExpression;

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

    return {
      'CallExpression > MemberExpression.callee'(
        callee: MemberExpressionWithCallExpressionParent,
      ): void {
        if (!isStaticMemberAccessOfValue(callee, context, 'reduce')) {
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
        if (isArrayType(checker, calleeObjType)) {
          context.report({
            node: secondArg,
            messageId: 'preferTypeParameter',
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
          });

          return;
        }
      },
    };
  },
});
