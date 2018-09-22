"use strict";

/**
 * Export the list to allow it to be used within both unit and AST comparison tests
 */
module.exports = [
    "jsx/embedded-tags", // https://github.com/Microsoft/TypeScript/issues/7410
    "jsx/namespaced-attribute-and-value-inserted", // https://github.com/Microsoft/TypeScript/issues/7411
    "jsx/namespaced-name-and-attribute", // https://github.com/Microsoft/TypeScript/issues/7411
    "jsx/invalid-namespace-value-with-dots" // https://github.com/Microsoft/TypeScript/issues/7411
];
