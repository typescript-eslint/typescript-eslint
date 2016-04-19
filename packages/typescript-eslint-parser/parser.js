/**
 * @fileoverview Parser that converts TypeScript into ESTree format.
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
/* eslint no-undefined:0, no-use-before-define: 0 */

"use strict";

var astNodeTypes = require("./lib/ast-node-types"),
    commentAttachment = require("./lib/comment-attachment"),
   //  TokenTranslator = require("./lib/token-translator"),
    ts = require("typescript");

// var lookahead;
var extra;
// var lastToken;

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
 * @param  {object} options configuration object for the parser
 * @returns {object}         the AST
 */
function parse(code, options) {

    var program,
        toString = String;
   //  var acornOptions = {
   //      ecmaVersion: 5
   //  };
   //  var translator;

    if (typeof code !== "string" && !(code instanceof String)) {
        code = toString(code);
    }

    resetExtra();
    commentAttachment.reset();

    if (typeof options !== "undefined") {
        extra.range = (typeof options.range === "boolean") && options.range;
        extra.loc = (typeof options.loc === "boolean") && options.loc;
        extra.attachComment = (typeof options.attachComment === "boolean") && options.attachComment;

        if (extra.loc && options.source !== null && options.source !== undefined) {
            extra.source = toString(options.source);
        }

        if (typeof options.tokens === "boolean" && options.tokens) {
            extra.tokens = [];
            // translator = new TokenTranslator(tt, code);
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
            commentAttachment.reset();
        }

        if (options.ecmaFeatures && typeof options.ecmaFeatures === "object") {
            // pass through jsx option
            extra.ecmaFeatures.jsx = options.ecmaFeatures.jsx;
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
            // acornOptions.onComment = function() {
            //     var comment = convertAcornCommentToEsprimaComment.apply(this, arguments);
            //     extra.comments.push(comment);
            //
            //     if (extra.attachComment) {
            //         commentAttachment.addComment(comment);
            //     }
            // };
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
