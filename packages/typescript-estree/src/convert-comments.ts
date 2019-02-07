import ts from 'typescript';
import { getLocFor, getNodeContainer } from './node-utils';
import * as TSESTree from './ts-estree';

/**
 * Converts a TypeScript comment to an Esprima comment.
 * @param block True if it's a block comment, false if not.
 * @param text The text of the comment.
 * @param start The index at which the comment starts.
 * @param end The index at which the comment ends.
 * @param startLoc The location at which the comment starts.
 * @param endLoc The location at which the comment ends.
 * @returns The comment object.
 * @internal
 */
function convertTypeScriptCommentToEsprimaComment(
  block: boolean,
  text: string,
  start: number,
  end: number,
  startLoc: TSESTree.LineAndColumnData,
  endLoc: TSESTree.LineAndColumnData
): TSESTree.Comment {
  const comment: TSESTree.OptionalRangeAndLoc<TSESTree.Comment> = {
    type: block ? 'Block' : 'Line',
    value: text
  };

  if (typeof start === 'number') {
    comment.range = [start, end];
  }

  if (typeof startLoc === 'object') {
    comment.loc = {
      start: startLoc,
      end: endLoc
    };
  }

  return comment as TSESTree.Comment;
}

/**
 * Convert comment from TypeScript Triva Scanner.
 * @param triviaScanner TS Scanner
 * @param ast the AST object
 * @param code TypeScript code
 * @returns the converted Comment
 * @private
 */
function getCommentFromTriviaScanner(
  triviaScanner: ts.Scanner,
  ast: ts.SourceFile,
  code: string
): TSESTree.Comment {
  const kind = triviaScanner.getToken();
  const isBlock = kind === ts.SyntaxKind.MultiLineCommentTrivia;
  const range = {
    pos: triviaScanner.getTokenPos(),
    end: triviaScanner.getTextPos(),
    kind: triviaScanner.getToken()
  };

  const comment = code.substring(range.pos, range.end);
  const text = isBlock
    ? comment.replace(/^\/\*/, '').replace(/\*\/$/, '')
    : comment.replace(/^\/\//, '');
  const loc = getLocFor(range.pos, range.end, ast);

  return convertTypeScriptCommentToEsprimaComment(
    isBlock,
    text,
    range.pos,
    range.end,
    loc.start,
    loc.end
  );
}

/**
 * Convert all comments for the given AST.
 * @param ast the AST object
 * @param code the TypeScript code
 * @returns the converted ESTreeComment
 * @private
 */
export function convertComments(
  ast: ts.SourceFile,
  code: string
): TSESTree.Comment[] {
  const comments: TSESTree.Comment[] = [];

  /**
   * Create a TypeScript Scanner, with skipTrivia set to false so that
   * we can parse the comments
   */
  const triviaScanner = ts.createScanner(
    ast.languageVersion,
    false,
    ast.languageVariant,
    code
  );

  let kind = triviaScanner.scan();
  while (kind !== ts.SyntaxKind.EndOfFileToken) {
    const start = triviaScanner.getTokenPos();
    const end = triviaScanner.getTextPos();

    let container: ts.Node | null = null;
    switch (kind) {
      case ts.SyntaxKind.SingleLineCommentTrivia:
      case ts.SyntaxKind.MultiLineCommentTrivia: {
        const comment = getCommentFromTriviaScanner(triviaScanner, ast, code);

        comments.push(comment);
        break;
      }
      case ts.SyntaxKind.GreaterThanToken:
        container = getNodeContainer(ast, start, end);
        if (
          container &&
          container.parent &&
          container.parent.kind === ts.SyntaxKind.JsxOpeningElement &&
          container.parent.parent &&
          container.parent.parent.kind === ts.SyntaxKind.JsxElement
        ) {
          kind = triviaScanner.reScanJsxToken();
          continue;
        }
        break;
      case ts.SyntaxKind.CloseBraceToken:
        container = getNodeContainer(ast, start, end);

        if (
          container.kind === ts.SyntaxKind.TemplateMiddle ||
          container.kind === ts.SyntaxKind.TemplateTail
        ) {
          kind = triviaScanner.reScanTemplateToken();
          continue;
        }
        break;
      case ts.SyntaxKind.SlashToken:
      case ts.SyntaxKind.SlashEqualsToken:
        container = getNodeContainer(ast, start, end);

        if (container.kind === ts.SyntaxKind.RegularExpressionLiteral) {
          kind = triviaScanner.reScanSlashToken();
          continue;
        }
        break;
      default:
        break;
    }
    kind = triviaScanner.scan();
  }

  return comments;
}
