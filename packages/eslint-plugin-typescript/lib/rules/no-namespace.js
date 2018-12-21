/**
 * @fileoverview Disallows the use of custom TypeScript modules and namespaces.
 * @author Patricio Trevino
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Disallow the use of custom TypeScript modules and namespaces",
            extraDescription: [util.tslintRule("no-namespace")],
            category: "TypeScript",
            url: util.metaDocsUrl("no-namespace"),
        },
        messages: {
            moduleSyntaxIsPreferred:
                "ES2015 module syntax is preferred over custom TypeScript modules and namespaces.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    allowDeclarations: {
                        type: "boolean",
                    },
                    allowDefinitionFiles: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        const options = context.options[0] || {};
        const allowDeclarations = options.allowDeclarations || false;
        const allowDefinitionFiles = options.allowDefinitionFiles || false;
        const filename = context.getFilename();

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            "TSModuleDeclaration[global!=true][id.type='Identifier']"(node) {
                if (
                    (node.parent &&
                        node.parent.type === "TSModuleDeclaration") ||
                    (allowDefinitionFiles && util.isDefinitionFile(filename)) ||
                    (allowDeclarations && node.declare === true)
                ) {
                    return;
                }

                context.report({
                    node,
                    messageId: "moduleSyntaxIsPreferred",
                });
            },
        };
    },
};
