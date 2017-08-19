/**
 * @fileoverview Disallows the declaration of empty interfaces.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallows the declaration of empty interfaces.",
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
                        message: heritage === 0
                            ? "An empty interface is equivalent to `{}`"
                            : "An interface declaring no members is equivalent to its supertype."
                    });
                }
            }
        };
    }
};
