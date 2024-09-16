import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [];
type MessageIds = 'unaryMinus';

export default util.createRule<Options, MessageIds>({
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
            data: { type: checker.typeToString(argType) },
            messageId: 'unaryMinus',
            node,
          });
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
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
    type: 'problem',
  },
  name: 'no-unsafe-unary-minus',
});
