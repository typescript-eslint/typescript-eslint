/**
 * @fileoverview Enforces interface names are prefixed with "I".
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
            description: "Require that interface names be prefixed with `I`",
            extraDescription: [util.tslintRule("interface-name")],
            category: "TypeScript"
        },
        schema: [
            {
                enum: ["never", "always"]
            }
        ]
    },

    create(context) {
        const never = context.options[0] !== "always";

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
            const first = name.charAt(0);
            const second = name.charAt(1);

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
                if (isPrefixedWithI(interfaceNode.id.name)) {
                    context.report({
                        node: interfaceNode.id,
                        message: 'Interface name must not be prefixed with "I"'
                    });
                }
            } else {
                if (!isPrefixedWithI(interfaceNode.id.name)) {
                    context.report({
                        node: interfaceNode.id,
                        message: 'Interface name must be prefixed with "I"'
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
