/**
 * @fileoverview Parser that converts TypeScript into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

const parse = require("typescript-estree").parseAndGenerateServices;
const astNodeTypes = require("typescript-estree").AST_NODE_TYPES;
const traverser = require("eslint/lib/util/traverser");
const analyzeScope = require("./analyze-scope");
const visitorKeys = require("./visitor-keys");

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

exports.version = require("./package.json").version;

exports.parseForESLint = function parseForESLint(code, options) {
    if (typeof options !== "object" || options === null) {
        options = { useJSXTextNode: true };
    } else if (typeof options.useJSXTextNode !== "boolean") {
        options = Object.assign({}, options, { useJSXTextNode: true });
    }
    if (typeof options.filePath === "string") {
        const tsx = options.filePath.endsWith(".tsx");
        if (tsx || options.filePath.endsWith(".ts")) {
            options = Object.assign({}, options, { jsx: tsx });
        }
    }

    // https://eslint.org/docs/user-guide/configuring#specifying-parser-options
    // if sourceType is not provided by default eslint expect that it will be set to "script"
    options.sourceType = options.sourceType || "script";
    if (options.sourceType !== "module" && options.sourceType !== "script") {
        options.sourceType = "script";
    }

    const { ast, services } = parse(code, options);
    ast.sourceType = options.sourceType;

    traverser.traverse(ast, {
        enter: node => {
            switch (node.type) {
                // Function#body cannot be null in ESTree spec.
                case "FunctionExpression":
                    if (!node.body) {
                        node.type = `TSEmptyBody${node.type}`;
                    }
                    break;
                // no default
            }
        }
    });

    const scopeManager = analyzeScope(ast, options);
    return { ast, services, scopeManager, visitorKeys };
};

exports.parse = function(code, options) {
    return this.parseForESLint(code, options).ast;
};

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
