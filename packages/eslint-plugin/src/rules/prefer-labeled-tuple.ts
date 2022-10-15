import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

export default util.createRule({
  name: 'prefer-labeled-tuple',
  meta: {
    docs: {
      description: 'Enforce using labeled tuple',
      recommended: false,
      extendsBaseRule: false,
    },
    hasSuggestions: false,
    schema: [],
    messages: {
      missingLabel: 'Tuple members must have labels.',
    },
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      TSTupleType(node): void {
        if (
          node.elementTypes.some(
            elemType => elemType.type !== AST_NODE_TYPES.TSNamedTupleMember,
          )
        ) {
          context.report({
            node,
            messageId: 'missingLabel',
          });
        }
      },
    };
  },
});
