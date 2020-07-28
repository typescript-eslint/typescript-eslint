import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import { RuleFix } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

type Option = '0-based' | '1-based' | 'key-name';
type MessageIds = 'defineInitializer' | 'defineInitializerSuggestion';

export default util.createRule<Option[], MessageIds>({
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
        'can be suggestion fixed to {{ name }} = {{ suggestedValue }}',
    },
    schema: [
      {
        enum: ['0-based', '1-based', 'key-name'],
      },
    ],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    const config = context.options[0];

    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
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
                  data: { name },
                  fix: (fixer): RuleFix | null => {
                    if (config === '0-based') {
                      return fixer.replaceText(member, `${name} = ${index}`);
                    } else if (config === '1-based') {
                      return fixer.replaceText(
                        member,
                        `${name} = ${index + 1}`,
                      );
                    } else if (config === 'key-name') {
                      return fixer.replaceText(member, `${name} = '${name}'`);
                    } else {
                      return null;
                    }
                  },
                },
              ],
            });
          }
        });
      },
    };
  },
});
