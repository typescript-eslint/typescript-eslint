/**
 * @fileoverview Enforces the any type is not used.
 * @author Danny Fritz
 * @author Patricio Trevino
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallow usage of the `any` type",
            extraDescription: [util.tslintRule("no-any")],
            category: "TypeScript",
            url:
                "https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-explicit-any.md",
        },
        schema: [],
    },

    create(context) {
        return {
            TSAnyKeyword(node) {
                context.report({
                    node,
                    message: "Unexpected any. Specify a different type.",
                });
            },
        };
    },
};
