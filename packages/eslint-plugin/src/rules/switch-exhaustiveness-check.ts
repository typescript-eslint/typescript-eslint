import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isClosingBraceToken,
  isOpeningBraceToken,
} from '../util';
import { isTypeFlagSet, unionTypeParts } from 'tsutils';

export default createRule({
  name: 'switch-exhaustiveness-check',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Exhaustiveness checking in switch with union type',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      switchIsNotExhaustive:
        'Switch is not exhaustive. Cases not matched: {{missingBranches}}',
      addMissingCases: 'Add branches for missing cases.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    const service = getParserServices(context);
    const checker = service.program.getTypeChecker();
    const compilerOptions = service.program.getCompilerOptions();

    function requiresQuoting(name: string): boolean {
      if (name.length === 0) {
        return true;
      }

      if (!ts.isIdentifierStart(name.charCodeAt(0), compilerOptions.target)) {
        return true;
      }

      for (let i = 1; i < name.length; i += 1) {
        if (!ts.isIdentifierPart(name.charCodeAt(i), compilerOptions.target)) {
          return true;
        }
      }

      return false;
    }

    function getNodeType(node: TSESTree.Node): ts.Type {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      return getConstrainedTypeAtLocation(checker, tsNode);
    }

    function fixSwitch(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.SwitchStatement,
      missingBranchTypes: Array<ts.Type>,
      symbolName?: string,
    ): TSESLint.RuleFix | null {
      const lastCase =
        node.cases.length > 0 ? node.cases[node.cases.length - 1] : null;
      const caseIndent = lastCase
        ? ' '.repeat(lastCase.loc.start.column)
        : // if there are no cases, use indentation of the switch statement
          // and leave it to user to format it correctly
          ' '.repeat(node.loc.start.column);

      const missingCases = [];
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

        const missingBranchName = missingBranchType.getSymbol()?.escapedName;
        let caseTest = checker.typeToString(missingBranchType);

        if (
          symbolName &&
          (missingBranchName || missingBranchName === '') &&
          requiresQuoting(missingBranchName.toString())
        ) {
          caseTest = `${symbolName}['${missingBranchName}']`;
        }

        const errorMessage = `Not implemented yet: ${caseTest} case`;

        missingCases.push(
          `case ${caseTest}: { throw new Error('${errorMessage}') }`,
        );
      }

      const fixString = missingCases
        .map(code => `${caseIndent}${code}`)
        .join('\n');

      if (lastCase) {
        return fixer.insertTextAfter(lastCase, `\n${fixString}`);
      }

      // there were no existing cases
      const openingBrace = sourceCode.getTokenAfter(
        node.discriminant,
        isOpeningBraceToken,
      )!;
      const closingBrace = sourceCode.getTokenAfter(
        node.discriminant,
        isClosingBraceToken,
      )!;

      return fixer.replaceTextRange(
        [openingBrace.range[0], closingBrace.range[1]],
        ['{', fixString, `${caseIndent}}`].join('\n'),
      );
    }

    function checkSwitchExhaustive(node: TSESTree.SwitchStatement): void {
      const discriminantType = getNodeType(node.discriminant);
      const symbolName = discriminantType.getSymbol()?.escapedName;

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
                  ? `typeof ${missingType.getSymbol()?.escapedName}`
                  : checker.typeToString(missingType),
              )
              .join(' | '),
          },
          suggest: [
            {
              messageId: 'addMissingCases',
              fix(fixer): TSESLint.RuleFix | null {
                return fixSwitch(
                  fixer,
                  node,
                  missingBranchTypes,
                  symbolName?.toString(),
                );
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
