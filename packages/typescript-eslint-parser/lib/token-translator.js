/**
 * @fileoverview Translates tokens between Acorn format and Esprima format.
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
/* eslint no-underscore-dangle: 0 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// none!

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------


// Esprima Token Types
var Token = {
    Boolean: "Boolean",
    EOF: "<end>",
    Identifier: "Identifier",
    Keyword: "Keyword",
    Null: "Null",
    Numeric: "Numeric",
    Punctuator: "Punctuator",
    String: "String",
    RegularExpression: "RegularExpression",
    Template: "Template",
    JSXIdentifier: "JSXIdentifier",
    JSXText: "JSXText"
};

/**
 * Converts part of a template into an Esprima token.
 * @param {AcornToken[]} tokens The Acorn tokens representing the template.
 * @param {string} code The source code.
 * @returns {EsprimaToken} The Esprima equivalent of the template token.
 * @private
 */
function convertTemplatePart(tokens, code) {
    var firstToken = tokens[0],
        lastTemplateToken = tokens[tokens.length - 1];

    var token = {
        type: Token.Template,
        value: code.slice(firstToken.start, lastTemplateToken.end)
    };

    if (firstToken.loc) {
        token.loc = {
            start: firstToken.loc.start,
            end: lastTemplateToken.loc.end
        };
    }

    if (firstToken.range) {
        token.range = [firstToken.range[0], lastTemplateToken.range[1]];
    }

    return token;
}

/**
 * Contains logic to translate Acorn tokens into Esprima tokens.
 * @param {Object} acornTokTypes The Acorn token types.
 * @param {string} code The source code Acorn is parsing. This is necessary
 *      to correct the "value" property of some tokens.
 * @constructor
 */
function TokenTranslator(acornTokTypes, code) {

    // token types
    this._acornTokTypes = acornTokTypes;

    // token buffer for templates
    this._tokens = [];

    // track the last curly brace
    this._curlyBrace = null;

    // the source code
    this._code = code;

}

TokenTranslator.prototype = {
    constructor: TokenTranslator,

    /**
     * Translates a single Esprima token to a single Acorn token. This may be
     * inaccurate due to how templates are handled differently in Esprima and
     * Acorn, but should be accurate for all other tokens.
     * @param {AcornToken} token The Acorn token to translate.
     * @param {Object} extra Espree extra object.
     * @returns {EsprimaToken} The Esprima version of the token.
     */
    translate: function(token, extra) {

        var type = token.type,
            tt = this._acornTokTypes,
            result = {
                type: "",
                value: token.value,
                range: token.range,
                loc: token.loc
            };

        if (type === tt.name) {
            result.type = Token.Identifier;

            // TODO: See if this is an Acorn bug
            if (result.value === "static") {
                result.type = Token.Keyword;
            }

        } else if (type === tt.semi || type === tt.comma ||
                 type === tt.parenL || type === tt.parenR ||
                 type === tt.braceL || type === tt.braceR ||
                 type === tt.dot || type === tt.bracketL ||
                 type === tt.colon || type === tt.question ||
                 type === tt.bracketR || type === tt.ellipsis ||
                 type === tt.arrow || type === tt.jsxTagStart ||
                 type === tt.jsxTagEnd || (type.binop && !type.keyword) ||
                 type.isAssign) {

            result.type = Token.Punctuator;
            result.value = this._code.slice(token.start, token.end);
        } else if (type === tt.jsxName) {
            result.type = Token.JSXIdentifier;
        } else if (type.label === "jsxText" || type === tt.jsxAttrValueToken) {
            result.type = Token.JSXText;
        } else if (type.keyword) {
            if (type.keyword === "true" || type.keyword === "false") {
                result.type = Token.Boolean;
            } else if (type.keyword === "null") {
                result.type = Token.Null;
            } else {
                result.type = Token.Keyword;
            }
        } else if (type === tt.num) {
            result.type = Token.Numeric;
            result.value = this._code.slice(token.start, token.end);
        } else if (type === tt.string) {

            if (extra.jsxAttrValueToken) {
                extra.jsxAttrValueToken = false;
                result.type = Token.JSXText;
            } else {
                result.type = Token.String;
            }

            result.value = this._code.slice(token.start, token.end);
        } else if (type === tt.regexp) {
            result.type = Token.RegularExpression;
            var value = token.value;
            result.regex = {
                flags: value.flags,
                pattern: value.pattern
            };
            result.value = "/" + value.pattern + "/" + value.flags;
        }

        return result;
    },

    /**
     * Function to call during Acorn's onToken handler.
     * @param {AcornToken} token The Acorn token.
     * @param {Object} extra The Espree extra object.
     * @returns {void}
     */
    onToken: function(token, extra) {

        var that = this,
            tt = this._acornTokTypes,
            tokens = extra.tokens,
            templateTokens = this._tokens;

        /**
         * Flushes the buffered template tokens and resets the template
         * tracking.
         * @returns {void}
         * @private
         */
        function translateTemplateTokens() {
            tokens.push(convertTemplatePart(that._tokens, that._code));
            that._tokens = [];
        }

        if (token.type === tt.eof) {

            // might be one last curlyBrace
            if (this._curlyBrace) {
                tokens.push(this.translate(this._curlyBrace, extra));
            }

            return;
        }

        if (token.type === tt.backQuote) {
            templateTokens.push(token);

            // it's the end
            if (templateTokens.length > 1) {
                translateTemplateTokens();
            }

            return;
        } else if (token.type === tt.dollarBraceL) {
            templateTokens.push(token);
            translateTemplateTokens();
            return;
        } else if (token.type === tt.braceR) {

            // if there's already a curly, it's not part of the template
            if (this._curlyBrace) {

                tokens.push(this.translate(this._curlyBrace, extra));
            }

            // store new curly for later
            this._curlyBrace = token;
            return;
        } else if (token.type === tt.template) {
            if (this._curlyBrace) {
                templateTokens.push(this._curlyBrace);
                this._curlyBrace = null;
            }

            templateTokens.push(token);
            return;
        }

        if (this._curlyBrace) {
            tokens.push(this.translate(this._curlyBrace, extra));
            this._curlyBrace = null;
        }

        tokens.push(this.translate(token, extra));
    }
};

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = TokenTranslator;
