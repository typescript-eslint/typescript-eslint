/**
 * @fileoverview Forbids an object literal to appear in a type assertion expression
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
            description:
                "Forbids an object literal to appear in a type assertion expression",
            extraDescription: [
                util.tslintRule("no-object-literal-type-assertion"),
            ],
            category: "TypeScript",
            url: util.metaDocsUrl("no-object-literal-type-assertions"),
        },
        messages: {
            unexpectedTypeAssertion:
                "Type assertion on object literals is forbidden, use a type annotation instead.",
        },
        schema: [],
    },
    create(context) {
        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        /**
         * Check whatever node should be reported
         * @param {ASTNode} node the node to be evaluated.
         * @returns {*} true or false
         */
        function checkType(node) {
            if (
                node &&
                node.type === "TSTypeAnnotation" &&
                node.typeAnnotation
            ) {
                switch (node.typeAnnotation.type) {
                    case "TSAnyKeyword":
                    case "TSUnknownKeyword":
                        return false;
                    default:
                        break;
                }
            }
            return true;
        }

        return {
            "TSTypeAssertionExpression, TSAsExpression"(node) {
                if (
                    checkType(node.typeAnnotation) &&
                    node.expression.type === "ObjectExpression"
                ) {
                    context.report({
                        node,
                        messageId: "unexpectedTypeAssertion",
                    });
                }
            },
        };
    },
};
