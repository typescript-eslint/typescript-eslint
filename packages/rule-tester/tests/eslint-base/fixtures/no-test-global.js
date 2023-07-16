// Forked from https://github.com/eslint/eslint/tree/1665c029acb92bf8812267f1647ad1a7054cbcb4/tests/fixtures/testers/rule-tester/no-test-global.js

"use strict";

module.exports = {
    meta: {
        type: "problem",
        schema: [],
    },
    create(context) {
        return {
            "Program": function(node) {
                var globals = context.getScope().variables.map(function (variable) {
                    return variable.name;
                });

                if (globals.indexOf("test") === -1) {
                    context.report(node, "Global variable test was not defined.");
                }
                if (globals.indexOf("foo") !== -1) {
                    context.report(node, "Global variable foo should not be used.");
                }
            }
        };
    },
};
