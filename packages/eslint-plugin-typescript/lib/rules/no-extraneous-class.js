/**
 * @fileoverview Forbids the use of classes as namespaces
 * @author Jed Fox
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
    {
        allowConstructorOnly: false,
        allowEmpty: false,
        allowStaticOnly: false,
    },
];

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Forbids the use of classes as namespaces",
            extraDescription: [util.tslintRule("no-unnecessary-class")],
            category: "Best Practices",
            url: util.metaDocsUrl("no-extraneous-class"),
            recommended: false,
        },
        fixable: null,
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    allowConstructorOnly: {
                        type: "boolean",
                    },
                    allowEmpty: {
                        type: "boolean",
                    },
                    allowStaticOnly: {
                        type: "boolean",
                    },
                },
            },
        ],
        messages: {
            empty: "Unexpected empty class.",
            onlyStatic: "Unexpected class with only static properties.",
            onlyConstructor: "Unexpected class with only a constructor.",
        },
    },

    create(context) {
        const {
            allowConstructorOnly,
            allowEmpty,
            allowStaticOnly,
        } = util.applyDefault(defaultOptions, context.options)[0];

        return {
            ClassBody(node) {
                const { id, superClass } = node.parent;

                if (superClass) return;

                if (node.body.length === 0) {
                    if (allowEmpty) return;
                    context.report({ node: id, messageId: "empty" });
                    return;
                }

                let onlyStatic = true;
                let onlyConstructor = true;

                for (const prop of node.body) {
                    if (prop.kind === "constructor") {
                        if (
                            prop.value.params.some(
                                param => param.type === "TSParameterProperty"
                            )
                        ) {
                            onlyConstructor = false;
                            onlyStatic = false;
                        }
                    } else {
                        onlyConstructor = false;
                        if (!prop.static) {
                            onlyStatic = false;
                        }
                    }
                    if (!(onlyStatic || onlyConstructor)) break;
                }

                if (onlyConstructor) {
                    if (!allowConstructorOnly) {
                        context.report({
                            node: id,
                            messageId: "onlyConstructor",
                        });
                    }
                    return;
                }
                if (onlyStatic && !allowStaticOnly) {
                    context.report({ node: id, messageId: "onlyStatic" });
                }
            },
        };
    },
};
