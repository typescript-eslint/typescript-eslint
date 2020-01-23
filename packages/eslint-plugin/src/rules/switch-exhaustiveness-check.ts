import { TSESTree } from '@typescript-eslint/experimental-utils';
import ts from 'typescript';
import {
  createRule,
  getParserServices,
  getConstrainedTypeAtLocation,
} from '../util';
import { unionTypeParts } from 'tsutils';

export default createRule({
  name: 'switch-exhaustiveness-check',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Exhaustiveness checking in switch with union type',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      switchIsNotExhaustive:
        'Switch is not exhaustive. Cases not matched: {{missingBranches}}',
    },
  },
  defaultOptions: [],
  create(context) {
    const service = getParserServices(context);
    const checker = service.program.getTypeChecker();

    function getNodeType(node: TSESTree.Node): ts.Type {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      return getConstrainedTypeAtLocation(checker, tsNode);
    }

    function checkSwitchExhaustive(node: TSESTree.SwitchStatement): void {
      const discriminantType = getNodeType(node.discriminant);

      if (discriminantType.isUnion()) {
        const unionTypes = unionTypeParts(discriminantType);
        const caseTypes: Set<ts.Type> = new Set();
        for (const switchCase of node.cases) {
          if (switchCase.test === null) {
            // Switch has 'default' branch - do nothing.
            return;
          }

          caseTypes.add(getNodeType(switchCase.test));
        }

        const missingBranchTypes = unionTypes.filter(
          unionType => !caseTypes.has(unionType),
        );

        if (missingBranchTypes.length === 0) {
          // All cases matched - do nothing.
          return;
        }

        context.report({
          node: node.discriminant,
          messageId: 'switchIsNotExhaustive',
          data: {
            missingBranches: missingBranchTypes
              .map(missingType => checker.typeToString(missingType))
              .join(' | '),
          },
        });
      }
    }

    return {
      SwitchStatement: checkSwitchExhaustive,
    };
  },
});
