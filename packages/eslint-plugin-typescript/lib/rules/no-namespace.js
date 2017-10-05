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
            description:
                "Disallow the use of custom TypeScript modules and namespaces",
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

    create(context) {
        const allowDeclarations = context.options[0]
            ? context.options[0].allowDeclarations
            : false;
        const allowDefinitionFiles = context.options[0]
            ? context.options[0].allowDefinitionFiles
            : false;

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
            return node.id && node.id.type === "Literal";
        }

        /**
         * Determines if node is a module/namespace declaration.
         * @param {ASTNode} node the node to be evaluated.
         * @returns {boolean} true when dealing with declarations.
         * @private
         */
        function isDeclaration(node) {
            return (
                node.declare === true && !isTypeScriptModuleDeclaration(node)
            );
        }

        /**
         * Determines if node is part of a declaration file (d.ts).
         * @returns {boolean} true when dealing with declaration files.
         * @private
         */
        function isDefinitionFile() {
            const filename = context.getFilename();

            return filename
                ? filename.slice(-5).toLowerCase() === ".d.ts"
                : false;
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSModuleDeclaration(node) {
                if (
                    isTypeScriptModuleDeclaration(node) ||
                    (allowDefinitionFiles && isDefinitionFile()) ||
                    (allowDeclarations && isDeclaration(node))
                ) {
                    return;
                }

                context.report({
                    node,
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces"
                });
            }
        };
    }
};
