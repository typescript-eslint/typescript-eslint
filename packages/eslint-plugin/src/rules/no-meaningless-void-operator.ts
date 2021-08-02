import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as util from '../util';
import * as ts from 'typescript';

export default util.createRule<[], 'meaninglessVoidOperator'>({
  name: 'no-meaningless-void-operator',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow the `void` operator except when used to discard a value',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      meaninglessVoidOperator: "void operator shouldn't be used on {{type}}; it should convey that a return value is being ignored",
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _options) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    return {
      'UnaryExpression[operator="void"]'(
        node: TSESTree.UnaryExpression,
      ): void {
        const argTsNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.argument,
        );
        const argType = checker.getTypeAtLocation(argTsNode);
        if (
          tsutils
            .unionTypeParts(argType)
            .every(
              part =>
                part.flags &
                (ts.TypeFlags.Void |
                  ts.TypeFlags.Undefined |
                  ts.TypeFlags.Never),
            )
        ) {
          context.report({
            node,
            messageId: 'meaninglessVoidOperator',
            data: { type: checker.typeToString(argType) },
            fix(fixer) {
              return fixer.removeRange([
                sourceCode.getTokens(node)[0].range[0],
                sourceCode.getTokens(node)[1].range[0],
              ]);
            },
          });
        }
      },
    };
  },
});
