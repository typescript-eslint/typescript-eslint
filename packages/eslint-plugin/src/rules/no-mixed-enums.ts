import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

export default util.createRule({
  name: 'no-mixed-enums',
  meta: {
    docs: {
      description: 'Disallow enums from having both number and string members',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      mixed: `Mixing number and string enums can be confusing.`,
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    function getMemberType(
      initializer: TSESTree.Expression | undefined,
    ): ts.TypeFlags.Number | ts.TypeFlags.String {
      if (!initializer) {
        return ts.TypeFlags.Number;
      }

      return tsutils.isTypeFlagSet(
        typeChecker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(initializer),
        ),
        ts.TypeFlags.StringLike,
      )
        ? ts.TypeFlags.String
        : ts.TypeFlags.Number;
    }

    return {
      'TSEnumDeclaration[members.1]'(node: TSESTree.TSEnumDeclaration): void {
        const [firstMember, ...remainingMembers] = node.members;
        const allowedMemberType = getMemberType(firstMember.initializer);

        for (const member of remainingMembers) {
          if (getMemberType(member.initializer) !== allowedMemberType) {
            context.report({
              messageId: 'mixed',
              node: member.initializer!,
            });
            return;
          }
        }
      },
    };
  },
});
