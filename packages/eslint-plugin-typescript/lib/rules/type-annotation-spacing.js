/**
 * @fileoverview Enforces spacing around type annotations.
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Enforces spacing around type annotations.",
            category: "TypeScript"
        },
        fixable: "code",
        schema: []
    },

    create(context) {

        const sourceCode = context.getSourceCode();

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if there's proper spacing around type annotations (no space
         * before colon, one space after).
         * @param {ASTNode} typeAnnotation The TypeAnnotation node.
         * @returns {void}
         * @private
         */
        function checkTypeAnnotationSpacing(typeAnnotation) {
            let colonToken = typeAnnotation,
                previousToken = sourceCode.getTokenBefore(typeAnnotation);

            if (previousToken.type === "Punctuator") {
                colonToken = previousToken;
                previousToken = sourceCode.getTokenBefore(colonToken);

                if (typeAnnotation.range[0] - colonToken.range[1] === 0) {
                    context.report({
                        node: typeAnnotation,
                        message: "Expected a space after the colon.",
                        fix(fixer) {
                            return fixer.insertTextAfter(colonToken, " ");
                        }
                    });
                }
            } else {
                if (typeAnnotation.typeAnnotation.range[0] - typeAnnotation.range[0] === 1) {
                    context.report({
                        node: typeAnnotation,
                        message: "Expected a space after the colon.",
                        fix(fixer) {
                            return fixer.insertTextAfterRange([typeAnnotation.range[0], typeAnnotation.typeAnnotation.range[0]], " ");
                        }
                    });
                }
            }

            if (colonToken.range[0] - previousToken.range[1] > 0) {
                context.report({
                    node: typeAnnotation,
                    message: "Unexpected space before the colon.",
                    fix(fixer) {
                        return fixer.removeRange([previousToken.range[1], colonToken.range[0]]);
                    }
                });
            }
        }

        /**
         * Checks a function node for proper return type spacing.
         * @param {ASTNode} node The node representing a function.
         * @returns {void}
         * @private
         */
        function checkFunctionReturnTypeSpacing(node) {
            if (node.returnType) {
                checkTypeAnnotationSpacing(node.returnType);
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {

            Identifier(node) {
                if (node.typeAnnotation) {
                    checkTypeAnnotationSpacing(node.typeAnnotation);
                }
            },

            FunctionDeclaration: checkFunctionReturnTypeSpacing,
            FunctionExpression: checkFunctionReturnTypeSpacing,
            ArrowFunctionExpression: checkFunctionReturnTypeSpacing
        };
    }
};
