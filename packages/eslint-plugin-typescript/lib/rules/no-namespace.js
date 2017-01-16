/**
 * @fileoverview Disallows the use of custom TypeScript modules and namespaces.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallows the use of custom TypeScript modules and namespaces.",
            category: "TypeScript"
        },
        schema: [
            {
                type: "object",
                properties: {
                    allowDeclarations: {
                        type: "boolean"
                    },
                    allowDefinitionFiles: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create: function(context) {

        var allowDeclarations = context.options[0] ? context.options[0].allowDeclarations : false;
        var allowDefinitionFiles = context.options[0] ? context.options[0].allowDefinitionFiles : false;

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
         * Determines if node is a module/namespace declaration.
         * @param {ASTNode} node the node to be evaluated.
         * @returns {boolean} true when dealing with declarations.
         * @private
         */
        function isDeclaration(node) {
            var hasDeclareModifier = (node.modifiers || []).filter(m => m.type === "TSDeclareKeyword").length > 0;
            return hasDeclareModifier && !isTypeScriptModuleDeclaration(node);
        }

        /**
         * Determines if node is part of a declaration file (d.ts).
         * @returns {boolean} true when dealing with declaration files.
         * @private
         */
        function isDefinitionFile() {
            var filename = context.getFilename();
            return filename ? filename.slice(-5).toLowerCase() === ".d.ts" : false;
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSModuleDeclaration: function(node) {
                if (isTypeScriptModuleDeclaration(node) ||
                    (allowDefinitionFiles && isDefinitionFile()) ||
                    (allowDeclarations && isDeclaration(node))) {
                    return;
                }

                context.report({
                    node,
                    message: "ES2015 module syntax is preferred over custom TypeScript modules and namespaces"
                });
            }
        };
    }
};
