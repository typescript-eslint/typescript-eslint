import { TSESTree } from '@typescript-eslint/experimental-utils';
import ts from 'typescript';
import * as util from '../util';

type MessageIds = 'unsafeArrayReduce';

export default util.createRule<[], MessageIds>({
  name: 'no-unsafe-array-reduce',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows inferring wide type on array reduce',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      unsafeArrayReduce:
        'This reduce call does not have sufficient type information to be safe.',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      CallExpression(node: TSESTree.CallExpression): void {
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        // foo.reduce<T>(...)
        //  ^    ^    ^
        //  |    \     - node.typeArguments
        //  \     - node.expression.name
        //   - node.expression.expression
        if (ts.isPropertyAccessExpression(originalNode.expression)) {
          const isArray = checker.isArrayType(
            checker.getTypeAtLocation(originalNode.expression.expression),
          );

          if (isArray && originalNode.expression.name.text === 'reduce') {
            const funcArgument: ts.Expression | undefined =
              originalNode.arguments[0];
            const initArgument: ts.Expression | undefined =
              originalNode.arguments[1];

            if (
              // Init argument is an empty object literal (with no type assertion,
              // in case you're a bad developer and have disabled no literal type
              // assertions)
              initArgument &&
              ts.isObjectLiteralExpression(initArgument) &&
              !initArgument.properties.length &&
              !ts.isAsExpression(initArgument) &&
              // There's no type argument reduce
              !originalNode.typeArguments &&
              // There's no accumulator type declaration
              ts.isArrowFunction(funcArgument) &&
              funcArgument.parameters[0] &&
              !funcArgument.parameters[0].type
            ) {
              context.report({
                node,
                messageId: 'unsafeArrayReduce',
              });
            }
          }
        }
      },
    };
  },
});
