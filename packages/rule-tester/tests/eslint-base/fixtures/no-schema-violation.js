// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/no-schema-violation.js

"use strict";

module.exports = {
    meta: {
        type: "problem",
        schema: [{
            "enum": ["foo"]
        }]
    },
    create(context) {
        const config = context.options[0];
        return {
            "Program": function(node) {
                if (config && config !== "foo") {
                    context.report(node, "Expected foo.");
                }
            }
        };
    },
};
