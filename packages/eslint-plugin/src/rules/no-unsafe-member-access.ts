import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

const enum State {
  Unsafe = 1,
  Safe = 2,
}

export default util.createRule({
  name: 'no-unsafe-member-access',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows member access on any typed variables',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      unsafeMemberExpression:
        'Unsafe member access {{property}} on an any value',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } = util.getParserServices(context);
    const checker = program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    const stateCache = new Map<TSESTree.Node, State>();

    function checkMemberExpression(
      node: TSESTree.MemberExpression | TSESTree.OptionalMemberExpression,
    ): State {
      const cachedState = stateCache.get(node);
      if (cachedState) {
        return cachedState;
      }

      if (util.isMemberOrOptionalMemberExpression(node.object)) {
        const objectState = checkMemberExpression(node.object);
        if (objectState === State.Unsafe) {
          // if the object is unsafe, we know this will be unsafe as well
          // we don't need to report, as we have already reported on the inner member expr
          stateCache.set(node, objectState);
          return objectState;
        }
      }

      const tsNode = esTreeNodeToTSNodeMap.get(node.object);
      const type = checker.getTypeAtLocation(tsNode);
      const state = util.isTypeAnyType(type) ? State.Unsafe : State.Safe;
      stateCache.set(node, state);

      if (state === State.Unsafe) {
        const propertyName = sourceCode.getText(node.property);
        context.report({
          node,
          messageId: 'unsafeMemberExpression',
          data: {
            property: node.computed ? `[${propertyName}]` : `.${propertyName}`,
          },
        });
      }

      return state;
    }

    return {
      'MemberExpression, OptionalMemberExpression': checkMemberExpression,
    };
  },
});
