import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { TSESTree } from './ts-estree';

import { getLocFor } from './node-utils';
import { AST_TOKEN_TYPES } from './ts-estree';

/**
 * Convert all comments for the given AST.
 * @param ast the AST object
 * @returns the converted ESTreeComment
 * @private
 */
export function convertComments(ast: ts.SourceFile): TSESTree.Comment[] {
  return Array.from(
    tsutils.iterateComments(ast),
    ({ end, kind, pos, value }) => {
      const type =
        kind === ts.SyntaxKind.SingleLineCommentTrivia
          ? AST_TOKEN_TYPES.Line
          : AST_TOKEN_TYPES.Block;
      const range: TSESTree.Range = [pos, end];
      const loc = getLocFor(range, ast);

      return {
        type,
        loc,
        range,
        value,
      };
    },
  );
}
