// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/fixes-one-problem.js

"use strict";

module.exports = {
    meta: {
        fixable: "code"
    },
    create(context) {
        return {
            Program(node) {
                context.report({
                    node,
                    message: "No programs allowed."
                });

                context.report({
                    node,
                    message: "Seriously, no programs allowed.",
                    fix: fixer => fixer.remove(node)
                });
            }
        }
    }
};
