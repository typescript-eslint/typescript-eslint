/**
 * @fileoverview Enforces explicit return type for functions
 * @author Scott O'Hara
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
                "Require explicit return types on functions and class methods",

            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/explicit-function-return-type.md"
        },
        schema: [
            {
                type: "object",
                properties: {
                    allowExpressions: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const options = context.options[0] || {};

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
                options.allowExpressions &&
                node.type !== "FunctionDeclaration" &&
                node.parent.type !== "VariableDeclarator"
            ) {
                return;
            }

            if (
                !node.returnType &&
                !isConstructor(node.parent) &&
                !isSetter(node.parent) &&
                util.isTypescript(context.getFilename())
            ) {
                context.report({
                    node,
                    message: `Missing return type on function.`
                });
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            FunctionDeclaration: checkFunctionReturnType,
            FunctionExpression: checkFunctionReturnType,
            ArrowFunctionExpression: checkFunctionReturnType
        };
    }
};
