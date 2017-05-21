/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const convert = require("./convert"),
    convertComments = require("./convert-comments").convertComments,
    nodeUtils = require("./node-utils");

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

/**
 * Extends and formats a given error object
 * @param  {Object} error the error object
 * @returns {Object}       converted error object
 */
function convertError(error) {
    const loc = error.file.getLineAndCharacterOfPosition(error.start);
    return {
        index: error.start,
        lineNumber: loc.line + 1,
        column: loc.character,
        message: error.message || error.messageText
    };
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = (ast, extra) => {

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
    const estree = convert({
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
