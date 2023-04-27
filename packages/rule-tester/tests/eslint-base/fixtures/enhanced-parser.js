// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/parsers/enhanced-parser.js

var espree = require("espree");

exports.parseForESLint = function(code, options) {
    return {
        ast: espree.parse(code, options),
        services: {
            test: {
                getMessage() {
                    return "Hi!";
                }
            }
        }
    };
};

exports.parse = function() {
    throw new Error("Use parseForESLint() instead.");
};
