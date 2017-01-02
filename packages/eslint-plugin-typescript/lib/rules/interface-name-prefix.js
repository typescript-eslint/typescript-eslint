/**
 * @fileoverview Enforces interface names are prefixed with "I".
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Enforces interface names are prefixed with \"I\".",
            category: "TypeScript"
        },
        schema: [
            {
                enum: ["never", "always"]
            }
        ]
    },

    create: function(context) {
        var never = context.options[0] !== "always";
        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if a string is prefixed with "I".
         * @param {string} name The string to check
         * @returns {boolean} true if it is prefixed with "I"
         * @private
         */
        function isPrefixedWithI(name) {
            if (typeof name !== "string") {
                return false;
            }
            if (name.length === 0) {
                return false;
            }
            var first = name.charAt(0);
            var second = name.charAt(1);
            if (second === "") {
                return false;
            }
            if (first !== "I" || second !== second.toUpperCase()) {
                return false;
            }
            return true;
        }

        /**
         * Checks if interface is prefixed with "I".
         * @param {ASTNode} interfaceNode The node representing an Interface.
         * @returns {void}
         * @private
         */
        function checkInterfacePrefix(interfaceNode) {
            if (never) {
                if (isPrefixedWithI(interfaceNode.name.name)) {
                    context.report({
                        node: interfaceNode.name,
                        message: "Interface name must not be prefixed with \"I\""
                    });
                }
            } else {
                if (!isPrefixedWithI(interfaceNode.name.name)) {
                    context.report({
                        node: interfaceNode.name,
                        message: "Interface name must be prefixed with \"I\""
                    });
                }
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSInterfaceDeclaration: checkInterfacePrefix
        };
    }
};
