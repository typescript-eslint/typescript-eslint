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
