/**
 * @fileoverview Utilities for running integration tests
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const eslint = require("eslint");
const unpad = require("dedent");
const fs = require("fs");
const path = require("path");

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

/* eslint-disable no-use-before-define */
module.exports = {
    verifyAndAssertMessages,
    loadExternalFixture
};
/* eslint-enable no-use-before-define */

/**
 * Loads an external fixture by name
 * @param {string} fixtureName the name of the fixture file to load
 * @returns {string} stringified file contents
 */
function loadExternalFixture(fixtureName) {
    return fs.readFileSync(
        path.join(__dirname, "external-fixtures", `${fixtureName}.js`)
    ).toString();
}

/**
 * A utility function to lint the given source code using typescript-eslint-parser
 * and assert expectations around the linting feedback
 *
 * @param {string} code source code to lint
 * @param {Object} rules ESLint rules configuration
 * @param {string[]} expectedMessages Expected linting feedback
 * @param {string} sourceType Either "module" or "script"
 * @param {Obejct} overrideConfig Custom configuration options for the CLIEngine
 * @returns {void}
 */
function verifyAndAssertMessages(
    code,
    rules,
    expectedMessages,
    sourceType,
    overrideConfig
) {
    const cliEngineConfig = {
        useEslintrc: false,
        parser: require.resolve("../../parser"),
        rules,
        parserOptions: {
            ecmaVersion: 8,
            ecmaFeatures: {
                jsx: true,
                experimentalObjectRestSpread: true,
                globalReturn: true
            },
            sourceType: sourceType || "script"
        },
        cwd: __dirname
    };

    if (overrideConfig) {
        Object.assign(cliEngineConfig, overrideConfig);
    }

    const cli = new eslint.CLIEngine(cliEngineConfig);
    const messages = cli.executeOnText(code, "fake-filename.js").results[0].messages;

    if (messages.length !== expectedMessages.length) {
        throw new Error(
            `Expected ${expectedMessages.length} message(s), got ${messages.length}\n${JSON.stringify(
                messages,
                null,
                2
            )}`
        );
    }

    messages.forEach((message, i) => {
        const formatedMessage = `${message.line}:${message.column} ${message.message}${message.ruleId
            ? ` ${message.ruleId}`
            : ""}`;
        if (formatedMessage !== expectedMessages[i]) {
            throw new Error(
                unpad(`
                    Message ${i} does not match:
                    Expected: ${expectedMessages[i]}
                    Actual:   ${formatedMessage}
                `)
            );
        }
    });
}
