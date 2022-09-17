import type { RuleListener } from '@typescript-eslint/utils/src/ts-eslint';
import type * as ts from 'typescript';

import * as util from '../util';

export default util.createRule({
  name: 'require-object-type-annotations',
  meta: {
    docs: {
      description:
        'Require type annotations for objects where there is no contextual type.',
      requiresTypeChecking: true,
      recommended: false,
    },
    messages: {
      forbidden: 'Object is missing type annotation.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create: (context): RuleListener => {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      ObjectExpression: (esNode): void => {
        const tsNode: ts.ObjectLiteralExpression =
          parserServices.esTreeNodeToTSNodeMap.get(esNode);

        const type = checker.getTypeAtLocation(tsNode);

        // Allow empty objects
        if (type.getProperties().length === 0) {
          return;
        }

        const contextualType = checker.getContextualType(tsNode);

        if (
          contextualType === undefined ||
          // Needed to catch object passed as a function argument where the parameter type is generic,
          // e.g. an identity function
          contextualType?.getSymbol()?.name === '__object'
        ) {
          context.report({
            node: esNode,
            messageId: 'forbidden',
          });
        }
      },
    };
  },
});
