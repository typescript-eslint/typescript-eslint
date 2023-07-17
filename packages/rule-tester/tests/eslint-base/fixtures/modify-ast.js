// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/modify-ast.js

"use strict";

module.exports = {
    meta: {
        type: "problem",
        schema: []
    },
    create(context) {
        return {
            "Identifier": function(node) {
                node.name += "!";

                if (node.name === "bar!") {
                    context.report({message: "error", node: node});
                }
            }
        };
    },
};
