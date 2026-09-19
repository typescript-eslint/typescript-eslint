import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getValueOfLiteralType,
  isClosingBraceToken,
  isOpeningBraceToken,
  nullThrows,
  NullThrowsReasons,
  requiresQuoting,
} from '../util';

const DEFAULT_COMMENT_PATTERN = /^no default$/iu;

interface SwitchMetadata {
  readonly containsNonLiteralType: boolean;
  readonly defaultCase: TSESTree.Comment | TSESTree.SwitchCase | undefined;
  readonly missingLiteralBranchTypes: ts.Type[];
  readonly symbolName: string | undefined;
}

export type Options = [
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

    /**
     * Regular expression for a comment that can indicate an intentionally omitted default case.
     */
    defaultCaseCommentPattern?: string;

    /**
     * If `true`, the `default` clause is used to determine whether the switch statement is exhaustive for union types.
     *
     * @default false
     */
    considerDefaultExhaustiveForUnions?: boolean;
  },
];

export type MessageIds =
  'addMissingCases' | 'dangerousDefaultCase' | 'switchIsNotExhaustive';

export default createRule<Options, MessageIds>({
  name: 'switch-exhaustiveness-check',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require switch-case statements to be exhaustive',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      addMissingCases: 'Add branches for missing cases.',
      dangerousDefaultCase:
        'The switch statement is exhaustive, so the default case is unnecessary.',
      switchIsNotExhaustive:
        'Switch is not exhaustive. Cases not matched: {{missingBranches}}',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowDefaultCaseForExhaustiveSwitch: {
            type: 'boolean',
            description: `If 'true', allow 'default' cases on switch statements with exhaustive cases.`,
          },
          considerDefaultExhaustiveForUnions: {
            type: 'boolean',
            description: `If 'true', the 'default' clause is used to determine whether the switch statement is exhaustive for union type`,
          },
          defaultCaseCommentPattern: {
            type: 'string',
            description: `Regular expression for a comment that can indicate an intentionally omitted default case.`,
          },
          requireDefaultForNonUnion: {
            type: 'boolean',
            description: `If 'true', require a 'default' clause for switches on non-union types.`,
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowDefaultCaseForExhaustiveSwitch: true,
      considerDefaultExhaustiveForUnions: false,
      requireDefaultForNonUnion: false,
    },
  ],
  create(
    context,
    [
      {
        allowDefaultCaseForExhaustiveSwitch,
        considerDefaultExhaustiveForUnions,
        defaultCaseCommentPattern,
        requireDefaultForNonUnion,
      },
    ],
  ) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();
    const commentRegExp =
      defaultCaseCommentPattern != null
        ? new RegExp(defaultCaseCommentPattern, 'u')
        : DEFAULT_COMMENT_PATTERN;

    function getCommentDefaultCase(
      node: TSESTree.SwitchStatement,
    ): TSESTree.Comment | undefined {
      const lastCase = node.cases.at(-1);
      const commentsAfterLastCase = lastCase
        ? context.sourceCode.getCommentsAfter(lastCase)
        : [];
      const defaultCaseComment = commentsAfterLastCase.at(-1);

      if (commentRegExp.test(defaultCaseComment?.value.trim() || '')) {
        return defaultCaseComment;
      }

      return;
    }

    function typeToString(type: ts.Type): string {
      return checker.typeToString(
        type,
        undefined,
        ts.TypeFormatFlags.AllowUniqueESSymbolType |
          ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
          ts.TypeFormatFlags.UseFullyQualifiedType,
      );
    }

    function getSwitchMetadata(node: TSESTree.SwitchStatement): SwitchMetadata {
      const defaultCase = node.cases.find(
        switchCase => switchCase.test == null,
      );

      const discriminantType = getConstrainedTypeAtLocation(
        services,
        node.discriminant,
      );

      const symbolName = discriminantType.getSymbol()?.escapedName as
        string | undefined;

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

      for (const unionPart of tsutils.unionConstituents(discriminantType)) {
        for (const intersectionPart of tsutils.intersectionConstituents(
          unionPart,
        )) {
          if (
            caseTypes.has(intersectionPart) ||
            !isTypeLiteralLikeType(intersectionPart)
          ) {
            continue;
          }

          // "missing", "optional" and "undefined" types are different runtime objects,
          // but all of them have TypeFlags.Undefined type flag
          if (
            [...caseTypes].some(tsutils.isIntrinsicUndefinedType) &&
            tsutils.isIntrinsicUndefinedType(intersectionPart)
          ) {
            continue;
          }

          missingLiteralBranchTypes.push(intersectionPart);
        }
      }

      return {
        containsNonLiteralType,
        defaultCase: defaultCase ?? getCommentDefaultCase(node),
        missingLiteralBranchTypes: missingLiteralBranchTypes.sort(
          compareMissingLiteralBranchTypes,
        ),
        symbolName,
      };
    }

    function checkSwitchExhaustive(
      node: TSESTree.SwitchStatement,
      switchMetadata: SwitchMetadata,
    ): void {
      const { defaultCase, missingLiteralBranchTypes, symbolName } =
        switchMetadata;

      // If considerDefaultExhaustiveForUnions is enabled, the presence of a default case
      // always makes the switch exhaustive.
      if (considerDefaultExhaustiveForUnions && defaultCase != null) {
        return;
      }

      if (missingLiteralBranchTypes.length > 0) {
        context.report({
          node: node.discriminant,
          messageId: 'switchIsNotExhaustive',
          data: {
            missingBranches: missingLiteralBranchTypes
              .map(missingType =>
                tsutils.isTypeFlagSet(missingType, ts.TypeFlags.ESSymbolLike)
                  ? `typeof ${missingType.getSymbol()?.escapedName as string}`
                  : typeToString(missingType),
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
                  defaultCase,
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
      defaultCase: TSESTree.Comment | TSESTree.SwitchCase | undefined,
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
          : typeToString(missingBranchType);

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
        if (defaultCase) {
          const beforeFixString = missingCases
            .map(code => `${code}\n${caseIndent}`)
            .join('');

          return fixer.insertTextBefore(defaultCase, beforeFixString);
        }
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

      const { containsNonLiteralType, defaultCase, missingLiteralBranchTypes } =
        switchMetadata;

      if (
        missingLiteralBranchTypes.length === 0 &&
        defaultCase != null &&
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

      const { containsNonLiteralType, defaultCase } = switchMetadata;

      if (containsNonLiteralType && defaultCase == null) {
        context.report({
          node: node.discriminant,
          messageId: 'switchIsNotExhaustive',
          data: { missingBranches: 'default' },
          suggest: [
            {
              messageId: 'addMissingCases',
              fix(fixer): TSESLint.RuleFix {
                return fixSwitch(fixer, node, [null], defaultCase);
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

const LITERAL_KINDS = [
  ts.TypeFlags.StringLiteral,
  ts.TypeFlags.NumberLiteral,
  ts.TypeFlags.BigIntLiteral,
  ts.TypeFlags.BooleanLiteral,
  ts.TypeFlags.UniqueESSymbol,
  ts.TypeFlags.Undefined,
  ts.TypeFlags.Null,
  ts.TypeFlags.EnumLike,
];

/** Kinds from this one on have no value to sort by. */
const FIRST_DECLARATION_ORDER_KIND = LITERAL_KINDS.indexOf(
  ts.TypeFlags.UniqueESSymbol,
);

function compareMissingLiteralBranchTypes(a: ts.Type, b: ts.Type): number {
  const kind = getLiteralKind(a);
  const kinds = kind - getLiteralKind(b);

  if (kinds !== 0) {
    return kinds;
  }

  if (kind < FIRST_DECLARATION_ORDER_KIND) {
    return compareValues(getSortKey(a), getSortKey(b));
  }

  // Enum members keep the declaration order the compiler reports them in, since
  // `Enum.Up | Enum.Down` reads better than the alphabetical `Enum.Down |
  // Enum.Up`. They still need grouping by their enum: which of two enums the
  // compiler resolved first depends on the other files in the lint run.
  return compareValues(getEnumName(a), getEnumName(b));
}

function getEnumName(type: ts.Type): string {
  const declaration = type.getSymbol()?.valueDeclaration?.parent;

  return declaration && ts.isEnumDeclaration(declaration)
    ? declaration.name.text
    : '';
}

function getLiteralKind(type: ts.Type): number {
  // An enum member also carries StringLiteral or NumberLiteral, so it has to be
  // matched before them.
  return tsutils.isTypeFlagSet(type, ts.TypeFlags.EnumLike)
    ? LITERAL_KINDS.indexOf(ts.TypeFlags.EnumLike)
    : LITERAL_KINDS.findIndex(flag => tsutils.isTypeFlagSet(type, flag));
}

function getSortKey(type: ts.Type): bigint | boolean | number | string {
  if (
    tsutils.isStringLiteralType(type) ||
    tsutils.isNumberLiteralType(type) ||
    tsutils.isBigIntLiteralType(type)
  ) {
    return getValueOfLiteralType(type);
  }

  return tsutils.isTrueLiteralType(type);
}

function compareValues<T extends bigint | boolean | number | string>(
  a: T,
  b: T,
): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

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
    .unionConstituents(type)
    .some(type =>
      tsutils
        .intersectionConstituents(type)
        .every(subType => !isTypeLiteralLikeType(subType)),
    );
}
