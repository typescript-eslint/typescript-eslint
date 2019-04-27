/* eslint-disable @typescript-eslint/no-namespace */

import { TSESTree } from '@typescript-eslint/typescript-estree';

namespace AST {
  export type TokenType =
    | 'Boolean'
    | 'Null'
    | 'Identifier'
    | 'Keyword'
    | 'Punctuator'
    | 'JSXIdentifier'
    | 'JSXText'
    | 'Numeric'
    | 'String'
    | 'RegularExpression';

  export interface Token {
    type: TokenType;
    value: string;
    range: Range;
    loc: SourceLocation;
  }

  export interface SourceLocation {
    start: TSESTree.LineAndColumnData;
    end: TSESTree.LineAndColumnData;
  }

  export type Range = [number, number];
}

export { AST };
