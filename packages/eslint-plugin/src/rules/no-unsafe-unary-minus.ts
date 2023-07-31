import type * as ts from 'typescript';

import * as util from '../util';

interface TypeChecker extends ts.TypeChecker {
  // https://github.com/microsoft/TypeScript/issues/9879
  isTypeAssignableTo(source: ts.Type, target: ts.Type): boolean;
  getUnionType(types: ts.Type[]): ts.Type;
}

type Options = [];
type MessageIds = 'unaryMinus';

export default util.createRule<Options, MessageIds>({
  name: 'no-unsafe-unary-minus',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require unary negation to take a number',
      requiresTypeChecking: true,
    },
    messages: {
      unaryMinus: 'Invalid type "{{type}}" of template literal expression.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      UnaryExpression(node): void {
        if (node.operator !== '-') {
          return;
        }
        const services = util.getParserServices(context);
        const argType = services.getTypeAtLocation(node.argument);
        const checker = services.program.getTypeChecker() as TypeChecker;
        if (
          !checker.isTypeAssignableTo(
            argType,
            checker.getUnionType([
              checker.getNumberType(), // first exposed in TypeScript v5.1
              checker.getBigIntType(), // first added in TypeScript v5.1
            ]),
          )
        ) {
          context.report({
            messageId: 'unaryMinus',
            node,
            data: { type: checker.typeToString(argType) },
          });
        }
      },
    };
  },
});
