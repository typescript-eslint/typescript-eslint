import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../util';

type MessageIds = 'defineInitializer' | 'defineInitializerSuggestion';

export default createRule<[], MessageIds>({
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require each enum member value to be explicitly initialized',
    },
    hasSuggestions: true,
    messages: {
      defineInitializer:
        "The value of the member '{{ name }}' should be explicitly defined.",
      defineInitializerSuggestion:
        'Can be fixed to {{ name }} = {{ suggested }}',
    },
    schema: [],
  },
  name: 'prefer-enum-initializers',
  create(context) {
    function TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
      const { members } = node.body;

      members.forEach((member, index) => {
        if (member.initializer == null) {
          const name = context.sourceCode.getText(member);
          context.report({
            data: {
              name,
            },
            messageId: 'defineInitializer',
            node: member,
            suggest: [
              {
                data: { name, suggested: index },
                fix: (fixer): TSESLint.RuleFix => {
                  return fixer.replaceText(member, `${name} = ${index}`);
                },
                messageId: 'defineInitializerSuggestion',
              },
              {
                data: { name, suggested: index + 1 },
                fix: (fixer): TSESLint.RuleFix => {
                  return fixer.replaceText(member, `${name} = ${index + 1}`);
                },
                messageId: 'defineInitializerSuggestion',
              },
              {
                data: { name, suggested: `'${name}'` },
                fix: (fixer): TSESLint.RuleFix => {
                  return fixer.replaceText(member, `${name} = '${name}'`);
                },
                messageId: 'defineInitializerSuggestion',
              },
            ],
          });
        }
      });
    }

    return {
      TSEnumDeclaration,
    };
  },
});
