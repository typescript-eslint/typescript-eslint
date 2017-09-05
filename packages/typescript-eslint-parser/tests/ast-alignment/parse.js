"use strict";

const codeFrame = require("babel-code-frame");
const parseUtils = require("./utils");

function createError(message, line, column) { // eslint-disable-line
    // Construct an error similar to the ones thrown by Babylon.
    const error = new SyntaxError(`${message} (${line}:${column})`);
    error.loc = {
        line,
        column
    };
    return error;
}

function parseWithBabylonPluginTypescript(text, parserOptions) { // eslint-disable-line
    parserOptions = parserOptions || {};
    const babylon = require("babylon");
    return babylon.parse(text, Object.assign({
        sourceType: "script",
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        ranges: true,
        plugins: [
            "jsx",
            "typescript",
            "objectRestSpread",
            "decorators",
            "classProperties",
            "asyncGenerators",
            "dynamicImport",
            "estree"
        ]
    }, parserOptions));
}

function parseWithTypeScriptESLintParser(text, parserOptions) { // eslint-disable-line
    parserOptions = parserOptions || {};
    const parser = require("../../parser");
    try {
        return parser.parse(text, Object.assign({
            loc: true,
            range: true,
            tokens: false,
            comment: false,
            useJSXTextNode: true,
            errorOnUnknownASTType: true,
            ecmaFeatures: {
                jsx: true
            }
        }, parserOptions));
    } catch (e) {
        throw createError(
            e.message,
            e.lineNumber,
            e.column
        );
    }
}

module.exports = function parse(text, opts) {

    /**
     * Always return a consistent interface, there will be times when we expect both
     * parsers to fail to parse the invalid source.
     */
    const result = {
        parseError: null,
        ast: null
    };

    try {
        switch (opts.parser) {
            case "typescript-eslint-parser":
                result.ast = parseUtils.normalizeNodeTypes(parseWithTypeScriptESLintParser(text, opts.typeScriptESLintParserOptions));
                break;
            case "babylon-plugin-typescript":
                result.ast = parseUtils.normalizeNodeTypes(parseWithBabylonPluginTypescript(text, opts.babylonParserOptions));
                break;
            default:
                throw new Error("Please provide a valid parser: either \"typescript-eslint-parser\" or \"babylon-plugin-typescript\"");
        }
    } catch (error) {
        const loc = error.loc;
        if (loc) {
            error.codeFrame = codeFrame(text, loc.line, loc.column + 1, {
                highlightCode: true
            });
            error.message += `\n${error.codeFrame}`;
        }
        result.parseError = error;
    }

    return result;

};
