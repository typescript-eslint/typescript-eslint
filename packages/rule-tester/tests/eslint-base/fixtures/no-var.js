// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/no-var.js

"use strict";

module.exports = {
    meta: {
        fixable: "code",
        schema: []
    },
    create(context) {
        var sourceCode = context.getSourceCode();

        return {
            "VariableDeclaration": function(node) {
                if (node.kind === "var") {
                    context.report({
                        node: node,
                        loc: sourceCode.getFirstToken(node).loc,
                        message: "Bad var.",
                        fix: function(fixer) {
                            return fixer.remove(sourceCode.getFirstToken(node));
                        }
                    })
                }
            }
        };
    }
};
