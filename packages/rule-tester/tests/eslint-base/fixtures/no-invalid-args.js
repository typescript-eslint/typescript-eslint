// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/no-invalid-args.js

"use strict";

module.exports = {
    meta: {
        type: "problem",
        schema: [{
            type: "boolean"
        }]
    },
    create(context) {
        var config = context.options[0];

        return {
            "Program": function(node) {
                if (config === true) {
                    context.report(node, "Invalid args");
                }
            }
        };
    }
};
