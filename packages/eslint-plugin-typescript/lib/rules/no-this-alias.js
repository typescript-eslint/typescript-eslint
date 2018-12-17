/**
 * @fileoverview Disallow aliasing `this`
 * @author Jed Fox
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallow aliasing `this`",
            extraDescription: [util.tslintRule("no-this-assignment")],
            category: "Best Practices",
            recommended: false,
            url: util.metaDocsUrl("no-this-alias"),
        },
        fixable: null,
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    allowDestructuring: {
                        type: "boolean",
                    },
                    allowedNames: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },
            },
        ],
        messages: {
            thisAssignment: "Unexpected aliasing of 'this' to local variable.",
            thisDestructure:
                "Unexpected aliasing of members of 'this' to local variables.",
        },
    },

    create(context) {
        const { allowDestructuring = false, allowedNames = [] } =
            context.options[0] || {};

        return {
            VariableDeclarator(node) {
                const { id, init } = node;

                if (init.type !== "ThisExpression") return;
                if (allowDestructuring && node.id.type !== "Identifier") return;

                if (!allowedNames.includes(id.name)) {
                    context.report({
                        node: id,
                        messageId:
                            id.type === "Identifier"
                                ? "thisAssignment"
                                : "thisDestructure",
                    });
                }
            },
        };
    },
};
