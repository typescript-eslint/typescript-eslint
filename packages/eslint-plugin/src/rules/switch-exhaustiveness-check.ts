import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isClosingBraceToken,
  isOpeningBraceToken,
  nullThrows,
  NullThrowsReasons,
  requiresQuoting,
} from '../util';

interface SwitchMetadata {
  readonly symbolName: string | undefined;
  readonly defaultCase: TSESTree.SwitchCase | undefined;
  readonly missingLiteralBranchTypes: ts.Type[];
  readonly containsNonLiteralType: boolean;
}

type Options = [
  {
    /**
     * If `true`, allow `default` cases on switch statements with exhaustive
     * cases.
     *
     * @default true
     */
    allowDefaultCaseForExhaustiveSwitch?: boolean;

    /**
     * If `true`, require a `default` clause for switches on non-union types.
     *
     * @default false
     */
    requireDefaultForNonUnion?: boolean;
  },
];

type MessageIds =
  | 'switchIsNotExhaustive'
  | 'dangerousDefaultCase'
  | 'addMissingCases';

export default createRule<Options, MessageIds>({
  name: 'switch-exhaustiveness-check',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require switch-case statements to be exhaustive',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          allowDefaultCaseForExhaustiveSwitch: {
            description: `If 'true', allow 'default' cases on switch statements with exhaustive cases.`,
            type: 'boolean',
          },
          requireDefaultForNonUnion: {
            description: `If 'true', require a 'default' clause for switches on non-union types.`,
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      switchIsNotExhaustive:
        'Switch is not exhaustive. Cases not matched: {{missingBranches}}',
      dangerousDefaultCase:
        'The switch statement is exhaustive, so the default case is unnecessary.',
      addMissingCases: 'Add branches for missing cases.',
    },
  },
  defaultOptions: [
    {
      allowDefaultCaseForExhaustiveSwitch: true,
      requireDefaultForNonUnion: false,
    },
  ],
  create(
    context,
    [{ allowDefaultCaseForExhaustiveSwitch, requireDefaultForNonUnion }],
  ) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();

    function getSwitchMetadata(node: TSESTree.SwitchStatement): SwitchMetadata {
      const defaultCase = node.cases.find(
        switchCase => switchCase.test == null,
      );

      const discriminantType = getConstrainedTypeAtLocation(
        services,
        node.discriminant,
      );

      const symbolName = discriminantType.getSymbol()?.escapedName as
        | string
        | undefined;

      const containsNonLiteralType =
        doesTypeContainNonLiteralType(discriminantType);

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

      const missingLiteralBranchTypes: ts.Type[] = [];

      for (const unionPart of tsutils.unionTypeParts(discriminantType)) {
        for (const intersectionPart of tsutils.intersectionTypeParts(
          unionPart,
        )) {
          if (
            caseTypes.has(intersectionPart) ||
            !isTypeLiteralLikeType(intersectionPart)
          ) {
            continue;
          }

          missingLiteralBranchTypes.push(intersectionPart);
        }
      }

      return {
        symbolName,
        missingLiteralBranchTypes,
        defaultCase,
        containsNonLiteralType,
      };
    }

    function checkSwitchExhaustive(
      node: TSESTree.SwitchStatement,
      switchMetadata: SwitchMetadata,
    ): void {
      const { missingLiteralBranchTypes, symbolName, defaultCase } =
        switchMetadata;

      // We only trigger the rule if a `default` case does not exist, since that
      // would disqualify the switch statement from having cases that exactly
      // match the members of a union.
      if (missingLiteralBranchTypes.length > 0 && defaultCase === undefined) {
        context.report({
          node: node.discriminant,
          messageId: 'switchIsNotExhaustive',
          data: {
            missingBranches: missingLiteralBranchTypes
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
                  missingLiteralBranchTypes,
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
      missingBranchTypes: (ts.Type | null)[], // null means default branch
      symbolName?: string,
    ): TSESLint.RuleFix {
      const lastCase =
        node.cases.length > 0 ? node.cases[node.cases.length - 1] : null;
      const caseIndent = lastCase
        ? ' '.repeat(lastCase.loc.start.column)
        : // If there are no cases, use indentation of the switch statement and
          // leave it to the user to format it correctly.
          ' '.repeat(node.loc.start.column);

      const missingCases = [];
      for (const missingBranchType of missingBranchTypes) {
        if (missingBranchType == null) {
          missingCases.push(`default: { throw new Error('default case') }`);
          continue;
        }

        const missingBranchName = missingBranchType.getSymbol()?.escapedName;
        let caseTest = tsutils.isTypeFlagSet(
          missingBranchType,
          ts.TypeFlags.ESSymbolLike,
        )
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            missingBranchName!
          : checker.typeToString(missingBranchType);

        if (
          symbolName &&
          (missingBranchName || missingBranchName === '') &&
          requiresQuoting(missingBranchName.toString(), compilerOptions.target)
        ) {
          const escapedBranchName = missingBranchName
            .replaceAll("'", "\\'")
            .replaceAll('\n', '\\n')
            .replaceAll('\r', '\\r');

          caseTest = `${symbolName}['${escapedBranchName}']`;
        }

        missingCases.push(
          `case ${caseTest}: { throw new Error('Not implemented yet: ${caseTest
            .replaceAll('\\', '\\\\')
            .replaceAll("'", "\\'")} case') }`,
        );
      }

      const fixString = missingCases
        .map(code => `${caseIndent}${code}`)
        .join('\n');

      if (lastCase) {
        return fixer.insertTextAfter(lastCase, `\n${fixString}`);
      }

      // There were no existing cases.
      const openingBrace = nullThrows(
        context.sourceCode.getTokenAfter(
          node.discriminant,
          isOpeningBraceToken,
        ),
        NullThrowsReasons.MissingToken('{', 'discriminant'),
      );
      const closingBrace = nullThrows(
        context.sourceCode.getTokenAfter(
          node.discriminant,
          isClosingBraceToken,
        ),
        NullThrowsReasons.MissingToken('}', 'discriminant'),
      );

      return fixer.replaceTextRange(
        [openingBrace.range[0], closingBrace.range[1]],
        ['{', fixString, `${caseIndent}}`].join('\n'),
      );
    }

    function checkSwitchUnnecessaryDefaultCase(
      switchMetadata: SwitchMetadata,
    ): void {
      if (allowDefaultCaseForExhaustiveSwitch) {
        return;
      }

      const { missingLiteralBranchTypes, defaultCase, containsNonLiteralType } =
        switchMetadata;

      if (
        missingLiteralBranchTypes.length === 0 &&
        defaultCase !== undefined &&
        !containsNonLiteralType
      ) {
        context.report({
          node: defaultCase,
          messageId: 'dangerousDefaultCase',
        });
      }
    }

    function checkSwitchNoUnionDefaultCase(
      node: TSESTree.SwitchStatement,
      switchMetadata: SwitchMetadata,
    ): void {
      if (!requireDefaultForNonUnion) {
        return;
      }

      const { defaultCase, containsNonLiteralType } = switchMetadata;

      if (containsNonLiteralType && defaultCase === undefined) {
        context.report({
          node: node.discriminant,
          messageId: 'switchIsNotExhaustive',
          data: { missingBranches: 'default' },
          suggest: [
            {
              messageId: 'addMissingCases',
              fix(fixer): TSESLint.RuleFix {
                return fixSwitch(fixer, node, [null]);
              },
            },
          ],
        });
      }
    }

    return {
      SwitchStatement(node): void {
        const switchMetadata = getSwitchMetadata(node);

        checkSwitchExhaustive(node, switchMetadata);
        checkSwitchUnnecessaryDefaultCase(switchMetadata);
        checkSwitchNoUnionDefaultCase(node, switchMetadata);
      },
    };
  },
});

function isTypeLiteralLikeType(type: ts.Type): boolean {
  return tsutils.isTypeFlagSet(
    type,
    ts.TypeFlags.Literal |
      ts.TypeFlags.Undefined |
      ts.TypeFlags.Null |
      ts.TypeFlags.UniqueESSymbol,
  );
}

/**
 * For example:
 *
 * - `"foo" | "bar"` is a type with all literal types.
 * - `"foo" | number` is a type that contains non-literal types.
 * - `"foo" & { bar: 1 }` is a type that contains non-literal types.
 *
 * Default cases are never superfluous in switches with non-literal types.
 */
function doesTypeContainNonLiteralType(type: ts.Type): boolean {
  return tsutils
    .unionTypeParts(type)
    .some(type =>
      tsutils
        .intersectionTypeParts(type)
        .every(subType => !isTypeLiteralLikeType(subType)),
    );
}
