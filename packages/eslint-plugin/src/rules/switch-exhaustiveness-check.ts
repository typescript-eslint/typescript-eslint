import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import {
  createRule,
  getParserServices,
  getConstrainedTypeAtLocation,
} from '../util';
import { isTypeFlagSet, unionTypeParts } from 'tsutils';

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
      addMissingCases: 'Add branches for missing cases',
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

    function fixSwitch(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.SwitchStatement,
      missingBranchTypes: Array<ts.Type>,
    ): TSESLint.RuleFix | null {
      // It seems, there is no way to insert automatically generated cases
      // inside an empty switch body
      if (node.cases.length === 0) {
        return null;
      }

      const lastCase = node.cases[node.cases.length - 1];
      const lastCaseIndent = Array(lastCase.loc.start.column + 1).join(' ');
      let fixString = '';

      for (const missingBranchType of missingBranchTypes) {
        // While running this rule on checker.ts of TypeScript project
        // the fix introduced a compiler error due to:
        //
        // type __String = (string & {
        //         __escapedIdentifier: void;
        //     }) | (void & {
        //         __escapedIdentifier: void;
        //     }) | InternalSymbolName;
        //
        // The following check fixes it.
        if (missingBranchType.isIntersection()) {
          continue;
        }

        const caseTest = checker.typeToString(missingBranchType);
        const errorMessage = `Not implemented yet: ${caseTest} case`;

        fixString += `\n${lastCaseIndent}case ${caseTest}: { throw new Error('${errorMessage}') }`;
      }

      return fixer.insertTextAfter(lastCase, fixString);
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
              .map(missingType =>
                isTypeFlagSet(missingType, ts.TypeFlags.ESSymbolLike)
                  ? `typeof ${missingType.symbol.escapedName}`
                  : checker.typeToString(missingType),
              )
              .join(' | '),
          },
          suggest: [
            {
              messageId: 'addMissingCases',
              fix(fixer): TSESLint.RuleFix | null {
                return fixSwitch(fixer, node, missingBranchTypes);
              },
            },
          ],
        });
      }
    }

    return {
      SwitchStatement: checkSwitchExhaustive,
    };
  },
});
