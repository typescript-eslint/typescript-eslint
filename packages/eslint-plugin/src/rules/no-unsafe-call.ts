import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds = 'unsafeCall' | 'unsafeNew' | 'unsafeTemplateTag';

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
      unsafeTemplateTag: 'Unsafe any typed template tag',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();

    function checkCall(
      node: TSESTree.Node,
      reportingNode: TSESTree.Node,
      messageId: MessageIds,
    ): void {
      const tsNode = esTreeNodeToTSNodeMap.get(node);
      const type = checker.getTypeAtLocation(tsNode);
      if (util.isTypeAnyType(type)) {
        context.report({
          node: reportingNode,
          messageId: messageId,
        });
      }
    }

    return {
      ':matches(CallExpression, OptionalCallExpression) > :not(Import).callee'(
        node: Exclude<TSESTree.LeftHandSideExpression, TSESTree.Import>,
      ): void {
        checkCall(node, node, 'unsafeCall');
      },
      NewExpression(node): void {
        checkCall(node.callee, node, 'unsafeNew');
      },
      'TaggedTemplateExpression > *.tag'(node: TSESTree.Node): void {
        checkCall(node, node, 'unsafeTemplateTag');
      },
    };
  },
});
