/**
 * @fileoverview Enforces the use of the keyword `namespace` over `module` to declare custom TypeScript modules.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Enforces the use of the keyword namespace over module to declare custom TypeScript modules.",
            category: "TypeScript"
        },
        fixable: "code",
        schema: []
    },

    create: function(context) {

        var sourceCode = context.getSourceCode();

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Determines if node is a TypeScript module declaration (instead of a namespace/module).
         * @param {ASTNode} node the node to be evaluated.
         * @returns {boolean} true when node is an external declaration.
         * @private
         */
        function isTypeScriptModuleDeclaration(node) {
            return node.name && node.name.type === "Literal";
        }

        /**
         * Gets the start index of the keyword `module`.
         * @param {TSNode} node the node to be evaluated.
         * @returns {number} the start index.
         * @private
         */
        function getStartIndex(node) {
            if (node.modifiers && node.modifiers.length > 0 && node.modifiers[0].type === "TSDeclareKeyword") {
                return node.range[0] + "declare".length + 1;
            }
            return node.range[0];
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSModuleDeclaration: function(node) {
                var declaration = sourceCode.getText(node);
                if (isTypeScriptModuleDeclaration(node) || /\bnamespace\b/.test(declaration)) {
                    return;
                }

                context.report({
                    node,
                    message: "Use namespace instead of module to declare custom TypeScript modules",
                    fix(fixer) {
                        var start = getStartIndex(node);
                        return fixer.replaceTextRange([start, start + "module".length], "namespace");
                    }
                });
            }
        };
    }
};
