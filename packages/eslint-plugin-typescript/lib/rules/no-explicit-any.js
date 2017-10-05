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
            category: "TypeScript"
        },
        schema: []
    },

    create(context) {
        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if the node has a type annotation of type any.
         * @param {ASTNode} node The node being validated.
         * @returns {void}
         * @private
         */
        function checkGenericNodeForAnnotation(node) {
            if (node.type === "TSAnyKeyword") {
                context.report({
                    node,
                    message: "Unexpected any. Specify a different type."
                });
            } else if (node.type === "TSArrayType") {
                checkGenericNodeForAnnotation(node.elementType);
            } else if (
                node.type === "TSUnionType" ||
                node.type === "TSIntersectionType"
            ) {
                node.types.forEach(type => {
                    checkGenericNodeForAnnotation(type);
                });
            } else if (node.type === "TSTypeReference") {
                if (node.typeParameters) {
                    // handles generics
                    node.typeParameters.params.forEach(param => {
                        checkGenericNodeForAnnotation(param);
                    });
                } else if (node.typeName) {
                    // handles non generics
                    checkGenericNodeForAnnotation(node.typeName);
                }
            } else if (node.type === "GenericTypeAnnotation") {
                if (node.typeParameters) {
                    node.typeParameters.params.forEach(param => {
                        checkGenericNodeForAnnotation(param);
                    });
                } else {
                    checkGenericNodeForAnnotation(node.id);
                }
            }
        }

        /**
         * Checks if a function node used the any type
         * @param {ASTNode} node The node representing a function.
         * @returns {void}
         * @private
         */
        function checkFunctionReturnTypeForAnnotation(node) {
            if (node.returnType) {
                checkGenericNodeForAnnotation(node.returnType.typeAnnotation);
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            Identifier(node) {
                if (node.typeAnnotation) {
                    checkGenericNodeForAnnotation(
                        node.typeAnnotation.typeAnnotation
                    );
                }
            },
            TypeAnnotation(node) {
                if (node.typeAnnotation) {
                    checkGenericNodeForAnnotation(node.typeAnnotation);
                }
            },
            FunctionDeclaration: checkFunctionReturnTypeForAnnotation,
            FunctionExpression: checkFunctionReturnTypeForAnnotation,
            ArrowFunctionExpression: checkFunctionReturnTypeForAnnotation
        };
    }
};
