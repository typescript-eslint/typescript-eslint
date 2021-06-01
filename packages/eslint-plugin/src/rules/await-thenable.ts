import * as tsutils from 'tsutils';

import * as util from '../util';

export default util.createRule({
  name: 'await-thenable',
  meta: {
    docs: {
      description: 'Disallows awaiting a value that is not a Thenable',
      category: 'Best Practices',
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
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      AwaitExpression(node): void {
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(originalNode.expression);

        if (
          !util.isTypeAnyType(type) &&
          !util.isTypeUnknownType(type) &&
          !tsutils.isThenableType(checker, originalNode.expression, type)
        ) {
          context.report({
            messageId: 'await',
            node,
          });
        }
      },
    };
  },
});
