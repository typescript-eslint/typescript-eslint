/**
 * @fileoverview Enforces explicit return type for functions
 * @author Scott O'Hara
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
    {
        allowExpressions: true,
    },
];

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Require explicit return types on functions and class methods",
            category: "TypeScript",
            url: util.metaDocsUrl("explicit-function-return-type"),
            recommended: "warn",
        },
        schema: [
            {
                type: "object",
                properties: {
                    allowExpressions: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        const options = util.applyDefault(defaultOptions, context.options)[0];

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if the parent of a function expression is a constructor.
         * @param {ASTNode} parent The parent of a function expression node
         * @returns {boolean} `true` if the parent is a constructor
         * @private
         */
        function isConstructor(parent) {
            return (
                parent.type === "MethodDefinition" &&
                parent.kind === "constructor"
            );
        }

        /**
         * Checks if the parent of a function expression is a setter.
         * @param {ASTNode} parent The parent of a function expression node
         * @returns {boolean} `true` if the parent is a setter
         * @private
         */
        function isSetter(parent) {
            return parent.type === "MethodDefinition" && parent.kind === "set";
        }

        /**
         * Checks if a function declaration/expression has a return type.
         * @param {ASTNode} node The node representing a function.
         * @returns {void}
         * @private
         */
        function checkFunctionReturnType(node) {
            if (
                !node.returnType &&
                !isConstructor(node.parent) &&
                !isSetter(node.parent) &&
                util.isTypescript(context.getFilename())
            ) {
                context.report({
                    node,
                    message: `Missing return type on function.`,
                });
            }
        }

        /**
         * Checks if a function declaration/expression has a return type.
         * @param {ASTNode} node The node representing a function.
         * @returns {void}
         * @private
         */
        function checkFunctionExpressionReturnType(node) {
            if (
                options.allowExpressions &&
                node.parent.type !== "VariableDeclarator" &&
                node.parent.type !== "MethodDefinition"
            ) {
                return;
            }

            checkFunctionReturnType(node);
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            FunctionDeclaration: checkFunctionReturnType,
            FunctionExpression: checkFunctionExpressionReturnType,
            ArrowFunctionExpression: checkFunctionExpressionReturnType,
        };
    },
};
