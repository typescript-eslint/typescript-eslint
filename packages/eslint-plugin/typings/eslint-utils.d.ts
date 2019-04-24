declare module 'eslint-utils' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import { Scope, SourceCode } from 'ts-eslint';

  export function getFunctionHeadLocation(
    node:
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | TSESTree.ArrowFunctionExpression,
    sourceCode: SourceCode,
  ): TSESTree.SourceLocation;

  export function getFunctionNameWithKind(
    node:
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | TSESTree.ArrowFunctionExpression,
  ): string;

  export function getPropertyName(
    node:
      | TSESTree.MemberExpression
      | TSESTree.Property
      | TSESTree.MethodDefinition,
    initialScope?: Scope.Scope,
  ): string | null;

  export function getStaticValue(
    node: TSESTree.Node,
    initialScope?: Scope.Scope,
  ): { value: any } | null;

  export function getStringIfConstant(
    node: TSESTree.Node,
    initialScope?: Scope.Scope,
  ): string | null;

  export function hasSideEffect(
    node: TSESTree.Node,
    sourceCode: SourceCode,
    options?: {
      considerGetters?: boolean;
      considerImplicitTypeConversion?: boolean;
    },
  ): boolean;

  export function isParenthesized(
    node: TSESTree.Node,
    sourceCode: SourceCode,
  ): boolean;

  export class PatternMatcher {
    constructor(pattern: RegExp, options?: { escaped?: boolean });
    execAll(str: string): IterableIterator<RegExpExecArray>;
    test(str: string): boolean;
  }

  export function findVariable(
    initialScope: Scope.Scope,
    name: string,
  ): Scope.Variable | null;

  export function getInnermostScope(
    initialScope: Scope.Scope,
    node: TSESTree.Node,
  ): Scope.Scope;

  export class ReferenceTracker {
    static readonly READ: unique symbol;
    static readonly CALL: unique symbol;
    static readonly CONSTRUCT: unique symbol;

    constructor(
      globalScope: Scope.Scope,
      options?: {
        mode: 'strict' | 'legacy';
        globalObjectNames: readonly string[];
      },
    );

    iterateGlobalReferences<T>(
      traceMap: ReferenceTracker.TraceMap<T>,
    ): IterableIterator<ReferenceTracker.FoundReference<T>>;
    iterateCjsReferences<T>(
      traceMap: ReferenceTracker.TraceMap<T>,
    ): IterableIterator<ReferenceTracker.FoundReference<T>>;
    iterateEsmReferences<T>(
      traceMap: ReferenceTracker.TraceMap<T>,
    ): IterableIterator<ReferenceTracker.FoundReference<T>>;
  }

  export namespace ReferenceTracker {
    export type READ = typeof ReferenceTracker.READ;
    export type CALL = typeof ReferenceTracker.READ;
    export type CONSTRUCT = typeof ReferenceTracker.READ;
    export type ReferenceType = READ | CALL | CONSTRUCT;
    export type TraceMap<T = any> = Record<string, TraceMapElement<T>>;
    export interface TraceMapElement<T> {
      [ReferenceTracker.READ]?: T;
      [ReferenceTracker.CALL]?: T;
      [ReferenceTracker.CONSTRUCT]?: T;
      [key: string]: TraceMapElement<T>;
    }
    export interface FoundReference<T = any> {
      node: TSESTree.Node;
      path: readonly string[];
      type: ReferenceType;
      entry: T;
    }
  }

  export function isArrowToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotArrowToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isClosingBraceToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotClosingBraceToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isClosingBracketToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotClosingBracketToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isClosingParenToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotClosingParenToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isColonToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotColonToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isCommaToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotCommaToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isCommentToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotCommentToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isOpeningBraceToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotOpeningBraceToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isOpeningBracketToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotOpeningBracketToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isOpeningParenToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotOpeningParenToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isSemicolonToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
  export function isNotSemicolonToken(
    token: TSESTree.Token | TSESTree.Comment,
  ): boolean;
}
