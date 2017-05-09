/**
 * @fileoverview Parser that converts TypeScript into ESTree format.
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

const astNodeTypes = require("./lib/ast-node-types"),
    ts = require("typescript"),
    convert = require("./lib/ast-converter"),
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

    extra.code = code;
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
