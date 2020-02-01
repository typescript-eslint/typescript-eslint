import * as ts from 'typescript';
import { forEachComment } from 'tsutils/util/util';
import { getLocFor } from './node-utils';
import { AST_TOKEN_TYPES, TSESTree } from './ts-estree';

/**
 * Convert all comments for the given AST.
 * @param ast the AST object
 * @param code the TypeScript code
 * @returns the converted ESTreeComment
 * @private
 */
export function convertComments(
  ast: ts.SourceFile,
  code: string,
): TSESTree.Comment[] {
  const comments: TSESTree.Comment[] = [];

  forEachComment(
    ast,
    (_, comment) => {
      const type =
        comment.kind == ts.SyntaxKind.SingleLineCommentTrivia
          ? AST_TOKEN_TYPES.Line
          : AST_TOKEN_TYPES.Block;
      const range: TSESTree.Range = [comment.pos, comment.end];
      const loc = getLocFor(range[0], range[1], ast);

      // both comments start with 2 characters - /* or //
      const textStart = range[0] + 2;
      const textEnd =
        comment.kind === ts.SyntaxKind.SingleLineCommentTrivia
          ? // single line comments end at the end
            range[1] - textStart
          : // multiline comments end 2 characters early
            range[1] - textStart - 2;
      comments.push({
        type,
        value: code.substr(textStart, textEnd),
        range,
        loc,
      });
    },
    ast,
  );

  return comments;
}
