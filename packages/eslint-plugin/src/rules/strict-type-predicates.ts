import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';
import {
  isIdentifier,
  isLiteralExpression,
  isTypeFlagSet,
  isUnionType,
  isStrictCompilerOptionEnabled,
} from 'tsutils';

type Options = [
  {
    typesToIgnore?: string[];
  },
];
type MessageIds =
  | 'expressionAlwaysFalse'
  | 'expressionAlwaysTrue'
  | 'badTypeof'
  | 'useStrictlyUndefined'
  | 'useStrictlyNotUndefined'
  | 'useStrictlyNull'
  | 'useStrictlyNotNull';

export default util.createRule<Options, MessageIds>({
  name: 'strict-type-predicates',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow always true (or false) type predicates',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      expressionAlwaysFalse: 'Expression is always false.',
      expressionAlwaysTrue: 'Expression is always true.',
      badTypeof: "Bad comparison for 'typeof'.",
      useStrictlyUndefined: "Use '=== undefined' instead.",
      useStrictlyNotUndefined: "Use '=== undefined' instead.",
      useStrictlyNull: "Use '=== null' instead.",
      useStrictlyNotNull: "Use '!== null' instead.",
    },
    schema: [],
  },
  defaultOptions: [{}],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const compilerOptions = parserServices.program.getCompilerOptions();

    function checkEquals(
      node: ts.BinaryExpression,
      esNode: TSESTree.Node,
      { isStrict, isPositive }: EqualsKind,
    ): void {
      isPositive;

      const exprPred = getTypePredicate(node, isStrict);
      if (exprPred === undefined) {
        return;
      }

      if (exprPred.kind === TypePredicateKind.TypeofTypo) {
        fail('badTypeof');
        return;
      }

      const exprType = checker.getTypeAtLocation(exprPred.expression);
      // TODO: could use checker.getBaseConstraintOfType to help with type parameters, but it's not publicly exposed.
      if (
        isTypeFlagSet(
          exprType,
          ts.TypeFlags.Any | ts.TypeFlags.TypeParameter | ts.TypeFlags.Unknown,
        )
      ) {
        return;
      }

      switch (exprPred.kind) {
        case TypePredicateKind.Plain: {
          const { predicate, isNullOrUndefined } = exprPred;
          const value = getConstantBoolean(exprType, predicate);
          // 'null'/'undefined' are the only two values *not* assignable to '{}'.
          if (
            value !== undefined &&
            (isNullOrUndefined || !isEmptyType(checker, exprType))
          ) {
            fail(
              value === isPositive
                ? 'expressionAlwaysTrue'
                : 'expressionAlwaysFalse',
            );
          }
          break;
        }

        case TypePredicateKind.NonStructNullUndefined: {
          const result = testNonStrictNullUndefined(exprType);
          if (result !== undefined) {
            fail(
              typeof result === 'boolean'
                ? result === isPositive
                  ? 'expressionAlwaysTrue'
                  : 'expressionAlwaysFalse'
                : result === 'null'
                ? isPositive
                  ? 'useStrictlyNull'
                  : 'useStrictlyNotNull'
                : isPositive
                ? 'useStrictlyUndefined'
                : 'useStrictlyNotUndefined',
            );
          }
        }
      }

      function fail(failure: MessageIds): void {
        context.report({ node: esNode, messageId: failure });
      }
    }

    /** Detects a type predicate given `left === right`. */
    function getTypePredicate(
      node: ts.BinaryExpression,
      isStrictEquals: boolean,
    ): TypePredicate | undefined {
      const { left, right } = node;
      const lr = getTypePredicateOneWay(left, right, isStrictEquals);
      return lr !== undefined
        ? lr
        : getTypePredicateOneWay(right, left, isStrictEquals);
    }

    /** Only gets the type predicate if the expression is on the left. */
    function getTypePredicateOneWay(
      left: ts.Expression,
      right: ts.Expression,
      isStrictEquals: boolean,
    ): TypePredicate | undefined {
      switch (right.kind) {
        case ts.SyntaxKind.TypeOfExpression: {
          const expression = (right as ts.TypeOfExpression).expression;
          if (!isLiteralExpression(left)) {
            if (
              (isIdentifier(left) && left.text === 'undefined') ||
              left.kind === ts.SyntaxKind.NullKeyword ||
              left.kind === ts.SyntaxKind.TrueKeyword ||
              left.kind === ts.SyntaxKind.FalseKeyword
            ) {
              return { kind: TypePredicateKind.TypeofTypo };
            }
            return undefined;
          }
          const predicate = getTypePredicateForKind(left.text);
          return predicate === undefined
            ? { kind: TypePredicateKind.TypeofTypo }
            : {
                expression,
                isNullOrUndefined: left.text === 'undefined',
                kind: TypePredicateKind.Plain,
                predicate,
              };
        }

        case ts.SyntaxKind.NullKeyword:
          return nullOrUndefined(ts.TypeFlags.Null);

        case ts.SyntaxKind.Identifier:
          if (
            (right as ts.Identifier).originalKeywordKind ===
            ts.SyntaxKind.UndefinedKeyword
          ) {
            return nullOrUndefined(undefinedFlags);
          }
          return undefined;
        default:
          return undefined;
      }

      function nullOrUndefined(flags: ts.TypeFlags): TypePredicate {
        return isStrictEquals
          ? {
              expression: left,
              isNullOrUndefined: true,
              kind: TypePredicateKind.Plain,
              predicate: flagPredicate(flags),
            }
          : {
              kind: TypePredicateKind.NonStructNullUndefined,
              expression: left,
            };
      }
    }

    return isStrictCompilerOptionEnabled(compilerOptions, 'strictNullChecks')
      ? {
          BinaryExpression(node: TSESTree.BinaryExpression): void {
            const equals = getEqualsKind(node.operator);
            if (equals !== undefined) {
              const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
              checkEquals(tsNode as ts.BinaryExpression, node, equals);
            }
          },
        }
      : // TODO: emit warning that strictNullChecks is required
        {};
  },
});

function isEmptyType(checker: ts.TypeChecker, type: ts.Type): boolean {
  return checker.typeToString(type) === '{}';
}

const undefinedFlags = ts.TypeFlags.Undefined | ts.TypeFlags.Void;

type TypePredicate =
  | PlainTypePredicate
  | NonStrictNullUndefinedPredicate
  | { kind: TypePredicateKind.TypeofTypo };
interface PlainTypePredicate {
  kind: TypePredicateKind.Plain;
  expression: ts.Expression;
  predicate: Predicate;
  isNullOrUndefined: boolean;
}

/** For `== null` and the like. */
interface NonStrictNullUndefinedPredicate {
  kind: TypePredicateKind.NonStructNullUndefined;
  expression: ts.Expression;
}
const enum TypePredicateKind {
  Plain,
  NonStructNullUndefined,
  TypeofTypo,
}
type Predicate = (type: ts.Type) => boolean;

export interface EqualsKind {
  isPositive: boolean; // True for "===" and "=="
  isStrict: boolean; // True for "===" and "!=="
}

export function getEqualsKind(operator: string): EqualsKind | undefined {
  switch (operator) {
    case '==':
      return { isPositive: true, isStrict: false };
    case '===':
      return { isPositive: true, isStrict: true };
    case '!=':
      return { isPositive: false, isStrict: false };
    case '!==':
      return { isPositive: false, isStrict: true };
    default:
      return undefined;
  }
}

function unionParts(type: ts.Type): ts.Type[] {
  return isUnionType(type) ? type.types : [type];
}

function flagPredicate(testedFlag: ts.TypeFlags): Predicate {
  return (type): boolean => isTypeFlagSet(type, testedFlag);
}

function getTypePredicateForKind(kind: string): Predicate | undefined {
  switch (kind) {
    case 'undefined':
      return flagPredicate(undefinedFlags);
    case 'boolean':
      return flagPredicate(ts.TypeFlags.BooleanLike);
    case 'number':
      return flagPredicate(ts.TypeFlags.NumberLike);
    case 'string':
      return flagPredicate(ts.TypeFlags.StringLike);
    case 'symbol':
      return flagPredicate(ts.TypeFlags.ESSymbol);
    case 'function':
      return isFunction;
    case 'object': {
      // It's an object if it's not any of the above.
      const allFlags =
        ts.TypeFlags.Undefined |
        ts.TypeFlags.Void |
        ts.TypeFlags.BooleanLike |
        ts.TypeFlags.NumberLike |
        ts.TypeFlags.StringLike |
        ts.TypeFlags.ESSymbol;
      return (type): boolean =>
        !isTypeFlagSet(type, allFlags) && !isFunction(type);
    }
    default:
      return undefined;
  }
}

function isFunction(t: ts.Type): boolean {
  if (
    t.getConstructSignatures().length !== 0 ||
    t.getCallSignatures().length !== 0
  ) {
    return true;
  }
  const symbol = t.getSymbol();
  return symbol !== undefined && symbol.getName() === 'Function';
}

/** Returns bool for always/never true, or a string to recommend strict equality. */
function testNonStrictNullUndefined(
  type: ts.Type,
): boolean | 'null' | 'undefined' | undefined {
  let anyNull = false;
  let anyUndefined = false;
  let anyOther = false;
  for (const ty of unionParts(type)) {
    if (isTypeFlagSet(ty, ts.TypeFlags.Null)) {
      anyNull = true;
    } else if (isTypeFlagSet(ty, undefinedFlags)) {
      anyUndefined = true;
    } else {
      anyOther = true;
    }
  }

  return !anyOther
    ? true
    : anyNull && anyUndefined
    ? undefined
    : anyNull
    ? 'null'
    : anyUndefined
    ? 'undefined'
    : false;
}

/** Returns a boolean value if that should always be the result of a type predicate. */
function getConstantBoolean(
  type: ts.Type,
  predicate: (t: ts.Type) => boolean,
): boolean | undefined {
  let anyTrue = false;
  let anyFalse = false;
  for (const ty of unionParts(type)) {
    if (predicate(ty)) {
      anyTrue = true;
    } else {
      anyFalse = true;
    }

    if (anyTrue && anyFalse) {
      return undefined;
    }
  }

  return anyTrue;
}
