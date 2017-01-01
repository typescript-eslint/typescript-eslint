/**
 * @fileoverview Enforces the use of `as Type` assertions instead of `<Type>` assertions.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Enforces the use of as Type assertions instead of <Type> assertions.",
            category: "Style"
        },
        schema: []
    },

    create: function(context) {

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSTypeAssertionExpression: function(node) {
                const type = node.typeAnnotation.typeAnnotation.typeName.name;
                context.report({
                    node,
                    message: "Prefer 'as {{cast}}' instead of '<{{cast}}>' when doing type assertions",
                    data: {
                        cast: type
                    }
                });
            }
        };
    }
};
