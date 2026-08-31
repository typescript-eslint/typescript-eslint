import type { TSESLint } from '@typescript-eslint/utils';

import { TypeFlags } from '@typescript/native/unstable/sync';

import * as util from '../../util';
import {
  getConstrainedTypeAtLocation,
  isTypeFlagSet,
  unionConstituents,
} from './nativeTypeUtils';

type MessageIds = 'unaryMinus';
type Options = [];

export function create(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): TSESLint.RuleListener {
  return {
    UnaryExpression(node): void {
      if (node.operator !== '-') {
        return;
      }

      const services = util.getNativeParserServices(context);
      const argumentType = getConstrainedTypeAtLocation(
        services,
        node.argument,
      );
      if (
        unionConstituents(argumentType).some(
          type =>
            !isTypeFlagSet(
              type,
              TypeFlags.Any |
                TypeFlags.Never |
                TypeFlags.BigIntLike |
                TypeFlags.NumberLike,
            ),
        )
      ) {
        context.report({
          data: {
            type: services.native.checker.typeToString(argumentType),
          },
          messageId: 'unaryMinus',
          node,
        });
      }
    },
  };
}
