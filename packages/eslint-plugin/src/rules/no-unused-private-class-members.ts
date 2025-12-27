import { ESLintUtils } from '@typescript-eslint/utils';

import { createRule } from '../util';
import { analyzeClassMemberUsage } from '../util/class-scope-analyzer/classScopeAnalyzer';

type Options = [];
export type MessageIds = 'unusedPrivateClassMember';

export default createRule<Options, MessageIds>({
  name: 'no-unused-private-class-members',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused private class members',
      extendsBaseRule: true,
      requiresTypeChecking: false,
    },

    messages: {
      unusedPrivateClassMember:
        "Private class member '{{classMemberName}}' is defined but never used.",
    },

    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'Program:exit'(node) {
        const result = analyzeClassMemberUsage(
          node,
          ESLintUtils.nullThrows(
            context.sourceCode.scopeManager,
            'Missing required scope manager',
          ),
        );

        for (const classScope of result.values()) {
          for (const member of [
            ...classScope.members.instance.values(),
            ...classScope.members.static.values(),
          ]) {
            if (
              (!member.isPrivate() && !member.isHashPrivate()) ||
              member.isUsed()
            ) {
              continue;
            }

            context.report({
              node: member.nameNode,
              messageId: 'unusedPrivateClassMember',
              data: { classMemberName: member.name },
            });
          }
        }
      },
    };
  },
});
