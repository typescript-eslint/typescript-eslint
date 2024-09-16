import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isReferenceToGlobalFunction } from '../util';

export default createRule({
  create(context) {
    function checkBannedTypes(node: TSESTree.Node): void {
      if (
        node.type === AST_NODE_TYPES.Identifier &&
        node.name === 'Function' &&
        isReferenceToGlobalFunction('Function', node, context.sourceCode)
      ) {
        context.report({
          messageId: 'bannedFunctionType',
          node,
        });
      }
    }

    return {
      TSClassImplements(node): void {
        checkBannedTypes(node.expression);
      },
      TSInterfaceHeritage(node): void {
        checkBannedTypes(node.expression);
      },
      TSTypeReference(node): void {
        checkBannedTypes(node.typeName);
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Disallow using the unsafe built-in Function type',
      recommended: 'recommended',
    },
    fixable: 'code',
    messages: {
      bannedFunctionType: [
        'The `Function` type accepts any function-like value.',
        'Prefer explicitly defining any function parameters and return type.',
      ].join('\n'),
    },
    schema: [],
    type: 'problem',
  },
  name: 'no-unsafe-function-type',
});
