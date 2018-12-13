/**
 * @fileoverview Disallows non-null assertions using the `!` postfix operator.
 * @author Macklin Underdown
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Disallows non-null assertions using the `!` postfix operator",
            extraDescription: [util.tslintRule("no-non-null-assertion")],
            category: "TypeScript",
            url: util.metaDocsUrl("no-non-null-assertion"),
        },
        schema: [],
    },
    create(context) {
        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            TSNonNullExpression(node) {
                context.report({
                    node,
                    message: "Forbidden non-null assertion.",
                });
            },
        };
    },
};
