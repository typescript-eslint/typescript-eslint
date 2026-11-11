import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import type {
  ReportDescriptor,
  ReportFixFunction,
  RuleContext,
  RuleFix,
  RuleFixer,
  SourceCode,
} from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { unionConstituents } from 'ts-api-utils';
import * as ts from 'typescript';

import type { LastChainOperand, ValidOperand } from './gatherLogicalOperands';
import type {
  PreferOptionalChainMessageIds,
  PreferOptionalChainOptions,
} from './PreferOptionalChainOptions';

import {
  getConstrainedTypeAtLocation,
  getFixOrSuggest,
  getOperatorPrecedenceForNode,
  isClosingParenToken,
  isOpeningBracketToken,
  isOpeningParenToken,
  isSemicolonToken,
  isTypeFlagSet,
  nullThrows,
  NullThrowsReasons,
  OperatorPrecedence,
} from '../../util';
import { checkNullishAndReport } from './checkNullishAndReport';
import { compareNodes, NodeComparisonResult } from './compareNodes';
import {
  ComparisonType,
  NullishComparisonType,
  Yoda,
} from './gatherLogicalOperands';

type LastChainOperandForReport = Omit<LastChainOperand, 'yoda'> & {
  isYoda: boolean;
};

function includesType(
  parserServices: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
  typeFlagIn: ts.TypeFlags,
): boolean {
  const typeFlag = typeFlagIn | ts.TypeFlags.Any | ts.TypeFlags.Unknown;
  const types = unionConstituents(parserServices.getTypeAtLocation(node));
  for (const type of types) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
    if (isTypeFlagSet(type, typeFlag)) {
      return true;
    }
  }
  return false;
}

const MAYBE_UNDEFINED_FLAGS =
  ts.TypeFlags.Any |
  ts.TypeFlags.Unknown |
  ts.TypeFlags.InstantiableNonPrimitive |
  ts.TypeFlags.Undefined |
  ts.TypeFlags.Void;

function isValidAndLastChainOperand(
  ComparisonValueType: TSESTree.Node,
  comparisonType: ComparisonType,
  parserServices: ParserServicesWithTypeInformation,
) {
  const type = getConstrainedTypeAtLocation(
    parserServices,
    ComparisonValueType,
  );

  const types = unionConstituents(type);
  switch (comparisonType) {
    case ComparisonType.Equal: {
      const isNullish = types.some(t =>
        isTypeFlagSet(
          t,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
          MAYBE_UNDEFINED_FLAGS | ts.TypeFlags.Null,
        ),
      );
      return !isNullish;
    }
    case ComparisonType.StrictEqual: {
      const isUndefined = types.some(t =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
        isTypeFlagSet(t, MAYBE_UNDEFINED_FLAGS),
      );
      return !isUndefined;
    }
    case ComparisonType.NotStrictEqual: {
      return types.every(t => isTypeFlagSet(t, ts.TypeFlags.Undefined));
    }
    case ComparisonType.NotEqual: {
      return types.every(t =>
        isTypeFlagSet(t, ts.TypeFlags.Undefined | ts.TypeFlags.Null),
      );
    }
  }
}
function isValidOrLastChainOperand(
  ComparisonValueType: TSESTree.Node,
  comparisonType: ComparisonType,
  parserServices: ParserServicesWithTypeInformation,
) {
  const type = getConstrainedTypeAtLocation(
    parserServices,
    ComparisonValueType,
  );

  const types = unionConstituents(type);
  switch (comparisonType) {
    case ComparisonType.NotEqual: {
      const isNullish = types.some(t =>
        isTypeFlagSet(
          t,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
          MAYBE_UNDEFINED_FLAGS | ts.TypeFlags.Null,
        ),
      );
      return !isNullish;
    }
    case ComparisonType.NotStrictEqual: {
      const isUndefined = types.some(t =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
        isTypeFlagSet(t, MAYBE_UNDEFINED_FLAGS),
      );
      return !isUndefined;
    }
    case ComparisonType.Equal:
      return types.every(t =>
        isTypeFlagSet(t, ts.TypeFlags.Undefined | ts.TypeFlags.Null),
      );
    case ComparisonType.StrictEqual:
      return types.every(t => isTypeFlagSet(t, ts.TypeFlags.Undefined));
  }
}

// I hate that these functions are identical aside from the enum values used
// I can't think of a good way to reuse the code here in a way that will preserve
// the type safety and simplicity.

type OperandAnalyzer = (
  parserServices: ParserServicesWithTypeInformation,
  operand: ValidOperand,
  index: number,
  chain: readonly ValidOperand[],
) => readonly [ValidOperand, ValidOperand] | readonly [ValidOperand] | null;
const analyzeAndChainOperand: OperandAnalyzer = (
  parserServices,
  operand,
  index,
  chain,
) => {
  switch (operand.comparisonType) {
    case NullishComparisonType.Boolean:
    case NullishComparisonType.NotEqualNullOrUndefined:
      return [operand];

    case NullishComparisonType.NotStrictEqualNull: {
      // handle `x !== null && x !== undefined`
      const nextOperand = chain.at(index + 1);
      if (
        nextOperand?.comparisonType ===
          NullishComparisonType.NotStrictEqualUndefined &&
        compareNodes(operand.comparedName, nextOperand.comparedName) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      }
      if (
        nextOperand &&
        !includesType(
          parserServices,
          operand.comparedName,
          ts.TypeFlags.Undefined,
        )
      ) {
        // we know the next operand is not an `undefined` check and that this
        // operand includes `undefined` - which means that making this an
        // optional chain would change the runtime behavior of the expression
        return [operand];
      }
      return null;
    }

    case NullishComparisonType.NotStrictEqualUndefined: {
      // handle `x !== undefined && x !== null`
      const nextOperand = chain.at(index + 1);
      if (
        nextOperand?.comparisonType ===
          NullishComparisonType.NotStrictEqualNull &&
        compareNodes(operand.comparedName, nextOperand.comparedName) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      }
      if (
        includesType(parserServices, operand.comparedName, ts.TypeFlags.Null)
      ) {
        // we know the next operand is not a `null` check and that this
        // operand includes `null` - which means that making this an
        // optional chain would change the runtime behavior of the expression
        return null;
      }

      return [operand];
    }

    default:
      return null;
  }
};
const analyzeOrChainOperand: OperandAnalyzer = (
  parserServices,
  operand,
  index,
  chain,
) => {
  switch (operand.comparisonType) {
    case NullishComparisonType.NotBoolean:
    case NullishComparisonType.EqualNullOrUndefined:
      return [operand];

    case NullishComparisonType.StrictEqualNull: {
      // handle `x === null || x === undefined`
      const nextOperand = chain.at(index + 1);
      if (
        nextOperand?.comparisonType ===
          NullishComparisonType.StrictEqualUndefined &&
        compareNodes(operand.comparedName, nextOperand.comparedName) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      }

      if (
        includesType(
          parserServices,
          operand.comparedName,
          ts.TypeFlags.Undefined,
        )
      ) {
        // we know the next operand is not an `undefined` check and that this
        // operand includes `undefined` - which means that making this an
        // optional chain would change the runtime behavior of the expression
        return null;
      }
      return [operand];
    }

    case NullishComparisonType.StrictEqualUndefined: {
      // handle `x === undefined || x === null`
      const nextOperand = chain.at(index + 1);
      if (
        nextOperand?.comparisonType === NullishComparisonType.StrictEqualNull &&
        compareNodes(operand.comparedName, nextOperand.comparedName) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      }
      if (
        includesType(parserServices, operand.comparedName, ts.TypeFlags.Null)
      ) {
        // we know the next operand is not a `null` check and that this
        // operand includes `null` - which means that making this an
        // optional chain would change the runtime behavior of the expression
        return null;
      }

      return [operand];
    }

    default:
      return null;
  }
};

const resolveOperandSubset = (
  previousOperand: ValidOperand,
  lastChainOperand: LastChainOperand,
) => {
  const isNameSubset =
    compareNodes(
      previousOperand.comparedName,
      lastChainOperand.comparedName,
    ) === NodeComparisonResult.Subset;

  if (lastChainOperand.yoda !== Yoda.Unknown) {
    return {
      comparedName: lastChainOperand.comparedName,
      comparisonValue: lastChainOperand.comparisonValue,
      isSubset: isNameSubset,
      isYoda: lastChainOperand.yoda === Yoda.Yes,
    };
  }

  const isValueSubset =
    compareNodes(
      previousOperand.comparedName,
      lastChainOperand.comparisonValue,
    ) === NodeComparisonResult.Subset;

  if (isNameSubset && !isValueSubset) {
    return {
      comparedName: lastChainOperand.comparedName,
      comparisonValue: lastChainOperand.comparisonValue,
      isSubset: true,
      isYoda: false,
    };
  }

  if (!isNameSubset && isValueSubset) {
    return {
      comparedName: lastChainOperand.comparisonValue,
      comparisonValue: lastChainOperand.comparedName,
      isSubset: true,
      isYoda: true,
    };
  }

  return {
    comparedName: lastChainOperand.comparisonValue,
    comparisonValue: lastChainOperand.comparisonValue,
    isSubset: false,
    isYoda: true,
  };
};

/**
 * Returns the range that needs to be reported from the chain.
 * @param chain The chain of logical expressions.
 * @param boundary The boundary range that the range to report cannot fall outside.
 * @param sourceCode The source code to get tokens.
 * @returns The range to report.
 */
function getReportRange(
  chain: { node: TSESTree.Expression }[],
  boundary: TSESTree.Range,
  sourceCode: SourceCode,
): TSESTree.Range {
  const leftNode = chain[0].node;
  const rightNode = chain[chain.length - 1].node;
  let leftMost = nullThrows(
    sourceCode.getFirstToken(leftNode),
    NullThrowsReasons.MissingToken('any token', leftNode.type),
  );
  let rightMost = nullThrows(
    sourceCode.getLastToken(rightNode),
    NullThrowsReasons.MissingToken('any token', rightNode.type),
  );

  while (leftMost.range[0] > boundary[0]) {
    const token = sourceCode.getTokenBefore(leftMost);
    if (!token || !isOpeningParenToken(token) || token.range[0] < boundary[0]) {
      break;
    }
    leftMost = token;
  }

  while (rightMost.range[1] < boundary[1]) {
    const token = sourceCode.getTokenAfter(rightMost);
    if (!token || !isClosingParenToken(token) || token.range[1] > boundary[1]) {
      break;
    }
    rightMost = token;
  }

  return [leftMost.range[0], rightMost.range[1]];
}

type LinkFix = (fixer: RuleFixer) => RuleFix[];

/**
 * Gets, for each link of a chain, the edits that make that link optional, or
 * `null` when it already is or is the root of the chain. The links are in the
 * same order as the parts produced by `flattenChainExpression`.
 */
function getOptionalLinkFixes(
  sourceCode: SourceCode,
  node: TSESTree.Node,
): (LinkFix | null)[] {
  switch (node.type) {
    case AST_NODE_TYPES.ChainExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
      return getOptionalLinkFixes(sourceCode, node.expression);

    case AST_NODE_TYPES.CallExpression: {
      const callee = node.callee;
      const typeArguments = node.typeArguments;
      const linkFix: LinkFix | null = node.optional
        ? null
        : fixer => {
            const openingParen = nullThrows(
              sourceCode.getFirstTokenBetween(
                typeArguments ?? callee,
                nullThrows(
                  sourceCode.getLastToken(node),
                  NullThrowsReasons.MissingToken(')', node.type),
                ),
                isOpeningParenToken,
              ),
              NullThrowsReasons.MissingToken('(', node.type),
            );
            return [
              // `foo!()` becomes `foo?.()`, matching the `&&` fix
              ...getNonNullAssertionRemoval(fixer, callee),
              fixer.insertTextBefore(typeArguments ?? openingParen, '?.'),
            ];
          };
      return [...getOptionalLinkFixes(sourceCode, callee), linkFix];
    }

    case AST_NODE_TYPES.MemberExpression: {
      const object = node.object;
      const linkFix: LinkFix | null = node.optional
        ? null
        : fixer => {
            const removals = getNonNullAssertionRemoval(fixer, object);
            if (node.computed) {
              const openingBracket = nullThrows(
                sourceCode.getTokenAfter(object, isOpeningBracketToken),
                NullThrowsReasons.MissingToken('[', node.type),
              );
              return [
                ...removals,
                fixer.insertTextBefore(openingBracket, '?.'),
              ];
            }
            const dot = nullThrows(
              sourceCode.getTokenBefore(node.property),
              NullThrowsReasons.MissingToken('.', node.type),
            );
            return [...removals, fixer.replaceText(dot, '?.')];
          };
      return [...getOptionalLinkFixes(sourceCode, object), linkFix];
    }

    default:
      return [null];
  }

  function getNonNullAssertionRemoval(
    fixer: RuleFixer,
    expression: TSESTree.Expression,
  ): RuleFix[] {
    if (expression.type !== AST_NODE_TYPES.TSNonNullExpression) {
      return [];
    }
    const bang = nullThrows(
      sourceCode.getLastToken(expression),
      NullThrowsReasons.MissingToken('!', expression.type),
    );
    return [fixer.remove(bang)];
  }
}

/**
 * Fixes `if (foo) { foo.bar(); }` into `foo?.bar();` by deleting the `if`, its
 * test and the braces, and making links of the body optional. Comments are
 * left in place instead of being moved.
 */
function getIfStatementFix(
  sourceCode: SourceCode,
  node: TSESTree.IfStatement,
  body: TSESTree.Node,
  optionalParts: boolean[],
): ReportFixFunction {
  return fixer => {
    const fixes: RuleFix[] = [];
    const bodyStatement =
      node.consequent.type === AST_NODE_TYPES.BlockStatement
        ? node.consequent.body[0]
        : node.consequent;

    const ifToken = nullThrows(
      sourceCode.getFirstToken(node),
      NullThrowsReasons.MissingToken('if', node.type),
    );
    // `if`, `(`, the test, `)` and `{`, each with the whitespace after it
    for (const token of [
      ifToken,
      ...sourceCode.getTokensBetween(ifToken, bodyStatement),
    ]) {
      const next = nullThrows(
        sourceCode.getTokenAfter(token, { includeComments: true }),
        NullThrowsReasons.MissingToken('any token', node.type),
      );
      fixes.push(fixer.removeRange([token.range[0], next.range[0]]));
    }

    if (node.consequent.type === AST_NODE_TYPES.BlockStatement) {
      const closingBrace = nullThrows(
        sourceCode.getLastToken(node.consequent),
        NullThrowsReasons.MissingToken('}', node.consequent.type),
      );
      const previous = nullThrows(
        sourceCode.getTokenBefore(closingBrace, { includeComments: true }),
        NullThrowsReasons.MissingToken('any token', node.consequent.type),
      );
      // The `}` ended the statement; without it, a following line could
      // continue the body's expression through automatic semicolon insertion.
      const needsSemicolon = !isSemicolonToken(
        nullThrows(
          sourceCode.getLastToken(bodyStatement),
          NullThrowsReasons.MissingToken('any token', bodyStatement.type),
        ),
      );
      fixes.push(
        fixer.replaceTextRange(
          [previous.range[1], closingBrace.range[1]],
          needsSemicolon ? ';' : '',
        ),
      );
    }

    const linkFixes = getOptionalLinkFixes(sourceCode, body);
    optionalParts.forEach((optional, index) => {
      const linkFix = linkFixes[index];
      if (optional && linkFix) {
        fixes.push(...linkFix(fixer));
      }
    });

    return fixes;
  };
}

function getReportDescriptor(
  sourceCode: SourceCode,
  parserServices: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
  operator: '&&' | '||',
  options: PreferOptionalChainOptions,
  subChain: ValidOperand[],
  lastChain: (LastChainOperandForReport | ValidOperand) | undefined,
): ReportDescriptor<PreferOptionalChainMessageIds> {
  const chain = lastChain ? [...subChain, lastChain] : subChain;
  const lastOperand = chain[chain.length - 1];

  let useSuggestionFixer: boolean;
  if (
    options.allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing ===
    true
  ) {
    // user has opted-in to the unsafe behavior
    useSuggestionFixer = false;
  }
  // optional chain specifically will union `undefined` into the final type
  // so we need to make sure that there is at least one operand that includes
  // `undefined`, or else we're going to change the final type - which is
  // unsafe and might cause downstream type errors.
  else if (lastChain) {
    useSuggestionFixer = true;
  } else if (
    lastOperand.comparisonType === NullishComparisonType.EqualNullOrUndefined ||
    lastOperand.comparisonType ===
      NullishComparisonType.NotEqualNullOrUndefined ||
    lastOperand.comparisonType === NullishComparisonType.StrictEqualUndefined ||
    lastOperand.comparisonType ===
      NullishComparisonType.NotStrictEqualUndefined ||
    (operator === '||' &&
      lastOperand.comparisonType === NullishComparisonType.NotBoolean)
  ) {
    // we know the last operand is an equality check - so the change in types
    // DOES NOT matter and will not change the runtime result or cause a type
    // check error
    useSuggestionFixer = false;
  } else {
    useSuggestionFixer = true;

    for (const operand of chain) {
      if (includesType(parserServices, operand.node, ts.TypeFlags.Undefined)) {
        useSuggestionFixer = false;
        break;
      }
    }

    // TODO - we could further reduce the false-positive rate of this check by
    //        checking for cases where the change in types don't matter like
    //        the test location of an if/while/etc statement.
    //        but it's quite complex to do this without false-negatives, so
    //        for now we'll just be over-eager with our matching.
    //
    //        it's MUCH better to false-positive here and only provide a
    //        suggestion fixer, rather than false-negative and autofix to
    //        broken code.
  }

  // In its most naive form we could just slap `?.` for every single part of the
  // chain. However this would be undesirable because it'd create unnecessary
  // conditions in the user's code where there were none before - and it would
  // cause errors with rules like our `no-unnecessary-condition`.
  //
  // Instead we want to include the minimum number of `?.` required to correctly
  // unify the code into a single chain. Naively you might think that we can
  // just take the final operand add `?.` after the locations from the previous
  // operands - however this won't be correct either because earlier operands
  // can include a necessary `?.` that's not needed or included in a later
  // operand.
  //
  // So instead what we need to do is to start at the first operand and
  // iteratively diff it against the next operand, and add the difference to the
  // first operand.
  //
  // eg
  // `foo && foo.bar && foo.bar.baz?.bam && foo.bar.baz.bam()`
  // 1) `foo`
  // 2) diff(`foo`, `foo.bar`) = `.bar`
  // 3) result = `foo?.bar`
  // 4) diff(`foo.bar`, `foo.bar.baz?.bam`) = `.baz?.bam`
  // 5) result = `foo?.bar?.baz?.bam`
  // 6) diff(`foo.bar.baz?.bam`, `foo.bar.baz.bam()`) = `()`
  // 7) result = `foo?.bar?.baz?.bam?.()`

  const parts = [];
  for (const current of chain) {
    const nextOperand = flattenChainExpression(
      sourceCode,
      current.comparedName,
    );
    const diff = nextOperand.slice(parts.length);
    if (diff.length > 0) {
      if (parts.length > 0) {
        // we need to make the first operand of the diff optional so it matches the
        // logic before merging
        // foo.bar && foo.bar.baz
        // diff = .baz
        // result = foo.bar?.baz
        diff[0].optional = true;
      }
      parts.push(...diff);
    }
  }

  if (node.type === AST_NODE_TYPES.IfStatement) {
    return {
      messageId: 'preferOptionalChain',
      node,
      ...getFixOrSuggest({
        fixOrSuggest: useSuggestionFixer ? 'suggest' : 'fix',
        suggestion: {
          fix: getIfStatementFix(
            sourceCode,
            node,
            lastOperand.node,
            parts.map(part => part.optional),
          ),
          messageId: 'optionalChainSuggest',
        },
      }),
    };
  }

  let newCode = parts
    .map(part => {
      let str = '';
      if (part.optional) {
        str += '?.';
      } else {
        if (part.nonNull) {
          str += '!';
        }
        if (part.requiresDot) {
          str += '.';
        }
      }
      if (
        part.precedence !== OperatorPrecedence.Invalid &&
        part.precedence < OperatorPrecedence.Member
      ) {
        str += `(${part.text})`;
      } else {
        str += part.text;
      }
      return str;
    })
    .join('');

  if (lastOperand.node.type === AST_NODE_TYPES.BinaryExpression) {
    // retain the ending comparison for cases like
    // x && x.a != null
    // x && typeof x.a !== 'undefined'
    const operator = lastOperand.node.operator;
    const { left, right } = (() => {
      if (lastOperand.isYoda) {
        const unaryOperator =
          lastOperand.node.right.type === AST_NODE_TYPES.UnaryExpression
            ? `${lastOperand.node.right.operator} `
            : '';

        return {
          left: sourceCode.getText(lastOperand.node.left),
          right: unaryOperator + newCode,
        };
      }
      const unaryOperator =
        lastOperand.node.left.type === AST_NODE_TYPES.UnaryExpression
          ? `${lastOperand.node.left.operator} `
          : '';
      return {
        left: unaryOperator + newCode,
        right: sourceCode.getText(lastOperand.node.right),
      };
    })();

    newCode = `${left} ${operator} ${right}`;
  } else if (lastOperand.comparisonType === NullishComparisonType.NotBoolean) {
    newCode = `!${newCode}`;
  }

  const reportRange = getReportRange(chain, node.range, sourceCode);

  const fix: ReportFixFunction = fixer => {
    let unclosedParens = 0;

    const tokensInRange = sourceCode.getTokens(node, {
      filter: token =>
        token.range[0] >= reportRange[0] && token.range[1] <= reportRange[1],
    });

    for (const token of tokensInRange) {
      if (isOpeningParenToken(token)) {
        unclosedParens++;
      } else if (isClosingParenToken(token)) {
        unclosedParens--;
      }
    }

    if (unclosedParens > 0 && reportRange[1] < node.range[1]) {
      const openParensOutsideRange: number[] = [];
      const unmatchedCloseParens: number[] = [];

      const tokensOutRange = sourceCode.getTokens(node, {
        filter: token => token.range[1] > reportRange[1],
      });

      for (const token of tokensOutRange) {
        if (isOpeningParenToken(token)) {
          openParensOutsideRange.push(token.range[0]);
        }
        if (isClosingParenToken(token)) {
          if (openParensOutsideRange.length > 0) {
            openParensOutsideRange.pop();
          } else {
            unmatchedCloseParens.push(token.range[0]);
          }
        }
      }

      let leftCode = sourceCode.getText(node);
      unmatchedCloseParens.reverse();
      for (const unmatchedParenIndex of unmatchedCloseParens) {
        leftCode =
          leftCode.slice(0, unmatchedParenIndex) +
          leftCode.slice(unmatchedParenIndex + 1);
      }

      leftCode = leftCode.slice(reportRange[1]);

      return fixer.replaceTextRange(node.range, newCode + leftCode);
    }

    return fixer.replaceTextRange(reportRange, newCode);
  };

  return {
    loc: {
      end: sourceCode.getLocFromIndex(reportRange[1]),
      start: sourceCode.getLocFromIndex(reportRange[0]),
    },
    messageId: 'preferOptionalChain',
    ...getFixOrSuggest({
      fixOrSuggest: useSuggestionFixer ? 'suggest' : 'fix',
      suggestion: {
        fix,
        messageId: 'optionalChainSuggest',
      },
    }),
  };

  interface FlattenedChain {
    nonNull: boolean;
    optional: boolean;
    precedence: OperatorPrecedence;
    requiresDot: boolean;
    text: string;
  }
  function flattenChainExpression(
    sourceCode: SourceCode,
    node: TSESTree.Node,
  ): FlattenedChain[] {
    switch (node.type) {
      case AST_NODE_TYPES.ChainExpression:
        return flattenChainExpression(sourceCode, node.expression);

      case AST_NODE_TYPES.CallExpression: {
        const argumentsText = (() => {
          const closingParenToken = nullThrows(
            sourceCode.getLastToken(node),
            NullThrowsReasons.MissingToken('closing parenthesis', node.type),
          );
          const openingParenToken = nullThrows(
            sourceCode.getFirstTokenBetween(
              node.typeArguments ?? node.callee,
              closingParenToken,
              isOpeningParenToken,
            ),
            NullThrowsReasons.MissingToken('opening parenthesis', node.type),
          );
          return sourceCode.text.substring(
            openingParenToken.range[0],
            closingParenToken.range[1],
          );
        })();

        const typeArgumentsText = (() => {
          if (node.typeArguments == null) {
            return '';
          }

          return sourceCode.getText(node.typeArguments);
        })();

        return [
          ...flattenChainExpression(sourceCode, node.callee),
          {
            nonNull: false,
            optional: node.optional,
            // no precedence for this
            precedence: OperatorPrecedence.Invalid,
            requiresDot: false,
            text: typeArgumentsText + argumentsText,
          },
        ];
      }

      case AST_NODE_TYPES.MemberExpression: {
        const propertyText = sourceCode.getText(node.property);
        return [
          ...flattenChainExpression(sourceCode, node.object),
          {
            nonNull: node.object.type === AST_NODE_TYPES.TSNonNullExpression,
            optional: node.optional,
            precedence: node.computed
              ? // computed is already wrapped in [] so no need to wrap in () as well
                OperatorPrecedence.Invalid
              : getOperatorPrecedenceForNode(node.property),
            requiresDot: !node.computed,
            text: node.computed ? `[${propertyText}]` : propertyText,
          },
        ];
      }

      case AST_NODE_TYPES.TSNonNullExpression:
        return flattenChainExpression(sourceCode, node.expression);

      default:
        return [
          {
            nonNull: false,
            optional: false,
            precedence: getOperatorPrecedenceForNode(node),
            requiresDot: false,
            text: sourceCode.getText(node),
          },
        ];
    }
  }
}

export function analyzeChain(
  context: RuleContext<
    PreferOptionalChainMessageIds,
    [PreferOptionalChainOptions]
  >,
  parserServices: ParserServicesWithTypeInformation,
  options: PreferOptionalChainOptions,
  node: TSESTree.Node,
  operator: TSESTree.LogicalExpression['operator'],
  chain: ValidOperand[],
  lastChainOperand?: LastChainOperand,
): boolean {
  // need at least 2 operands in a chain for it to be a chain
  if (
    chain.length + (lastChainOperand ? 1 : 0) <= 1 ||
    /* istanbul ignore next -- previous checks make this unreachable, but keep it for exhaustiveness check */
    operator === '??'
  ) {
    return false;
  }

  const analyzeOperand = (() => {
    switch (operator) {
      case '&&':
        return analyzeAndChainOperand;

      case '||':
        return analyzeOrChainOperand;
    }
  })();

  // Things like x !== null && x !== undefined have two nodes, but they are
  // one logical unit here, so we'll allow them to be grouped.
  let subChain: (readonly ValidOperand[] | ValidOperand)[] = [];
  let lastChain: LastChainOperandForReport | ValidOperand | undefined =
    undefined;
  let reported = false;

  const maybeReportThenReset = (
    newChainSeed?: readonly [ValidOperand, ...ValidOperand[]],
  ): void => {
    const subChainFlat = subChain.flat();
    // An `if` statement can only become a chain when its whole test and its
    // body do, e.g. not `if (unrelated && foo) foo.bar()`.
    const coversIfStatement =
      node.type !== AST_NODE_TYPES.IfStatement ||
      (!lastChain &&
        subChainFlat[0] === chain[0] &&
        subChainFlat.at(-1) === chain.at(-1));
    if (subChain.length + (lastChain ? 1 : 0) > 1 && coversIfStatement) {
      const maybeNullishNodes = lastChain
        ? subChainFlat.map(({ node }) => node)
        : subChainFlat.slice(0, -1).map(({ node }) => node);
      reported =
        checkNullishAndReport(
          context,
          parserServices,
          options,
          maybeNullishNodes,
          getReportDescriptor(
            context.sourceCode,
            parserServices,
            node,
            operator,
            options,
            subChainFlat,
            lastChain,
          ),
        ) || reported;
    }

    // we've reached the end of a chain of logical expressions
    // i.e. the current operand doesn't belong to the previous chain.
    //
    // we don't want to throw away the current operand otherwise we will skip it
    // and that can cause us to miss chains. So instead we seed the new chain
    // with the current operand
    //
    // eg this means we can catch cases like:
    //     unrelated != null && foo != null && foo.bar != null;
    //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ first "chain"
    //                          ^^^^^^^^^^^ newChainSeed
    //                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ second chain
    subChain = newChainSeed ? [newChainSeed] : [];
    lastChain = undefined;
  };

  for (let i = 0; i < chain.length; i += 1) {
    const lastOperand = subChain.flat().at(-1);
    const operand = chain[i];

    const validatedOperands = analyzeOperand(parserServices, operand, i, chain);
    if (!validatedOperands) {
      // TODO - #7170
      // check if the name is a superset/equal - if it is, then it likely
      // intended to be part of the chain and something we should include in the
      // report, eg
      //     foo == null || foo.bar;
      //     ^^^^^^^^^^^ valid OR chain
      //                    ^^^^^^^ invalid OR chain logical, but still part of
      //                            the chain for combination purposes

      if (lastOperand) {
        const comparisonResult = compareNodes(
          lastOperand.comparedName,
          operand.comparedName,
        );
        switch (operand.comparisonType) {
          case NullishComparisonType.StrictEqualUndefined:
          case NullishComparisonType.NotStrictEqualUndefined: {
            if (comparisonResult === NodeComparisonResult.Subset) {
              lastChain = operand;
            }
            break;
          }
        }
      }
      maybeReportThenReset();
      continue;
    }
    // in case multiple operands were consumed - make sure to correctly increment the index
    i += validatedOperands.length - 1;

    const currentOperand = validatedOperands[0];
    if (lastOperand) {
      const comparisonResult = compareNodes(
        lastOperand.comparedName,
        // purposely inspect and push the last operand because the prior operands don't matter
        // this also means we won't false-positive in cases like
        // foo !== null && foo !== undefined
        validatedOperands[validatedOperands.length - 1].comparedName,
      );

      if (comparisonResult === NodeComparisonResult.Subset) {
        if (
          operator === '||' &&
          currentOperand.comparisonType ===
            NullishComparisonType.StrictEqualNull &&
          // A paired `[=== null, === undefined]` operand is semantically safe
          // because it merges to `== null`. Only a lone `=== null` can produce
          // a broken strict-equality check in the merged chain.
          validatedOperands.length === 1 &&
          subChain
            .flat()
            .some(
              operand =>
                operand.comparisonType ===
                NullishComparisonType.StrictEqualUndefined,
            )
        ) {
          // For OR chains that contain a `=== undefined` guard anywhere,
          // extending the chain with a lone `=== null` subset changes
          // semantics: when the guarded node is undefined, `node?.child`
          // returns `undefined`, and `undefined === null` is false (strict),
          // but the original `=== undefined` guard was true.
          //
          // e.g. `foo === undefined || foo.bar === null` must NOT merge to
          // `foo?.bar === null`, and neither should a mid-chain form like
          // `a == null || a.b === undefined || a.b.c === null`.
          maybeReportThenReset(validatedOperands);
        } else {
          // the operands are comparable, so we can continue searching
          subChain.push(currentOperand);
        }
      } else if (comparisonResult === NodeComparisonResult.Invalid) {
        maybeReportThenReset(validatedOperands);
      } else {
        // purposely don't push this case because the node is a no-op and if
        // we consider it then we might report on things like
        // foo && foo
      }
    } else {
      subChain.push(currentOperand);
    }
  }

  const lastOperand = subChain.flat().at(-1);

  if (lastOperand && lastChainOperand) {
    const isValidLastChainOperand =
      operator === '&&'
        ? isValidAndLastChainOperand
        : isValidOrLastChainOperand;

    const { comparedName, comparisonValue, isSubset, isYoda } =
      resolveOperandSubset(lastOperand, lastChainOperand);
    if (
      isSubset &&
      isValidLastChainOperand(
        comparisonValue,
        lastChainOperand.comparisonType,
        parserServices,
      )
    ) {
      lastChain = {
        ...lastChainOperand,
        comparedName,
        comparisonValue,
        isYoda,
      };
    }
  }
  // check the leftovers
  maybeReportThenReset();

  return reported;
}
