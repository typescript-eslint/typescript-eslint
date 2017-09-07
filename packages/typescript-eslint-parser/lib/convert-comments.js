/**
 * @fileoverview Convert comment using TypeScript token scanner
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const ts = require("typescript"),
    nodeUtils = require("./node-utils");

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

/**
 * Converts a TypeScript comment to an Esprima comment.
 * @param {boolean} block True if it's a block comment, false if not.
 * @param {string} text The text of the comment.
 * @param {int} start The index at which the comment starts.
 * @param {int} end The index at which the comment ends.
 * @param {Location} startLoc The location at which the comment starts.
 * @param {Location} endLoc The location at which the comment ends.
 * @returns {Object} The comment object.
 * @private
 */
function convertTypeScriptCommentToEsprimaComment(block, text, start, end, startLoc, endLoc) {
    const comment = {
        type: block ? "Block" : "Line",
        value: text
    };

    if (typeof start === "number") {
        comment.range = [start, end];
    }

    if (typeof startLoc === "object") {
        comment.loc = {
            start: startLoc,
            end: endLoc
        };
    }

    return comment;
}

/**
 * Convert comment from TypeScript Triva Scanner.
 * @param  {Object} triviaScanner TS Scanner
 * @param  {Object} ast the AST object
 * @param  {string} code TypeScript code
 * @returns {ESTreeComment}     the converted ESTreeComment
 * @private
 */
function getCommentFromTriviaScanner(triviaScanner, ast, code) {
    const kind = triviaScanner.getToken();
    const isBlock = (kind === ts.SyntaxKind.MultiLineCommentTrivia);
    const range = {
        pos: triviaScanner.getTokenPos(),
        end: triviaScanner.getTextPos(),
        kind: triviaScanner.getToken()
    };

    const comment = code.substring(range.pos, range.end);
    const text = (isBlock) ? comment.replace(/^\/\*/, "").replace(/\*\/$/, "") : comment.replace(/^\/\//, "");
    const loc = nodeUtils.getLocFor(range.pos, range.end, ast);

    const esprimaComment = convertTypeScriptCommentToEsprimaComment(isBlock, text, range.pos, range.end, loc.start, loc.end);

    return esprimaComment;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

/* eslint-disable no-use-before-define */
module.exports = {
    convertComments
};


/**
 * Convert all comments for the given AST.
 * @param  {Object} ast the AST object
 * @param  {string} code the TypeScript code
 * @returns {ESTreeComment[]}     the converted ESTreeComment
 * @private
 */
function convertComments(ast, code) {
    const comments = [];

    /**
     * Create a TypeScript Scanner, with skipTrivia set to false so that
     * we can parse the comments
     */
    const triviaScanner = ts.createScanner(ast.languageVersion, false, 0, code);

    let kind = triviaScanner.scan();
    while (kind !== ts.SyntaxKind.EndOfFileToken) {
        const start = triviaScanner.getTokenPos();
        const end = triviaScanner.getTextPos();

        let container = null;
        switch (kind) {
            case ts.SyntaxKind.SingleLineCommentTrivia:
            case ts.SyntaxKind.MultiLineCommentTrivia: {
                const comment = getCommentFromTriviaScanner(triviaScanner, ast, code);

                comments.push(comment);
                break;
            }
            case ts.SyntaxKind.CloseBraceToken:
                container = nodeUtils.getNodeContainer(ast, start, end);

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
                container = nodeUtils.getNodeContainer(ast, start, end);

                if (
                    container.kind === ts.SyntaxKind.RegularExpressionLiteral
                ) {
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
