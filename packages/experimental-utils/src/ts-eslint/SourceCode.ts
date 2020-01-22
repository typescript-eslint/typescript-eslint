/* eslint-disable @typescript-eslint/no-namespace */

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

  isSpaceBetween(
    first: TSESTree.Token | TSESTree.Node,
    second: TSESTree.Token | TSESTree.Node,
  ): boolean;

  /**
   * @deprecated in favor of isSpaceBetween()
   */
  isSpaceBetweenTokens(first: TSESTree.Token, second: TSESTree.Token): boolean;

  getLocFromIndex(index: number): TSESTree.LineAndColumnData;

  getIndexFromLoc(location: TSESTree.LineAndColumnData): number;

  // Inherited methods from TokenStore
  // ---------------------------------

  getTokenByRangeStart<T extends { includeComments?: boolean }>(
    offset: number,
    options?: T,
  ): T extends { includeComments: true }
    ? TSESTree.Token | TSESTree.Comment | null
    : TSESTree.Token | null;

  getFirstToken<T extends SourceCode.CursorWithSkipOptions>(
    node: TSESTree.Node,
    options?: T,
  ): T extends { includeComments: true }
    ? TSESTree.Token | TSESTree.Comment | null
    : TSESTree.Token | null;

  getFirstTokens<T extends SourceCode.CursorWithCountOptions>(
    node: TSESTree.Node,
    options?: T,
  ): T extends { includeComments: true }
    ? (TSESTree.Token | TSESTree.Comment)[]
    : TSESTree.Token[];

  getLastToken<T extends SourceCode.CursorWithSkipOptions>(
    node: TSESTree.Node,
    options?: T,
  ): T extends { includeComments: true }
    ? TSESTree.Token | TSESTree.Comment | null
    : TSESTree.Token | null;

  getLastTokens<T extends SourceCode.CursorWithCountOptions>(
    node: TSESTree.Node,
    options?: T,
  ): T extends { includeComments: true }
    ? (TSESTree.Token | TSESTree.Comment)[]
    : TSESTree.Token[];

  getTokenBefore<T extends SourceCode.CursorWithSkipOptions>(
    node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: T,
  ): T extends { includeComments: true }
    ? TSESTree.Token | TSESTree.Comment | null
    : TSESTree.Token | null;

  getTokensBefore<T extends SourceCode.CursorWithCountOptions>(
    node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: T,
  ): T extends { includeComments: true }
    ? (TSESTree.Token | TSESTree.Comment)[]
    : TSESTree.Token[];

  getTokenAfter<T extends SourceCode.CursorWithSkipOptions>(
    node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: T,
  ): T extends { includeComments: true }
    ? TSESTree.Token | TSESTree.Comment | null
    : TSESTree.Token | null;

  getTokensAfter<T extends SourceCode.CursorWithCountOptions>(
    node: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: T,
  ): T extends { includeComments: true }
    ? (TSESTree.Token | TSESTree.Comment)[]
    : TSESTree.Token[];

  getFirstTokenBetween<T extends SourceCode.CursorWithSkipOptions>(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: T,
  ): T extends { includeComments: true }
    ? TSESTree.Token | TSESTree.Comment | null
    : TSESTree.Token | null;

  getFirstTokensBetween<T extends SourceCode.CursorWithCountOptions>(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: T,
  ): T extends { includeComments: true }
    ? (TSESTree.Token | TSESTree.Comment)[]
    : TSESTree.Token[];

  getLastTokenBetween<T extends SourceCode.CursorWithSkipOptions>(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: T,
  ): T extends { includeComments: true }
    ? TSESTree.Token | TSESTree.Comment | null
    : TSESTree.Token | null;

  getLastTokensBetween<T extends SourceCode.CursorWithCountOptions>(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    options?: T,
  ): T extends { includeComments: true }
    ? (TSESTree.Token | TSESTree.Comment)[]
    : TSESTree.Token[];

  getTokensBetween<T extends SourceCode.CursorWithCountOptions>(
    left: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    right: TSESTree.Node | TSESTree.Token | TSESTree.Comment,
    padding?: T,
  ): T extends { includeComments: true }
    ? (TSESTree.Token | TSESTree.Comment)[]
    : TSESTree.Token[];

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
