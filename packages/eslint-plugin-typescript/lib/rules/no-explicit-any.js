/**
 * @fileoverview Enforces the any type is not used.
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Enforces the any type is not used.",
            category: "TypeScript"
        },
        schema: []
    },

    create(context) {

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if the any type is used
         * @param {ASTNode} typeAnnotation The TypeAnnotation node.
         * @returns {void}
         * @private
         */
        function checkTypeAnnotationForAny(typeAnnotation) {
            if (typeAnnotation.typeAnnotation.type === "TSAnyKeyword") {
                context.report({
                    node: typeAnnotation,
                    message: "Unexpected any. Specify a different type."
                });
            }
        }

        /**
         * Checks if a function node used the any type
         * @param {ASTNode} node The node representing a function.
         * @returns {void}
         * @private
         */
        function checkFunctionReturnTypeForAny(node) {
            if (node.returnType) {
                checkTypeAnnotationForAny(node.returnType);
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {

            Identifier(node) {
                if (node.typeAnnotation) {
                    checkTypeAnnotationForAny(node.typeAnnotation);
                }
            },

            FunctionDeclaration: checkFunctionReturnTypeForAny,
            FunctionExpression: checkFunctionReturnTypeForAny,
            ArrowFunctionExpression: checkFunctionReturnTypeForAny
        };
    }
};
