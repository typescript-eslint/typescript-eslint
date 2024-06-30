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
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      unaryMinus:
        'Argument of unary negation should be assignable to number | bigint but is {{type}} instead.',
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
        const argType = util.getConstrainedTypeAtLocation(
          services,
          node.argument,
        );
        const checker = services.program.getTypeChecker();
        if (
          tsutils
            .unionTypeParts(argType)
            .some(
              type =>
                !tsutils.isTypeFlagSet(
                  type,
                  ts.TypeFlags.Any |
                    ts.TypeFlags.Never |
                    ts.TypeFlags.BigIntLike |
                    ts.TypeFlags.NumberLike,
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
