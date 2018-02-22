/**
 * @fileoverview Enforces explicit accessibility modifier for class members
 * @author Danny Fritz
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
                "Require explicit accessibility modifiers on class properties and methods",
            extraDescription: [util.tslintRule("member-access")],
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/explicit-member-accessibility.md"
        },
        schema: []
    },

    create(context) {
        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if a method declaration has an accessibility modifier.
         * @param {ASTNode} methodDefinition The node representing a MethodDefinition.
         * @returns {void}
         * @private
         */
        function checkMethodAccessibilityModifier(methodDefinition) {
            if (
                !methodDefinition.accessibility &&
                util.isTypescript(context.getFilename())
            ) {
                context.report({
                    node: methodDefinition,
                    message: `Missing accessibility modifier on method definition ${
                        methodDefinition.key.name
                    }.`
                });
            }
        }

        /**
         * Checks if property has an accessibility modifier.
         * @param {ASTNode} classProperty The node representing a ClassProperty.
         * @returns {void}
         * @private
         */
        function checkPropertyAccessibilityModifier(classProperty) {
            if (
                !classProperty.accessibility &&
                util.isTypescript(context.getFilename())
            ) {
                context.report({
                    node: classProperty,
                    message: `Missing accessibility modifier on class property ${
                        classProperty.key.name
                    }.`
                });
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            ClassProperty: checkPropertyAccessibilityModifier,
            MethodDefinition: checkMethodAccessibilityModifier
        };
    }
};
