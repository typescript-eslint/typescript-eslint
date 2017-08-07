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

function parseWithBabylonPluginTypescript(text) { // eslint-disable-line
    const babylon = require("babylon");
    return babylon.parse(text, {
        sourceType: "script",
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        ranges: true,
        plugins: [
            "jsx",
            "typescript",
            "doExpressions",
            "objectRestSpread",
            "decorators",
            "classProperties",
            "exportExtensions",
            "asyncGenerators",
            "functionBind",
            "functionSent",
            "dynamicImport",
            "numericSeparator",
            "estree"
        ]
    });
}

function parseWithTypeScriptESLintParser(text) { // eslint-disable-line
    const parser = require("../../parser");
    try {
        return parser.parse(text, {
            loc: true,
            range: true,
            tokens: false,
            comment: false,
            ecmaFeatures: {
                jsx: true
            }
        });
    } catch (e) {
        throw createError(
            e.message,
            e.lineNumber,
            e.column
        );
    }
}

module.exports = function parse(text, opts) {

    let parseFunction;

    switch (opts.parser) {
        case "typescript-eslint-parser":
            parseFunction = parseWithTypeScriptESLintParser;
            break;
        case "babylon-plugin-typescript":
            parseFunction = parseWithBabylonPluginTypescript;
            break;
        default:
            throw new Error("Please provide a valid parser: either \"typescript-eslint-parser\" or \"babylon-plugin-typescript\"");
    }

    try {
        return parseUtils.normalizeNodeTypes(parseFunction(text));
    } catch (error) {
        const loc = error.loc;
        if (loc) {
            error.codeFrame = codeFrame(text, loc.line, loc.column + 1, {
                highlightCode: true
            });
            error.message += `\n${error.codeFrame}`;
        }
        throw error;
    }

};
