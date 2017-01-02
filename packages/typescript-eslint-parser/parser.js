/**
 * @fileoverview Parser that converts TypeScript into ESTree format.
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
/* eslint no-undefined:0, no-use-before-define: 0 */

"use strict";

var astNodeTypes = require("./lib/ast-node-types"),
    ts = require("typescript");

var extra;

/**
 * Resets the extra config object
 * @returns {void}
 */
function resetExtra() {
    extra = {
        tokens: null,
        range: false,
        loc: false,
        comment: false,
        comments: [],
        tolerant: false,
        errors: [],
        strict: false,
        ecmaFeatures: {}
    };
}

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
    var comment = {
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
 * Returns line and column data for the given start and end positions,
 * for the given AST
 * @param  {Object} start start data
 * @param  {Object} end   end data
 * @param  {Object} ast   the AST object
 * @returns {Object}       the loc data
 */
function getLocFor(start, end, ast) {
    var startLoc = ast.getLineAndCharacterOfPosition(start),
        endLoc = ast.getLineAndCharacterOfPosition(end);

    return {
        start: {
            line: startLoc.line + 1,
            column: startLoc.character
        },
        end: {
            line: endLoc.line + 1,
            column: endLoc.character
        }
    };
}

//------------------------------------------------------------------------------
// Parser
//------------------------------------------------------------------------------

/**
 * Parses the given source code to produce a valid AST
 * @param  {mixed} code    TypeScript code
 * @param  {object} options configuration object for the parser
 * @returns {object}         the AST
 */
function parse(code, options) {

    var program,
        toString = String;

    if (typeof code !== "string" && !(code instanceof String)) {
        code = toString(code);
    }

    resetExtra();

    if (typeof options !== "undefined") {
        extra.range = (typeof options.range === "boolean") && options.range;
        extra.loc = (typeof options.loc === "boolean") && options.loc;
        extra.attachComment = (typeof options.attachComment === "boolean") && options.attachComment;

        if (extra.loc && options.source !== null && options.source !== undefined) {
            extra.source = toString(options.source);
        }

        if (typeof options.tokens === "boolean" && options.tokens) {
            extra.tokens = [];
        }
        if (typeof options.comment === "boolean" && options.comment) {
            extra.comment = true;
            extra.comments = [];
        }
        if (typeof options.tolerant === "boolean" && options.tolerant) {
            extra.errors = [];
        }
        if (extra.attachComment) {
            extra.range = true;
            extra.comments = [];
        }

        if (options.ecmaFeatures && typeof options.ecmaFeatures === "object") {
            // pass through jsx option
            extra.ecmaFeatures.jsx = options.ecmaFeatures.jsx;
        }
    }

    // Even if jsx option is set in typescript compiler, filename still has to
    // contain .tsx file extension
    var FILENAME = (extra.ecmaFeatures.jsx) ? "eslint.tsx" : "eslint.ts";

    var compilerHost = {
        fileExists: function() {
            return true;
        },
        getCanonicalFileName: function() {
            return FILENAME;
        },
        getCurrentDirectory: function() {
            return "";
        },
        getDefaultLibFileName: function() {
            return "lib.d.ts";
        },

        // TODO: Support Windows CRLF
        getNewLine: function() {
            return "\n";
        },
        getSourceFile: function(filename) {
            return ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
        },
        readFile: function() {
            return null;
        },
        useCaseSensitiveFileNames: function() {
            return true;
        },
        writeFile: function() {
            return null;
        }
    };

    program = ts.createProgram([FILENAME], {
        noResolve: true,
        target: ts.ScriptTarget.Latest,
        jsx: extra.ecmaFeatures.jsx ? "preserve" : undefined
    }, compilerHost);

    var ast = program.getSourceFile(FILENAME);

    if (extra.attachComment || extra.comment) {
        /**
         * Create a TypeScript Scanner, with skipTrivia set to false so that
         * we can parse the comments
         */
        var triviaScanner = ts.createScanner(ast.languageVersion, false, 0, code);

        var kind = triviaScanner.scan();
        while (kind !== ts.SyntaxKind.EndOfFileToken) {
            if (kind !== ts.SyntaxKind.SingleLineCommentTrivia && kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
                kind = triviaScanner.scan();
                continue;
            }

            var isBlock = (kind === ts.SyntaxKind.MultiLineCommentTrivia);
            var range = {
                pos: triviaScanner.getTokenPos(),
                end: triviaScanner.getTextPos(),
                kind: triviaScanner.getToken()
            };

            var comment = code.substring(range.pos, range.end);
            var text = comment.replace("//", "").replace("/*", "").replace("*/", "");
            var loc = getLocFor(range.pos, range.end, ast);

            var esprimaComment = convertTypeScriptCommentToEsprimaComment(isBlock, text, range.pos, range.end, loc.start, loc.end);
            extra.comments.push(esprimaComment);

            kind = triviaScanner.scan();
        }

    }

    var convert = require("./lib/ast-converter");

    return convert(ast, extra);
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

exports.version = require("./package.json").version;

exports.parse = parse;

// Deep copy.
/* istanbul ignore next */
exports.Syntax = (function() {
    var name, types = {};

    if (typeof Object.create === "function") {
        types = Object.create(null);
    }

    for (name in astNodeTypes) {
        if (astNodeTypes.hasOwnProperty(name)) {
            types[name] = astNodeTypes[name];
        }
    }

    if (typeof Object.freeze === "function") {
        Object.freeze(types);
    }

    return types;
}());
