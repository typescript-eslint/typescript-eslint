/**
 * @fileoverview Parser that converts TypeScript into ESTree format.
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

const astNodeTypes = require("./lib/ast-node-types"),
    ts = require("typescript"),
    semver = require("semver");

const SUPPORTED_TYPESCRIPT_VERSIONS = require("./package.json").devDependencies.typescript;
const ACTIVE_TYPESCRIPT_VERSION = ts.version;

const isRunningSupportedTypeScriptVersion = semver.satisfies(ACTIVE_TYPESCRIPT_VERSION, SUPPORTED_TYPESCRIPT_VERSIONS);

if (!isRunningSupportedTypeScriptVersion) {
    const border = "=============";
    const versionWarning = [
        border,
        "WARNING: You are currently running a version of TypeScript which is not officially supported by typescript-eslint-parser.",
        "You may find that it works just fine, or you may not.",
        `SUPPORTED TYPESCRIPT VERSIONS: ${SUPPORTED_TYPESCRIPT_VERSIONS}`,
        `YOUR TYPESCRIPT VERSION: ${ACTIVE_TYPESCRIPT_VERSION}`,
        "Please only submit bug reports when using the officially supported version.",
        border
    ];

    console.warn(versionWarning.join("\n\n")); // eslint-disable-line no-console
}

let extra;

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
 * Returns line and column data for the given start and end positions,
 * for the given AST
 * @param  {Object} start start data
 * @param  {Object} end   end data
 * @param  {Object} ast   the AST object
 * @returns {Object}       the loc data
 */
function getLocFor(start, end, ast) {
    const startLoc = ast.getLineAndCharacterOfPosition(start),
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
 * @param  {Object} options configuration object for the parser
 * @returns {Object}         the AST
 */
function parse(code, options) {

    const toString = String;

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

        /**
         * Allow the user to cause the parser to error if it encounters an unknown AST Node Type
         * (used in testing).
         */
        if (options.errorOnUnknownASTType) {
            extra.errorOnUnknownASTType = true;
        }

    }

    // Even if jsx option is set in typescript compiler, filename still has to
    // contain .tsx file extension
    const FILENAME = (extra.ecmaFeatures.jsx) ? "eslint.tsx" : "eslint.ts";

    const compilerHost = {
        fileExists() {
            return true;
        },
        getCanonicalFileName() {
            return FILENAME;
        },
        getCurrentDirectory() {
            return "";
        },
        getDefaultLibFileName() {
            return "lib.d.ts";
        },

        // TODO: Support Windows CRLF
        getNewLine() {
            return "\n";
        },
        getSourceFile(filename) {
            return ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
        },
        readFile() {
            return null;
        },
        useCaseSensitiveFileNames() {
            return true;
        },
        writeFile() {
            return null;
        }
    };

    const program = ts.createProgram([FILENAME], {
        noResolve: true,
        target: ts.ScriptTarget.Latest,
        jsx: extra.ecmaFeatures.jsx ? "preserve" : undefined
    }, compilerHost);

    const ast = program.getSourceFile(FILENAME);

    if (extra.attachComment || extra.comment) {
        /**
         * Create a TypeScript Scanner, with skipTrivia set to false so that
         * we can parse the comments
         */
        const triviaScanner = ts.createScanner(ast.languageVersion, false, 0, code);

        let kind = triviaScanner.scan();

        while (kind !== ts.SyntaxKind.EndOfFileToken) {
            if (kind !== ts.SyntaxKind.SingleLineCommentTrivia && kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
                kind = triviaScanner.scan();
                continue;
            }

            const isBlock = (kind === ts.SyntaxKind.MultiLineCommentTrivia);
            const range = {
                pos: triviaScanner.getTokenPos(),
                end: triviaScanner.getTextPos(),
                kind: triviaScanner.getToken()
            };

            const comment = code.substring(range.pos, range.end);
            const text = comment.replace("//", "").replace("/*", "").replace("*/", "");
            const loc = getLocFor(range.pos, range.end, ast);

            const esprimaComment = convertTypeScriptCommentToEsprimaComment(isBlock, text, range.pos, range.end, loc.start, loc.end);

            extra.comments.push(esprimaComment);

            kind = triviaScanner.scan();
        }

    }

    const convert = require("./lib/ast-converter");

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
    let name,
        types = {};

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
