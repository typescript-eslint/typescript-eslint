import { createRule } from '../util';
import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { TSEnumMember } from '../../../typescript-estree/dist/ts-estree/ts-estree';

export enum MessageId {
  NoVariable = 'noVariable',
}

type Options = [];

export default createRule<Options, MessageId>({
  name: 'no-identifier-enum-member',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow identifier (aka variable) enum members',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: false,
    },
    messages: {
      [MessageId.NoVariable]: `Enum member can not be an ${AST_NODE_TYPES.Identifier}.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSEnumMember(node: TSEnumMember): void {
        // If there is no initializer, then this node is just the name of the member, so ignore.
        if (
          node.initializer != null &&
          node.initializer.type === AST_NODE_TYPES.Identifier
        ) {
          context.report({
            node: node.id,
            messageId: MessageId.NoVariable,
            data: {
              type: node.initializer.type,
            },
          });
        }
      },
    };
  },
});
