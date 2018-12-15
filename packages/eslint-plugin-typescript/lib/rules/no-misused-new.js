/**
 * @fileoverview Enforce valid definition of `new` and `constructor`.
 * @author Armano <https://github.com/armano2>
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Enforce valid definition of `new` and `constructor`.",
            extraDescription: [util.tslintRule("no-misused-new")],
            category: "TypeScript",
            url: util.metaDocsUrl("no-misused-new"),
        },
        schema: [],
        messages: {
            errorMessageInterface:
                "Interfaces cannot be constructed, only classes.",
            errorMessageClass: "Class cannon have method named `new`.",
        },
    },

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    create(context) {
        /**
         * @param {ASTNode} node type to be inspected.
         * @returns {string|null} name of simple type or null
         */
        function getTypeReferenceName(node) {
            if (node) {
                switch (node.type) {
                    case "TSTypeAnnotation":
                        return getTypeReferenceName(node.typeAnnotation);
                    case "TSTypeReference":
                        return getTypeReferenceName(node.typeName);
                    case "Identifier":
                        return node.name;
                    default:
                        break;
                }
            }
            return null;
        }

        /**
         * @param {ASTNode} parent parent node.
         * @param {ASTNode} returnType type to be compared
         * @returns {boolean} returns true if type is parent type
         */
        function isMatchingParentType(parent, returnType) {
            if (parent && parent.id && parent.id.type === "Identifier") {
                return getTypeReferenceName(returnType) === parent.id.name;
            }
            return false;
        }

        return {
            "TSInterfaceBody > TSConstructSignature"(node) {
                if (
                    isMatchingParentType(
                        node.parent.parent,
                        node.typeAnnotation
                    )
                ) {
                    // constructor
                    context.report({
                        node,
                        messageId: "errorMessageInterface",
                    });
                }
            },
            "TSMethodSignature[key.name='constructor']"(node) {
                context.report({
                    node,
                    messageId: "errorMessageInterface",
                });
            },
            "ClassBody > MethodDefinition[key.name='new']"(node) {
                if (
                    node.value &&
                    (node.value.type === "TSEmptyBodyFunctionExpression" ||
                        node.value.type === "TSEmptyBodyFunctionDeclaration")
                ) {
                    if (
                        isMatchingParentType(
                            node.parent.parent,
                            node.value.returnType
                        )
                    ) {
                        context.report({
                            node,
                            messageId: "errorMessageClass",
                        });
                    }
                }
            },
        };
    },
};
