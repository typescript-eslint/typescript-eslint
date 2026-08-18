import type {
  ParserServicesWithTypeInformation,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

export const TYPE_STRING_MAX_LENGTH = 80;
export const MAX_ANALYSIS_WORK = 10_000;
export const MAX_ANALYSIS_SYNTAX_DEPTH = 256;

/**
 * Maximum nesting depth of structural positions the analyzer projects into.
 * The work budget bounds how many checker operations run, but each
 * operation's own cost grows with the depth of the types involved, so an
 * operation count alone cannot bound wall-clock time on pathologically deep
 * types. A depth bound is deterministic across machines, unlike a time
 * budget, so the same code produces the same diagnostics everywhere.
 */
export const MAX_ANALYSIS_TYPE_DEPTH = 32;
export const MAX_ARRAY_INDEX = 0xffff_ffff;
export const STATIC_SWITCH_NO_ENTRY = -1;
export const STATIC_SWITCH_UNKNOWN = -2;

export const ARRAY_NAMES = [
  'Array',
  'ArrayLike',
  'ConcatArray',
  'ReadonlyArray',
];
export const ASYNC_ITERABLE_NAMES = [
  'AsyncGenerator',
  'AsyncIterable',
  'AsyncIterableIterator',
  'AsyncIterator',
];
export const GENERATOR_NAMES = [
  'AsyncGenerator',
  'AsyncIterable',
  'AsyncIterableIterator',
  'AsyncIterator',
  'Generator',
  'Iterable',
  'IterableIterator',
  'Iterator',
];
export const MAP_NAMES = ['Map', 'ReadonlyMap', 'WeakMap'];
export const SET_NAMES = ['ReadonlySet', 'Set', 'WeakSet'];
export const STRUCTURAL_DEFAULT_LIBRARY_NAMES = ['TypedPropertyDescriptor'];
export const VALUE_WRAPPER_NAMES = [
  'IteratorReturnResult',
  'IteratorYieldResult',
  'PromiseFulfilledResult',
];
export const WEAK_REF_NAMES = ['WeakRef'];

export type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

export type FunctionLikeDeclarationWithBody = ts.FunctionLikeDeclaration & {
  body: ts.ConciseBody;
};

export type MessageIds = 'misleadingReturnType';
export type RuleContext = Readonly<TSESLint.RuleContext<MessageIds, []>>;

export interface RuleDependencies {
  checker: ts.TypeChecker;
  context: RuleContext;
  program: ts.Program;
  services: ParserServicesWithTypeInformation;
}

export interface Observation {
  node: ts.Node;
  type?: ts.Type;
}

export interface ResolvedObservation extends Observation {
  type: ts.Type;
}

export interface AnalysisPath {
  depth: number;
  parent: AnalysisPath | undefined;
  type: ts.Type;
}

export interface ResolvedAnalysisTask {
  anchor: ts.Node;
  observations: readonly Observation[];
  path: AnalysisPath | undefined;
  type: ts.Type;
  unused: ts.Type[];
}

export interface PropertyProjection {
  alwaysPresent: boolean;
  observations: Observation[];
}

export interface SignatureParameterDomain {
  prefix: { type: ts.Type; required: boolean }[];
  rest: ts.Type | undefined;
  suffix: { type: ts.Type; required: boolean }[];
}

/** An `any`, `unknown`, or checker error type proves nothing either way. */
export function isUncertain(type: ts.Type): boolean {
  return (
    tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown) ||
    tsutils.isIntrinsicErrorType(type)
  );
}

/**
 * Deferred constructs cannot be compared until type parameters are
 * instantiated.
 */
export function isDeferredType(type: ts.Type): boolean {
  return (
    tsutils.isTypeFlagSet(
      type,
      ts.TypeFlags.Conditional |
        ts.TypeFlags.Index |
        ts.TypeFlags.IndexedAccess |
        ts.TypeFlags.Substitution,
    ) ||
    (tsutils.isObjectType(type) &&
      tsutils.isObjectFlagSet(type, ts.ObjectFlags.Mapped))
  );
}

export function truncateTypeString(type: string): string {
  return type.length > TYPE_STRING_MAX_LENGTH
    ? `${type.slice(0, TYPE_STRING_MAX_LENGTH)}...`
    : type;
}

export function isRuntimeFunctionLike(
  node: ts.Node,
): node is ts.FunctionLikeDeclaration {
  // `ts.isFunctionLike` also includes signature-only type nodes. Runtime
  // function declarations are the members of that union that carry `body`.
  return ts.isFunctionLike(node) && 'body' in node;
}

export function isRuntimeFunctionLikeWithBody(
  node: ts.Node,
): node is FunctionLikeDeclarationWithBody {
  return isRuntimeFunctionLike(node) && node.body != null;
}

export function hasAnyDecorators(node: ts.Node): boolean {
  // `ts-api-utils.hasDecorators` narrows nodes that can carry decorators; it
  // does not test whether a node actually has any.
  return (
    ts.canHaveDecorators(node) && (ts.getDecorators(node)?.length ?? 0) > 0
  );
}
