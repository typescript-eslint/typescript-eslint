/**
 * @fileoverview Parser that converts TypeScript into ESTree format.
 * Copyright 2015 Nicholas C. Zakas. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*eslint no-undefined:0, no-use-before-define: 0*/

"use strict";

var astNodeTypes = require("./lib/ast-node-types"),
    commentAttachment = require("./lib/comment-attachment"),
    TokenTranslator = require("./lib/token-translator"),
    acornJSX = require("acorn-jsx/inject"),
    ts = require("typescript");

var lookahead,
    extra,
    lastToken;

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


function parse(code, options) {

    var program,
        toString = String,
        translator,
        acornOptions = {
            ecmaVersion: 5
        };

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

        if (options.sourceType === "module") {
            extra.ecmaFeatures = {
                arrowFunctions: true,
                binaryLiterals: true,
                blockBindings: true,
                classes: true,
                destructuring: true,
                forOf: true,
                generators: true,
                modules: true,
                objectLiteralComputedProperties: true,
                objectLiteralDuplicateProperties: true,
                objectLiteralShorthandMethods: true,
                objectLiteralShorthandProperties: true,
                octalLiterals: true,
                regexUFlag: true,
                regexYFlag: true,
                restParams: true,
                spread: true,
                templateStrings: true,
                unicodeCodePointEscapes: true,
            };
            acornOptions.ecmaVersion = 6;
            acornOptions.sourceType = "module";
        }

        // apply parsing flags after sourceType to allow overriding
        if (options.ecmaFeatures && typeof options.ecmaFeatures === "object") {

            var flags = Object.keys(options.ecmaFeatures);

            // if it's a module, augment the ecmaFeatures
            flags.forEach(function(key) {
                var value = extra.ecmaFeatures[key] = options.ecmaFeatures[key];

                if (value) {
                    switch (key) {
                        case "globalReturn":
                            acornOptions.allowReturnOutsideFunction = true;
                            break;

                        case "modules":
                            acornOptions.sourceType = "module";
                            // falls through

                        default:
                            acornOptions.ecmaVersion = 6;
                    }
                }
            });

        }

        var FILENAME = "eslint.ts";

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

        var program = ts.createProgram([FILENAME], {
            noResolve: true,
            target: ts.ScriptTarget.Latest,
            jsx: extra.ecmaFeatures.jsx ? "preserve" : undefined
        }, compilerHost);

        var ast = program.getSourceFile(FILENAME);

        if (extra.attachComment || extra.comment) {
            acornOptions.onComment = function() {
                var comment = convertAcornCommentToEsprimaComment.apply(this, arguments);
                extra.comments.push(comment);

                if (extra.attachComment) {
                    commentAttachment.addComment(comment);
                }
            };
        }

        if (extra.range) {
            acornOptions.ranges = true;
        }

        if (extra.loc) {
            acornOptions.locations = true;
        }

        if (extra.ecmaFeatures.jsx) {
            if (extra.ecmaFeatures.spread !== false) {
                extra.ecmaFeatures.spread = true;
            }
            acornOptions.plugins = { jsx: true };
        }
    }


    // if (extra.comment || extra.attachComment) {
    //     ast.comments = extra.comments;
    // }

    // if (extra.tokens) {
    //     ast.tokens = extra.tokens;
    // }
    var convert = require("./lib/ast-converter");
    return convert(ast);

    // return ast;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

exports.version = require("./package.json").version;

exports.parse = parse;

// Deep copy.
/* istanbul ignore next */
exports.Syntax = (function () {
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
