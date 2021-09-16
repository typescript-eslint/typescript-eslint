import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds =
  | 'nonConsistentEnum'
  | 'nonConsistentEnumSuggestion'
  | 'nonConsistentEnumSuggestionNoInitializer';
const NO_INITIALIZER = 'noInitializer';

export default util.createRule<[], MessageIds>({
  name: 'prefer-consistent-enums',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer consistent enum members',
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: false,
    },
    messages: {
      nonConsistentEnum: `All enum members of {{ name }} must be same type (string, number, boolean, etc).`,
      nonConsistentEnumSuggestion: `Can be fixed to {{ name }} = {{ suggested }}`,
      nonConsistentEnumSuggestionNoInitializer: `Can be fixed to {{ name }}`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    function TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
      const enumName = sourceCode.getText(node.id);
      const { members } = node;

      let enumType: string;
      let lastNumericValue: number;

      members.forEach((member, index) => {
        let memberType: string | undefined;
        let memberValue: TSESTree.Literal['value'] | undefined;

        /**
         * Getting enum member initializer type
         * If it's number — get its value to suggest new one
         * If it's binary expression — treat it like number but without getting its value
         */
        if (member.initializer) {
          switch (member.initializer.type) {
            case TSESTree.AST_NODE_TYPES.Literal:
              memberValue = member.initializer.value;
              memberType = typeof member.initializer.value;
              if (memberType === 'number') {
                lastNumericValue = member.initializer.value as number;
              }
              break;
            case TSESTree.AST_NODE_TYPES.BinaryExpression:
              memberType = 'number';
              break;
          }
        } else {
          memberType = NO_INITIALIZER;
        }

        if (!memberType) {
          return;
        }

        /**
         * If it's first enum member — remember its type and continue to next one
         */
        if (!enumType) {
          enumType = memberType;
          return;
        }

        /**
         * If initializers types dont match — suggest change
         */
        if (enumType !== memberType) {
          const name = sourceCode.getText(member.id);

          /**
           * If base enum type is string — transforming initializer to string
           * or create new one base on enum member name
           */
          if (enumType === 'string') {
            context.report({
              node: member,
              messageId: 'nonConsistentEnum',
              data: { name: enumName },
              suggest: [
                {
                  messageId: 'nonConsistentEnumSuggestion',
                  data: { name, suggested: `'${memberValue ?? name}'` },
                  fix: (fixer): TSESLint.RuleFix =>
                    fixer.replaceText(
                      member,
                      `${name} = '${memberValue ?? name}'`,
                    ),
                },
              ],
            });
            return;
          }

          /**
           * If base enum type is number — suggest replacing initializer
           * with last numeric identifier + 1 or just enum member index
           */
          if (enumType === 'number') {
            const newIndex =
              typeof lastNumericValue !== 'undefined'
                ? lastNumericValue + 1
                : index + 1;
            context.report({
              node: member,
              messageId: 'nonConsistentEnum',
              data: { name: enumName },
              suggest: [
                {
                  messageId: 'nonConsistentEnumSuggestion',
                  data: { name, suggested: newIndex },
                  fix: (fixer): TSESLint.RuleFix =>
                    fixer.replaceText(member, `${name} = ${newIndex}`),
                },
              ],
            });
            return;
          }

          /**
           * If enum have no initializers — suggest removing one
           */
          if (enumType === NO_INITIALIZER) {
            context.report({
              node: member,
              messageId: 'nonConsistentEnum',
              data: { name: enumName },
              suggest: [
                {
                  messageId: 'nonConsistentEnumSuggestionNoInitializer',
                  data: { name },
                  fix: (fixer): TSESLint.RuleFix =>
                    fixer.replaceText(member, `${name}`),
                },
              ],
            });
          }

          /**
           * No suggestions for other enum types
           */
        }
      });
    }

    return {
      TSEnumDeclaration,
    };
  },
});
