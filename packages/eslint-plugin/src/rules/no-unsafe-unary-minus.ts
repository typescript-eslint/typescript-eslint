import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';

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
        const checker = services.program.getTypeChecker();
        if (
          tsutils
            .unionTypeParts(argType)
            .some(
              type =>
                !tsutils.isTypeFlagSet(
                  type,
                  ts.TypeFlags.BigIntLike | ts.TypeFlags.NumberLike,
                ),
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
