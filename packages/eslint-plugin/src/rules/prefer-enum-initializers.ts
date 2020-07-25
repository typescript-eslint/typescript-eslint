import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'prefer-enum-initializers',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer initializing each enums member value',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      defineInitializer:
        "The value of the member '{{ name }}' should be explicitly defined",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
        const { members } = node;
        const violatingMembers = members.filter(member => {
          return member.initializer == null;
        });

        for (const member of violatingMembers) {
          context.report({
            node: member,
            messageId: 'defineInitializer',
            data: {
              name: sourceCode.getText(member),
            },
          });
        }
      },
    };
  },
});
