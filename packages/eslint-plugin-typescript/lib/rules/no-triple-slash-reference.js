/**
 * @fileoverview Enforces triple slash references are not used.
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Enforces triple slash references are not used.",
            category: "TypeScript"
        },
        schema: []
    },

    create: function(context) {
        var referenceRegExp = /^\/\s*<reference/;
        var sourceCode = context.getSourceCode();

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if property has an accessibility modifier.
         * @param {ASTNode} program The node representing a Program.
         * @returns {void}
         * @private
         */
        function checkTripleSlashReference(program) {
            var leading = sourceCode.getComments(program).leading;
            leading.forEach(function(comment) {
                if (comment.type !== "Line") {
                    return;
                }
                if (referenceRegExp.test(comment.value)) {
                    context.report({
                        node: comment,
                        message: "Do not use a triple slash reference"
                    });
                }
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            Program: checkTripleSlashReference
        };
    }
};
