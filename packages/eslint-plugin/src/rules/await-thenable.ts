import * as tsutils from 'tsutils';

import * as util from '../util';

export default util.createRule({
  name: 'await-thenable',
  meta: {
    docs: {
      description: 'Disallow awaiting a value that is not a Thenable',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      await: 'Unexpected `await` of a non-Promise (non-"Thenable") value.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],

  create(context) {
    const services = util.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      AwaitExpression(node): void {
        const type = services.getTypeAtLocation(node.argument);
        if (util.isTypeAnyType(type) || util.isTypeUnknownType(type)) {
          return;
        }

        const originalNode = services.esTreeNodeToTSNodeMap.get(node);

        if (!tsutils.isThenableType(checker, originalNode.expression, type)) {
          context.report({
            messageId: 'await',
            node,
          });
        }
      },
    };
  },
});
