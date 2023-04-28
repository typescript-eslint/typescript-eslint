// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/modify-ast-at-first.js

"use strict";

module.exports = {
    meta: {
        type: "problem",
        schema: []
    },
    create(context) {
        return {
            "Program": function(node) {
                node.body.push({
                    "type": "Identifier",
                    "name": "modified",
                    "range": [0, 8],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 8
                        }
                    }
                });
            },

            "Identifier": function(node) {
                if (node.name === "bar") {
                    context.report({message: "error", node: node});
                }
            }
        };
    },
};
