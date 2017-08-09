/**
 * @fileoverview Enforces spacing around type annotations.
 * @author Nicholas C. Zakas
 * @author Patricio Trevino
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
        schema: [
            {
                type: "object",
                properties: {
                    before: { type: "boolean" },
                    after: { type: "boolean" }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {

        const sourceCode = context.getSourceCode();

        const options = context.options[0] || {};
        const before = typeof options.before === "boolean" ? options.before : false;
        const after = typeof options.after === "boolean" ? options.after : true;

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
            const nextToken = typeAnnotation.typeAnnotation || typeAnnotation;
            const colonToken = sourceCode.getTokenBefore(nextToken);
            const previousToken = sourceCode.getTokenBefore(colonToken);

            const previousDelta = colonToken.range[0] - previousToken.range[1];
            const nextDelta = nextToken.range[0] - colonToken.range[1];

            if (after && nextDelta === 0) {
                context.report({
                    node: colonToken,
                    message: "Expected a space after the colon.",
                    fix(fixer) {
                        return fixer.insertTextAfter(colonToken, " ");
                    }
                });
            } else if (!after && nextDelta > 0) {
                context.report({
                    node: colonToken,
                    message: "Unexpected space after the colon.",
                    fix(fixer) {
                        return fixer.removeRange([colonToken.range[1], nextToken.range[0]]);
                    }
                });
            }

            if (before && previousDelta === 0) {
                context.report({
                    node: colonToken,
                    loc: {
                        start: {
                            line: colonToken.loc.start.line,
                            column: colonToken.loc.start.column - 1
                        },
                        end: {
                            line: colonToken.loc.start.line,
                            column: colonToken.loc.start.column
                        }
                    },
                    message: "Expected a space before the colon.",
                    fix(fixer) {
                        return fixer.insertTextAfter(previousToken, " ");
                    }
                });
            } else if (!before && previousDelta > 0) {
                context.report({
                    node: colonToken,
                    loc: {
                        start: {
                            line: colonToken.loc.start.line,
                            column: colonToken.loc.start.column - 1
                        },
                        end: {
                            line: colonToken.loc.start.line,
                            column: colonToken.loc.start.column
                        }
                    },
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

            TypeAnnotation(node) {
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
