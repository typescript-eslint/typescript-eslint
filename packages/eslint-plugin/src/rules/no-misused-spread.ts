import {
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

import { createRule } from '../util';

type MessageIds = 'forbidden';

export default createRule<[], MessageIds>({
  defaultOptions: [],
  name: 'no-misused-spread',
  meta: {
    docs: {
      description: 'Disallow spread operator on function',
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    messages: {
      forbidden:
        'Spreading a function is almost always a mistake. Did you forget to call the function?',
    },
    schema: [],
    type: 'suggestion',
  },
  create: (context): TSESLint.RuleListener => {
    const listener = (node: TSESTree.SpreadElement): void => {
      const services = getParserServices(context);
      const checker = services.program.getTypeChecker();

      const tsNode = svc.esTreeNodeToTSNodeMap.get(node.argument);
      const type = tc.getTypeAtLocation(tsNode);

      if (
        type.getProperties().length === 0 &&
        type.getCallSignatures().length > 0
      ) {
        context.report({
          node,
          messageId: 'forbidden',
        });
      }
    };
    return {
      SpreadElement: listener,
    };
  },
});
