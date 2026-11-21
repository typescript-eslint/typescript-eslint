import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, getStaticStringValue } from '../util';

export type MessageIds = 'defineInitializer' | 'defineInitializerSuggestion';

export default createRule<[], MessageIds>({
  name: 'prefer-enum-initializers',
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
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    function TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
      const { members } = node.body;

      members.forEach((member, index) => {
        if (member.initializer == null) {
          const memberText = context.sourceCode.getText(member);
          const name =
            member.id.type === AST_NODE_TYPES.Identifier
              ? member.id.name
              : (getStaticStringValue(member.id) ?? memberText);
          const idText = context.sourceCode.getText(member.id);
          const stringValue =
            member.id.type === AST_NODE_TYPES.Identifier ? `'${name}'` : idText;
          context.report({
            node: member,
            messageId: 'defineInitializer',
            data: {
              name,
            },
            suggest: [
              {
                messageId: 'defineInitializerSuggestion',
                data: { name: memberText, suggested: index },
                fix: (fixer): TSESLint.RuleFix =>
                  fixer.insertTextAfter(member, ` = ${index}`),
              },
              {
                messageId: 'defineInitializerSuggestion',
                data: { name: memberText, suggested: index + 1 },
                fix: (fixer): TSESLint.RuleFix =>
                  fixer.insertTextAfter(member, ` = ${index + 1}`),
              },
              {
                messageId: 'defineInitializerSuggestion',
                data: { name: memberText, suggested: stringValue },
                fix: (fixer): TSESLint.RuleFix =>
                  fixer.insertTextAfter(member, ` = ${stringValue}`),
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
