import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

export default util.createRule({
  name: 'no-empty-interface',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the declaration of empty interfaces',
      tslintRuleName: 'no-empty-interface',
      category: 'Best Practices',
      recommended: 'error'
    },
    messages: {
      noEmpty: 'An empty interface is equivalent to `{}`.',
      noEmptyWithSuper:
        'An interface declaring no members is equivalent to its supertype.'
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        if (node.body.body.length !== 0) {
          return;
        }

        if (!node.extends || node.extends.length === 0) {
          context.report({
            node: node.id,
            messageId: 'noEmpty'
          });
        } else if (node.extends.length === 1) {
          context.report({
            node: node.id,
            messageId: 'noEmptyWithSuper'
          });
        }
      }
    };
  }
});
