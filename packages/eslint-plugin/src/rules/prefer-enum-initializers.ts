import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import {
  RuleFix,
  ReportFixFunction,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { TSEnumMember } from '../../../parser/node_modules/@typescript-eslint/types/dist/ts-estree';

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
                data: { name },
                fix: fixer => {
                  switch (config) {
                    case '0-based':
                      return fixer.replaceText(member, `${name} = ${index}`);
                    case '1-based':
                      return fixer.replaceText(
                        member,
                        `${name} = ${index + 1}`,
                      );
                    case 'key-name':
                      return fixer.replaceText(member, `${name} = '${name}'`);
                    default:
                      const _exhaustiveCheck: never = config;
                      return _exhaustiveCheck;
                  }
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
