/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import { convert } from './convert';
import { convertComments } from './convert-comments';
import nodeUtils from './node-utils';
import { Extra } from './temp-types-based-on-js-source';

/**
 * Extends and formats a given error object
 * @param  {Object} error the error object
 * @returns {Object}       converted error object
 */
function convertError(error: any) {
  return nodeUtils.createError(
    error.file,
    error.start,
    error.message || error.messageText
  );
}

export default (ast: any, extra: Extra) => {
  /**
   * The TypeScript compiler produced fundamental parse errors when parsing the
   * source.
   */
  if (ast.parseDiagnostics.length) {
    throw convertError(ast.parseDiagnostics[0]);
  }

  /**
   * Recursively convert the TypeScript AST into an ESTree-compatible AST
   */
  const estree: any = convert({
    node: ast,
    parent: null,
    ast,
    additionalOptions: {
      errorOnUnknownASTType: extra.errorOnUnknownASTType || false,
      useJSXTextNode: extra.useJSXTextNode || false
    }
  });

  /**
   * Optionally convert and include all tokens in the AST
   */
  if (extra.tokens) {
    estree.tokens = nodeUtils.convertTokens(ast);
  }

  /**
   * Optionally convert and include all comments in the AST
   */
  if (extra.comment) {
    estree.comments = convertComments(ast, extra.code);
  }

  return estree;
};
