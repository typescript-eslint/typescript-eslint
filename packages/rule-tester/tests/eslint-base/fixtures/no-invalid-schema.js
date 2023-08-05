// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/no-invalid-schema.js

"use strict";

module.exports = {
    meta: {
        type: "problem",
        schema: [{
            "enum": []
        }]
    },
    create(context) {
        return {
            "Program": function(node) {
                if (config) {
                    context.report(node, "Expected nothing.");
                }
            }
        };
    },
};
