import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isStaticMemberAccessOfValue,
  isTypeAssertion,
} from '../util';

type MemberExpressionWithCallExpressionParent = {
  parent: TSESTree.CallExpression;
} & TSESTree.MemberExpression;

export default createRule({
  name: 'prefer-reduce-type-parameter',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce using type parameter when calling `Array#reduce` instead of using a type assertion',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferTypeParameter:
        'Unnecessary assertion: Array#reduce accepts a type parameter for the default value.',
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
        if (!isStaticMemberAccessOfValue(callee, context, 'reduce')) {
          return;
        }

        const [, secondArg] = callee.parent.arguments;

        if (callee.parent.arguments.length < 2) {
          return;
        }

        if (isTypeAssertion(secondArg)) {
          const initializerType = services.getTypeAtLocation(
            secondArg.expression,
          );

          const assertedType = services.getTypeAtLocation(
            secondArg.typeAnnotation,
          );

          const isAssertionNecessary = !checker.isTypeAssignableTo(
            initializerType,
            assertedType,
          );

          // don't report this if the resulting fix will be a type error
          if (isAssertionNecessary) {
            return;
          }
        } else {
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
