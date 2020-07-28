import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import { TSESLint } from '@typescript-eslint/experimental-utils';

type MessageIds = 'defineInitializer' | 'defineInitializerSuggestion';

export default util.createRule<[], MessageIds>({
  name: 'prefer-enum-initializers',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer initializing each enums member value',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
    messages: {
      defineInitializer:
        "The value of the member '{{ name }}' should be explicitly defined",
      defineInitializerSuggestion:
        'Can be fixed to {{ name }} = {{ suggested }}',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    function TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
      const { members } = node;

      members.forEach((member, index) => {
        if (member.initializer == null) {
          const name = sourceCode.getText(member);
          context.report({
            node: member,
            messageId: 'defineInitializer',
            data: {
              name,
            },
            suggest: [
              {
                messageId: 'defineInitializerSuggestion',
                data: { name, suggested: index },
                fix: (fixer): TSESLint.RuleFix => {
                  return fixer.replaceText(member, `${name} = ${index}`);
                },
              },
              {
                messageId: 'defineInitializerSuggestion',
                data: { name, suggested: index + 1 },
                fix: (fixer): TSESLint.RuleFix => {
                  return fixer.replaceText(member, `${name} = ${index + 1}`);
                },
              },
              {
                messageId: 'defineInitializerSuggestion',
                data: { name, suggested: `'${name}'` },
                fix: (fixer): TSESLint.RuleFix => {
                  return fixer.replaceText(member, `${name} = '${name}'`);
                },
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
