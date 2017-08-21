/**
 * @fileoverview Enforces explicit accessibility modifier for class members
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Enforces explicity accessibility modifiers for class members",
            category: "TypeScript"
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
            if (!methodDefinition.accessibility) {
                context.report({
                    node: methodDefinition,
                    message: `Missing accessibility modifier on method definition ${methodDefinition
                        .key.name}.`
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
            if (!classProperty.accessibility) {
                context.report({
                    node: classProperty,
                    message: `Missing accessibility modifier on class property ${classProperty
                        .key.name}.`
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
