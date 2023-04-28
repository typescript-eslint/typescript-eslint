// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/no-test-settings.js

"use strict";

module.exports = {
    meta: {
        type: "problem",
        schema: [],
    },
    create(context) {
        return {
            Program: function (node) {
                if (!context.settings || !context.settings.test) {
                    context.report(
                        node,
                        "Global settings test was not defined."
                    );
                }
            },
        };
    },
};
