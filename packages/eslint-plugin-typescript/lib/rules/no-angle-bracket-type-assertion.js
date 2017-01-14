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

        var sourceCode = context.getSourceCode();

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSTypeAssertionExpression: function(node) {
                context.report({
                    node,
                    message: "Prefer 'as {{cast}}' instead of '<{{cast}}>' when doing type assertions",
                    data: {
                        cast: sourceCode.getText(node.typeAnnotation.typeAnnotation)
                    }
                });
            }
        };
    }
};
