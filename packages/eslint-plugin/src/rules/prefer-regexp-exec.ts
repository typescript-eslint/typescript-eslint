import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule, getParserServices, getTypeName } from '../util';
import { getStaticValue } from 'eslint-utils';

export default createRule({
  name: 'prefer-regexp-exec',
  defaultOptions: [],

  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer RegExp#exec() over String#match() if no global flag is provided',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      regExpExecOverStringMatch: 'Use the `RegExp#exec()` method instead.',
    },
    schema: [],
  },

  create(context) {
    const globalScope = context.getScope();
    const service = getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    /**
     * Check if a given node is a string.
     * @param node The node to check.
     */
    function isStringType(node: TSESTree.Node): boolean {
      const objectType = typeChecker.getTypeAtLocation(
        service.esTreeNodeToTSNodeMap.get(node),
      );
      return getTypeName(typeChecker, objectType) === 'string';
    }

    return {
      "CallExpression[arguments.length=1] > MemberExpression.callee[property.name='match'][computed=false]"(
        node: TSESTree.MemberExpression,
      ) {
        const callNode = node.parent as TSESTree.CallExpression;
        const arg = callNode.arguments[0];
        const evaluated = getStaticValue(arg, globalScope);

        // Don't report regular expressions with global flag.
        if (
          evaluated &&
          evaluated.value instanceof RegExp &&
          evaluated.value.flags.includes('g')
        ) {
          return;
        }

        if (isStringType(node.object)) {
          context.report({
            node: callNode,
            messageId: 'regExpExecOverStringMatch',
          });
          return;
        }
      },
    };
  },
});
