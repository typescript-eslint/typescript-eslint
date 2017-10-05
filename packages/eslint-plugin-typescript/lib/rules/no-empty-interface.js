/**
 * @fileoverview Disallows the declaration of empty interfaces.
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
            description: "Disallow the declaration of empty interfaces",
            extraDescription: [util.tslintRule("no-empty-interface")],
            category: "TypeScript"
        },
        schema: []
    },

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    create(context) {
        return {
            TSInterfaceDeclaration(node) {
                const heritage = node.heritage.length;

                if (node.body.body.length === 0 && heritage < 2) {
                    context.report({
                        node: node.id,
                        message:
                            heritage === 0
                                ? "An empty interface is equivalent to `{}`"
                                : "An interface declaring no members is equivalent to its supertype."
                    });
                }
            }
        };
    }
};
