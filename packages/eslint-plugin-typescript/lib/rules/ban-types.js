/**
 * @fileoverview Enforces that types will not to be used
 * @author Armano <https://github.com/armano2>
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
    {
        types: {
            String: {
                message: "Use string instead",
                fixWith: "string",
            },
            Boolean: {
                message: "Use boolean instead",
                fixWith: "boolean",
            },
            Number: {
                message: "Use number instead",
                fixWith: "number",
            },
            Object: {
                message: "Use Record<string, any> instead",
                fixWith: "Record<string, any>",
            },
            Symbol: {
                message: "Use symbol instead",
                fixWith: "symbol",
            },
        },
    },
];

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforces that types will not to be used",
            extraDescription: [util.tslintRule("ban-types")],
            category: "TypeScript",
            url: util.metaDocsUrl("ban-types"),
            recommended: "error",
        },
        fixable: "code",
        messages: {
            bannedTypeMessage:
                "Don't use '{{name}}' as a type.{{customMessage}}",
        },
        schema: [
            {
                type: "object",
                properties: {
                    types: {
                        type: "object",
                        additionalProperties: {
                            oneOf: [
                                { type: "null" },
                                { type: "string" },
                                {
                                    type: "object",
                                    properties: {
                                        message: { type: "string" },
                                        fixWith: { type: "string" },
                                    },
                                    additionalProperties: false,
                                },
                            ],
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        const banedTypes = util.applyDefault(defaultOptions, context.options)[0]
            .types;

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            "TSTypeReference Identifier"(node) {
                if (node.parent && node.parent.type !== "TSQualifiedName") {
                    if (node.name in banedTypes) {
                        let customMessage = "";
                        const bannedCfgValue = banedTypes[node.name];
                        let fixWith = null;

                        if (typeof bannedCfgValue === "string") {
                            customMessage += ` ${bannedCfgValue}`;
                        } else if (bannedCfgValue !== null) {
                            if (bannedCfgValue.message) {
                                customMessage += ` ${bannedCfgValue.message}`;
                            }
                            if (bannedCfgValue.fixWith) {
                                fixWith = bannedCfgValue.fixWith;
                            }
                        }

                        context.report({
                            node,
                            messageId: "bannedTypeMessage",
                            data: {
                                name: node.name,
                                customMessage,
                            },
                            fix:
                                fixWith !== null &&
                                (fixer => fixer.replaceText(node, fixWith)),
                        });
                    }
                }
            },
        };
    },
};
