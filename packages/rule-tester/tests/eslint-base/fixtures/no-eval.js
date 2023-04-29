// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/no-eval.js

"use strict";

module.exports = {
    meta: {
        type: "problem",
        schema: [],
    },
    create(context) {
        return {
            CallExpression: function (node) {
                if (node.callee.name === "eval") {
                    context.report(node, "eval sucks.");
                }
            },
        };
    },
};
