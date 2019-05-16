/* eslint-disable @typescript-eslint/no-namespace, no-redeclare */

import { ParserServices, TSESTree } from '@typescript-eslint/typescript-estree';
import { SourceCode as ESLintSourceCode } from 'eslint';
import { Scope } from './Scope';

declare interface SourceCode {
  text: string;
  ast: SourceCode.Program;
  lines: string[];
  hasBOM: boolean;
  parserServices: ParserServices;
  scopeManager: Scope.ScopeManager;
  visitorKeys: SourceCode.VisitorKeys;
  tokensAndComments: (TSESTree.Comment | TSESTree.Token)[];

  getText(
    node?: TSESTree.Node,
    beforeCount?: number,
    afterCount?: number,
  ): string;

  getLines(): string[];

  getAllComments(): TSESTree.Comment[];

  getComments(
    node: TSESTree.Node,
  ): { leading: TSESTree.Comment[]; trailing: TSESTree.Comment[] };

  getJSDocComment(node: TSESTree.Node): TSESTree.Node | TSESTree.Token | null;

  getNodeByRangeIndex(index: number): TSESTree.Node | null;

  isSpaceBetweenTokens(first: TSESTree.Token, second: TSESTree.Token): boolean;

  getLocFromIndex(index: number): TSESTree.LineAndColumnData;

  getIndexFromLoc(location: TSESTree.LineAndColumnData): number;

  // Inherited methods from TokenStore
  // ---------------------------------

  getTokenByRangeStart(
    offset: number,
    options?: { includeComments?: boolean },
  ): TSESTree.Token | null;

  getFirstToken(
    node: TSESTree.Node,
    options?: SourceCode.CursorWithSkipOptions,
  ): TSESTree.Token | null;

  getFirstTokens(
    node: TSESTree.Node,
    options?: SourceCode.CursorWithCountOptions,
  ): TSESTree.Token[];

  getLastToken(
    node: TSESTree.Node,
    options?: SourceCode.CursorWithSkipOptions,
  ): TSESTree.Token | null;

  getLastTokens(
    node: TSESTree.Node,
    options?: SourceCode.CursorWithCountOptions,
  ): TSESTree.Token[];

  getTokenBefore(
    node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: SourceCode.CursorWithSkipOptions,
  ): TSESTree.Token | null;

  getTokensBefore(
    node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: SourceCode.CursorWithCountOptions,
  ): TSESTree.Token[];

  getTokenAfter(
    node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: SourceCode.CursorWithSkipOptions,
  ): TSESTree.Token | null;

  getTokensAfter(
    node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: SourceCode.CursorWithCountOptions,
  ): TSESTree.Token[];

  getFirstTokenBetween(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: SourceCode.CursorWithSkipOptions,
  ): TSESTree.Token | null;

  getFirstTokensBetween(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: SourceCode.CursorWithCountOptions,
  ): TSESTree.Token[];

  getLastTokenBetween(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: SourceCode.CursorWithSkipOptions,
  ): TSESTree.Token | null;

  getLastTokensBetween(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: SourceCode.CursorWithCountOptions,
  ): TSESTree.Token[];

  getTokensBetween(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    padding?:
      | number
      | SourceCode.FilterPredicate
      | SourceCode.CursorWithCountOptions,
  ): TSESTree.Token[];

  getTokens(
    node: TSESTree.Node,
    beforeCount?: number,
    afterCount?: number,
  ): TSESTree.Token[];
  getTokens(
    node: TSESTree.Node,
    options: SourceCode.FilterPredicate | SourceCode.CursorWithCountOptions,
  ): TSESTree.Token[];

  commentsExistBetween(
    left: TSESTree.Node | TSESTree.Token,
    right: TSESTree.Node | TSESTree.Token,
  ): boolean;

  getCommentsBefore(
    nodeOrToken: TSESTree.Node | TSESTree.Token,
  ): TSESTree.Comment[];

  getCommentsAfter(
    nodeOrToken: TSESTree.Node | TSESTree.Token,
  ): TSESTree.Comment[];

  getCommentsInside(node: TSESTree.Node): TSESTree.Comment[];
}

namespace SourceCode {
  export interface Program extends TSESTree.Program {
    comments: TSESTree.Comment[];
    tokens: TSESTree.Token[];
  }

  export interface Config {
    text: string;
    ast: Program;
    parserServices?: ParserServices;
    scopeManager?: Scope.ScopeManager;
    visitorKeys?: VisitorKeys;
  }

  export interface VisitorKeys {
    [nodeType: string]: string[];
  }

  export type FilterPredicate = (
    tokenOrComment: TSESTree.Token | TSESTree.Comment,
  ) => boolean;

  export type CursorWithSkipOptions =
    | number
    | FilterPredicate
    | {
        includeComments?: boolean;
        filter?: FilterPredicate;
        skip?: number;
      };

  export type CursorWithCountOptions =
    | number
    | FilterPredicate
    | {
        includeComments?: boolean;
        filter?: FilterPredicate;
        count?: number;
      };
}

const SourceCode = ESLintSourceCode as {
  new (text: string, ast: SourceCode.Program): SourceCode;
  new (config: SourceCode.Config): SourceCode;

  // static methods
  splitLines(text: string): string[];
};

export { SourceCode };
