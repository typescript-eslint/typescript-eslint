/**
 * @fileoverview Enforces spacing around type annotations.
 * @author Nicholas C. Zakas
 * @author Patricio Trevino
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const definition = {
    type: "object",
    properties: {
        before: { type: "boolean" },
        after: { type: "boolean" },
    },
    additionalProperties: false,
};

module.exports = {
    meta: {
        type: "layout",
        docs: {
            description: "Require consistent spacing around type annotations",
            extraDescription: [util.tslintRule("typedef-whitespace")],
            category: "TypeScript",
            url: util.metaDocsUrl("type-annotation-spacing"),
        },
        fixable: "whitespace",
        schema: [
            {
                type: "object",
                properties: {
                    before: { type: "boolean" },
                    after: { type: "boolean" },
                    overrides: {
                        type: "object",
                        properties: {
                            colon: definition,
                            arrow: definition,
                        },
                        additionalProperties: false,
                    },
                },
            },
        ],
    },

    create(context) {
        const punctuators = [":", "=>"];
        const sourceCode = context.getSourceCode();
        const options = context.options[0] || {};

        const overrides = options.overrides || {};

        const colonOptions = Object.assign(
            {},
            { before: false, after: true },
            options,
            overrides.colon
        );
        const arrowOptions = Object.assign(
            {},
            { before: true, after: true },
            options,
            overrides.arrow
        );

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if there's proper spacing around type annotations (no space
         * before colon, one space after).
         * @param {ASTNode} typeAnnotation The TSTypeAnnotation node.
         * @returns {void}
         * @private
         */
        function checkTypeAnnotationSpacing(typeAnnotation) {
            const nextToken = typeAnnotation;
            const punctuatorTokenEnd = sourceCode.getTokenBefore(nextToken);
            let punctuatorTokenStart = punctuatorTokenEnd;
            let previousToken = sourceCode.getTokenBefore(punctuatorTokenEnd);
            let type = punctuatorTokenEnd.value;

            if (punctuators.indexOf(type) === -1) {
                return;
            }

            const before =
                type === ":" ? colonOptions.before : arrowOptions.before;
            const after =
                type === ":" ? colonOptions.after : arrowOptions.after;

            if (type === ":" && previousToken.value === "?") {
                // shift the start to the ?
                type = "?:";
                punctuatorTokenStart = previousToken;
                previousToken = sourceCode.getTokenBefore(previousToken);

                // handle the +/- modifiers for optional modification operators
                if (
                    previousToken.value === "+" ||
                    previousToken.value === "-"
                ) {
                    type = `${previousToken.value}?:`;
                    punctuatorTokenStart = previousToken;
                    previousToken = sourceCode.getTokenBefore(previousToken);
                }
            }

            const previousDelta =
                punctuatorTokenStart.range[0] - previousToken.range[1];
            const nextDelta = nextToken.range[0] - punctuatorTokenEnd.range[1];

            if (after && nextDelta === 0) {
                context.report({
                    node: punctuatorTokenEnd,
                    message: "Expected a space after the '{{type}}'.",
                    data: {
                        type,
                    },
                    fix(fixer) {
                        return fixer.insertTextAfter(punctuatorTokenEnd, " ");
                    },
                });
            } else if (!after && nextDelta > 0) {
                context.report({
                    node: punctuatorTokenEnd,
                    message: "Unexpected space after the '{{type}}'.",
                    data: {
                        type,
                    },
                    fix(fixer) {
                        return fixer.removeRange([
                            punctuatorTokenEnd.range[1],
                            nextToken.range[0],
                        ]);
                    },
                });
            }

            if (before && previousDelta === 0) {
                context.report({
                    node: punctuatorTokenStart,
                    message: "Expected a space before the '{{type}}'.",
                    data: {
                        type,
                    },
                    fix(fixer) {
                        return fixer.insertTextAfter(previousToken, " ");
                    },
                });
            } else if (!before && previousDelta > 0) {
                context.report({
                    node: punctuatorTokenStart,
                    message: "Unexpected space before the '{{type}}'.",
                    data: {
                        type,
                    },
                    fix(fixer) {
                        return fixer.removeRange([
                            previousToken.range[1],
                            punctuatorTokenStart.range[0],
                        ]);
                    },
                });
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSTypeAnnotation(node) {
                checkTypeAnnotationSpacing(node.typeAnnotation);
            },
        };
    },
};
