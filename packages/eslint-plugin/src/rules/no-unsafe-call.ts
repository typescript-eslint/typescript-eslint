import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds = 'unsafeCall' | 'unsafeNew';

export default util.createRule<[], MessageIds>({
  name: 'no-unsafe-call',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows calling an any type value',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      unsafeCall: 'Unsafe call of an any typed value',
      unsafeNew: 'Unsafe construction of an any type value',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();

    function checkCall(
      node:
        | TSESTree.CallExpression
        | TSESTree.OptionalCallExpression
        | TSESTree.NewExpression,
      reportingNode: TSESTree.Expression = node.callee,
      messageId: MessageIds = 'unsafeCall',
    ): void {
      const tsNode = esTreeNodeToTSNodeMap.get(node.callee);
      const type = checker.getTypeAtLocation(tsNode);
      if (util.isTypeAnyType(type)) {
        context.report({
          node: reportingNode,
          messageId: messageId,
        });
      }
    }

    return {
      'CallExpression, OptionalCallExpression': checkCall,
      NewExpression(node): void {
        checkCall(node, node, 'unsafeNew');
      },
    };
  },
});
