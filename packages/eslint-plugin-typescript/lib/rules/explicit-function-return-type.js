/**
 * @fileoverview Enforces explicit return type for functions
 * @author Scott O'Hara
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Require explicit return types on functions and class methods",
            category: "TypeScript"
        },
        schema: []
    },

    create(context) {
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
         * Check if the context file name is *.ts or *.tsx
         * @param {string} fileName The context file name
         * @returns {boolean} `true` if the file name ends in *.ts or *.tsx
         * @private
         */
        function isTypescript(fileName) {
            return /\.(ts|tsx)$/.test(fileName);
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
                isTypescript(context.getFilename())
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
