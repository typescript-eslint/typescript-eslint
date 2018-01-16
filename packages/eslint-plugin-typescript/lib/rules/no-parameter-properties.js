/**
 * @fileoverview Disallows parameter properties in class constructors.
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
            description:
                "Disallow the use of parameter properties in class constructors.",
            extraDescription: [util.tslintRule("no-parameter-properties")],
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/no-parameter-properties.md"
        },
        schema: [
            {
                type: "object",
                properties: {
                    allows: {
                        type: "array",
                        items: {
                            enum: [
                                "readonly",
                                "private",
                                "protected",
                                "public",
                                "private readonly",
                                "protected readonly",
                                "public readonly"
                            ]
                        },
                        minItems: 1
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const options = context.options[0] || {};
        const allows = options.allows || [];

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Gets the modifiers of `node`.
         * @param {ASTNode} node the node to be inspected.
         * @returns {string} the modifiers of node
         * @private
         */
        function getModifiers(node) {
            const modifiers = [];

            modifiers.push(node.accessibility);
            if (node.readonly || node.isReadonly) {
                modifiers.push("readonly");
            }

            return modifiers.filter(Boolean).join(" ");
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSParameterProperty(node) {
                const modifiers = getModifiers(node);

                if (allows.indexOf(modifiers) === -1) {
                    context.report({
                        node,
                        message:
                            "Property {{parameter}} cannot be declared in the constructor",
                        data: {
                            parameter: node.parameter.name
                        }
                    });
                }
            }
        };
    }
};
