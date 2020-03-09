import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

const getMemberExpressionName = (
  member: TSESTree.MemberExpression | TSESTree.OptionalMemberExpression,
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
      category: 'Best Practices',
      recommended: false,
      description:
        'Prefer using type parameter when calling `Array#reduce` instead of casting',
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
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();

    const reportPossibleArrayReduceCasting = (
      node: TSESTree.CallExpression | TSESTree.OptionalCallExpression,
    ): void => {
      {
        if (
          !util.isMemberOrOptionalMemberExpression(node.callee) ||
          getMemberExpressionName(node.callee) !== 'reduce'
        ) {
          return;
        }

        const [, secondArg] = node.arguments;

        if (node.arguments.length < 2 || !util.isTypeAssertion(secondArg)) {
          return;
        }

        // Get the symbol of the `reduce` method.
        const tsNode = service.esTreeNodeToTSNodeMap.get(node.callee.object);
        const calleeObjType = checker.getTypeAtLocation(tsNode);

        // Check the owner type of the `reduce` method.
        if (checker.isArrayType(calleeObjType)) {
          context.report({
            messageId: 'preferTypeParameter',
            node: secondArg,
            fix: fixer => [
              fixer.removeRange([
                secondArg.range[0],
                secondArg.expression.range[0],
              ]),
              fixer.removeRange([
                secondArg.expression.range[1],
                secondArg.range[1],
              ]),
              fixer.insertTextAfter(
                node.callee,
                `<${context
                  .getSourceCode()
                  .getText(secondArg.typeAnnotation)}>`,
              ),
            ],
          });

          return;
        }
      }
    };

    return {
      OptionalCallExpression: reportPossibleArrayReduceCasting,
      CallExpression: reportPossibleArrayReduceCasting,
    };
  },
});
