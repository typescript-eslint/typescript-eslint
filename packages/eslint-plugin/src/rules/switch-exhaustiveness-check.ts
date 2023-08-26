import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isClosingBraceToken,
  isOpeningBraceToken,
  requiresQuoting,
} from '../util';

interface SwitchStatementMetadata {
  /** The name of the union that is inside of the switch statement. */
  symbolName: string | undefined;

  /**
   * If the length of this array is equal to 0, then the switch statement is
   * exhaustive.
   */
  missingBranchTypes: ts.Type[];

  /**
   * The node representing the `default` case on the switch statement, if any.
   */
  defaultCase: TSESTree.SwitchCase | undefined;
}

export default createRule({
  name: 'switch-exhaustiveness-check',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require switch-case statements to be exhaustive with union type',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      switchIsNotExhaustive:
        'Switch is not exhaustive. Cases not matched: {{missingBranches}}',
      dangerousDefaultCase:
        'The switch statement is exhaustive, so the default case is superfluous and will obfucate future additions to the union.',
      addMissingCases: 'Add branches for missing cases.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();

    /**
     * @returns Metadata about whether the switch is exhaustive (or `undefined`
     *          if the switch case is not a union).
     */
    function getSwitchStatementMetadata(
      node: TSESTree.SwitchStatement,
    ): SwitchStatementMetadata | undefined {
      const discriminantType = getConstrainedTypeAtLocation(
        services,
        node.discriminant,
      );
      if (!discriminantType.isUnion()) {
        return undefined;
      }

      const caseTypes = new Set<ts.Type>();
      for (const switchCase of node.cases) {
        // If the `test` property of the switch case is `null`, then we are on a
        // `default` case.
        if (switchCase.test == null) {
          continue;
        }

        const caseType = getConstrainedTypeAtLocation(
          services,
          switchCase.test,
        );
        caseTypes.add(caseType);
      }

      const unionTypes = tsutils.unionTypeParts(discriminantType);
      const missingBranchTypes = unionTypes.filter(
        unionType => !caseTypes.has(unionType),
      );

      /**
       * Convert `ts.__String | undefined` to `string | undefined` for
       * simplicity.
       */
      const symbolName = discriminantType.getSymbol()?.escapedName as
        | string
        | undefined;

      /**
       * The `test` property of a `SwitchCase` node will usually be a `Literal`
       * node. However, on a `default` case, it will be equal to `null`.
       */
      const defaultCase = node.cases.find(
        switchCase => switchCase.test == null,
      );

      return {
        missingBranchTypes,
        symbolName,
        defaultCase,
      };
    }

    function checkSwitchExhaustive(
      node: TSESTree.SwitchStatement,
      switchStatementMetadata: SwitchStatementMetadata,
    ): void {
      const { missingBranchTypes, symbolName, defaultCase } =
        switchStatementMetadata;

      // We only trigger the rule if a `default` case does not exist, since that
      // would disqualifies the switch statement from having cases that exactly
      // match the members of a union.
      if (missingBranchTypes.length > 0 && defaultCase === undefined) {
        context.report({
          node: node.discriminant,
          messageId: 'switchIsNotExhaustive',
          data: {
            missingBranches: missingBranchTypes
              .map(missingType =>
                tsutils.isTypeFlagSet(missingType, ts.TypeFlags.ESSymbolLike)
                  ? `typeof ${missingType.getSymbol()?.escapedName as string}`
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

    function fixSwitch(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.SwitchStatement,
      missingBranchTypes: ts.Type[],
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
          requiresQuoting(missingBranchName.toString(), compilerOptions.target)
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

    function checkSwitchDangerousDefaultCase(
      node: TSESTree.SwitchStatement,
      switchStatementMetadata: SwitchStatementMetadata,
    ): void {
      const { missingBranchTypes, defaultCase } = switchStatementMetadata;

      if (missingBranchTypes.length === 0 && defaultCase !== undefined) {
        context.report({
          node: defaultCase,
          messageId: 'dangerousDefaultCase',
        });
      }
    }

    return {
      SwitchStatement(node): void {
        const switchStatementMetadata = getSwitchStatementMetadata(node);
        if (switchStatementMetadata === undefined) {
          return;
        }

        checkSwitchExhaustive(node, switchStatementMetadata);
        checkSwitchDangerousDefaultCase(node, switchStatementMetadata);
      },
    };
  },
});
