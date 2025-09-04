import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import type {
  ReportDescriptor,
  ReportFixFunction,
  RuleContext,
  SourceCode,
} from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isFalsyType, unionConstituents } from 'ts-api-utils';
import * as ts from 'typescript';

import type { LastChainOperand, ValidOperand } from './gatherLogicalOperands';
import type {
  PreferOptionalChainMessageIds,
  PreferOptionalChainOptions,
} from './PreferOptionalChainOptions';

import {
  getFixOrSuggest,
  getOperatorPrecedenceForNode,
  isClosingParenToken,
  isOpeningParenToken,
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
  OperandValidity,
} from './gatherLogicalOperands';

function includesType(
  parserServices: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
  typeFlagIn: ts.TypeFlags,
): boolean {
  const typeFlag = typeFlagIn | ts.TypeFlags.Any | ts.TypeFlags.Unknown;
  const types = unionConstituents(parserServices.getTypeAtLocation(node));
  for (const type of types) {
    if (isTypeFlagSet(type, typeFlag)) {
      return true;
    }
  }
  return false;
}

function isAlwaysTruthyOperand(
  comparedName: TSESTree.Node,
  nullishComparisonType: ComparisonType | NullishComparisonType,
  parserServices: ParserServicesWithTypeInformation,
): boolean {
  const ANY_UNKNOWN_FLAGS = ts.TypeFlags.Any | ts.TypeFlags.Unknown;
  const comparedNameType = parserServices.getTypeAtLocation(comparedName);

  if (isTypeFlagSet(comparedNameType, ANY_UNKNOWN_FLAGS)) {
    return false;
  }
  switch (nullishComparisonType) {
    case NullishComparisonType.Boolean:
    case NullishComparisonType.NotBoolean: {
      const types = unionConstituents(comparedNameType);
      return types.every(type => !isFalsyType(type));
    }
    case NullishComparisonType.NotStrictEqualUndefined:
    case NullishComparisonType.StrictEqualUndefined:
      return !isTypeFlagSet(comparedNameType, ts.TypeFlags.Undefined);
    case NullishComparisonType.NotStrictEqualNull:
    case NullishComparisonType.StrictEqualNull:
      return !isTypeFlagSet(comparedNameType, ts.TypeFlags.Null);
    case NullishComparisonType.NotEqualNullOrUndefined:
    case NullishComparisonType.EqualNullOrUndefined:
      return !isTypeFlagSet(
        comparedNameType,
        ts.TypeFlags.Null | ts.TypeFlags.Undefined,
      );
    default:
      return false;
  }
}

function isValidAndLastChainOperand(
  ComparisonValueType: TSESTree.Node,
  operator: TSESTree.BinaryExpression['operator'],
  parserServices: ParserServicesWithTypeInformation,
) {
  const type = parserServices.getTypeAtLocation(ComparisonValueType);
  const ANY_UNKNOWN_FLAGS = ts.TypeFlags.Any | ts.TypeFlags.Unknown;

  switch (operator) {
    case '==': {
      const types = unionConstituents(type);
      const isNullish = types.some(t =>
        isTypeFlagSet(
          t,
          ANY_UNKNOWN_FLAGS | ts.TypeFlags.Null | ts.TypeFlags.Undefined,
        ),
      );
      return !isNullish;
    }
    case '===': {
      const types = unionConstituents(type);
      const isUndefined = types.some(t =>
        isTypeFlagSet(t, ANY_UNKNOWN_FLAGS | ts.TypeFlags.Undefined),
      );
      return !isUndefined;
    }
    case '!=':
    case '!==':
      return false;
    default:
      return false;
  }
}
function isValidOrLastChainOperand(
  ComparisonValueType: TSESTree.Node,
  operator: TSESTree.BinaryExpression['operator'],
  parserServices: ParserServicesWithTypeInformation,
) {
  const type = parserServices.getTypeAtLocation(ComparisonValueType);
  const ANY_UNKNOWN_FLAGS = ts.TypeFlags.Any | ts.TypeFlags.Unknown;

  switch (operator) {
    case '!=': {
      const types = unionConstituents(type);
      const isNullish = types.some(t =>
        isTypeFlagSet(
          t,
          ANY_UNKNOWN_FLAGS | ts.TypeFlags.Null | ts.TypeFlags.Undefined,
        ),
      );
      return !isNullish;
    }
    case '!==': {
      const types = unionConstituents(type);
      const isUndefined = types.some(t =>
        isTypeFlagSet(t, ANY_UNKNOWN_FLAGS | ts.TypeFlags.Undefined),
      );
      return !isUndefined;
    }
    case '==':
    case '===':
      return false;
    default:
      return false;
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

/**
 * Returns the range that needs to be reported from the chain.
 * @param chain The chain of logical expressions.
 * @param boundary The boundary range that the range to report cannot fall outside.
 * @param sourceCode The source code to get tokens.
 * @returns The range to report.
 */
function getReportRange(
  chain: ValidOperand[],
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

function getReportDescriptor(
  sourceCode: SourceCode,
  parserServices: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
  operator: '&&' | '||',
  options: PreferOptionalChainOptions,
  chain: ValidOperand[],
): ReportDescriptor<PreferOptionalChainMessageIds> {
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
  else if (
    lastOperand.comparisonType === NullishComparisonType.EqualNullOrUndefined ||
    lastOperand.comparisonType ===
      NullishComparisonType.NotEqualNullOrUndefined ||
    lastOperand.comparisonType === NullishComparisonType.StrictEqualUndefined ||
    lastOperand.comparisonType ===
      NullishComparisonType.NotStrictEqualUndefined ||
    lastOperand.comparisonType === ComparisonType.Equal ||
    lastOperand.comparisonType === ComparisonType.NotEqual ||
    lastOperand.comparisonType === ComparisonType.NotStrictEqual ||
    lastOperand.comparisonType === ComparisonType.StrictEqual ||
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

  const fix: ReportFixFunction = fixer =>
    fixer.replaceTextRange(reportRange, newCode);

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
): void {
  // need at least 2 operands in a chain for it to be a chain
  if (
    chain.length + (lastChainOperand ? 1 : 0) <= 1 ||
    /* istanbul ignore next -- previous checks make this unreachable, but keep it for exhaustiveness check */
    operator === '??'
  ) {
    return;
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
  const maybeReportThenReset = (
    newChainSeed?: readonly [ValidOperand, ...ValidOperand[]],
  ): void => {
    if (subChain.length > 1) {
      const subChainFlat = subChain.flat();
      checkNullishAndReport(
        context,
        parserServices,
        options,
        subChainFlat.slice(0, -1).map(({ node }) => node),
        getReportDescriptor(
          context.sourceCode,
          parserServices,
          node,
          operator,
          options,
          subChainFlat,
        ),
      );
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
              subChain.push(operand);
            }
            break;
          }
          case NullishComparisonType.StrictEqualNull:
          case NullishComparisonType.NotStrictEqualNull: {
            if (
              comparisonResult === NodeComparisonResult.Subset &&
              isAlwaysTruthyOperand(
                lastOperand.comparedName,
                lastOperand.comparisonType,
                parserServices,
              )
            ) {
              subChain.push({
                ...operand,
                comparisonType: ComparisonType.NotStrictEqual,
              });
            }
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
        // the operands are comparable, so we can continue searching
        subChain.push(currentOperand);
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
    const comparisonResult = compareNodes(
      lastOperand.comparedName,
      lastChainOperand.comparedName,
    );
    const isValidLastChainOperand =
      operator === '&&'
        ? isValidAndLastChainOperand
        : isValidOrLastChainOperand;
    if (
      comparisonResult === NodeComparisonResult.Subset &&
      (isAlwaysTruthyOperand(
        lastOperand.comparedName,
        lastOperand.comparisonType,
        parserServices,
      ) ||
        isValidLastChainOperand(
          lastChainOperand.comparisonValue,
          lastChainOperand.node.operator,
          parserServices,
        ))
    ) {
      subChain.push({
        ...lastChainOperand,
        type: OperandValidity.Valid,
      });
    }
  }
  // check the leftovers
  maybeReportThenReset();
}
