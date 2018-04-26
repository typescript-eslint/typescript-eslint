/**
 * @fileoverview Disallows explicit type declarations for inferrable types
 * @author James Garbutt <https://github.com/43081j>
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
                "Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean.",
            extraDescription: [util.tslintRule("no-inferrable-types")],
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/no-inferrable-types.md"
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    ignoreParameters: {
                        type: "boolean"
                    },
                    ignoreProperties: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const ignoreParameters = context.options[0]
            ? context.options[0].ignoreParameters
            : false;
        const ignoreProperties = context.options[0]
            ? context.options[0].ignoreProperties
            : false;

        /**
         * Returns whether a node has an inferrable value or not
         * @param {ASTNode} node the node to check
         * @param {ASTNode} init the initializer
         * @returns {boolean} whether the node has an inferrable type
         */
        function isInferrable(node, init) {
            if (node.type !== "TSTypeAnnotation" || !node.typeAnnotation) {
                return false;
            }

            if (!init) {
                return false;
            }

            const annotation = node.typeAnnotation;

            if (annotation.type === "TSStringKeyword") {
                return (
                    (init.type === "Literal" &&
                        typeof init.value === "string") ||
                    (init.type === "TemplateElement" &&
                        (!init.expressions || init.expressions.length === 0))
                );
            }

            if (annotation.type === "TSBooleanKeyword") {
                return init.type === "Literal";
            }

            if (annotation.type === "TSNumberKeyword") {
                // Infinity is special
                if (
                    (init.type === "UnaryExpression" &&
                        init.operator === "-" &&
                        init.argument.type === "Identifier" &&
                        init.argument.name === "Infinity") ||
                    (init.type === "Identifier" && init.name === "Infinity")
                ) {
                    return true;
                }

                return (
                    init.type === "Literal" && typeof init.value === "number"
                );
            }

            return false;
        }

        /**
         * Reports an inferrable type declaration, if any
         * @param {ASTNode} node the node being visited
         * @param {ASTNode} typeNode the type annotation node
         * @param {ASTNode} initNode the initializer node
         * @returns {void}
         */
        function reportInferrableType(node, typeNode, initNode) {
            if (!typeNode || !initNode || !typeNode.typeAnnotation) {
                return;
            }

            if (!isInferrable(typeNode, initNode)) {
                return;
            }

            const typeMap = {
                TSBooleanKeyword: "boolean",
                TSNumberKeyword: "number",
                TSStringKeyword: "string"
            };

            const type = typeMap[typeNode.typeAnnotation.type];

            context.report({
                node,
                message: `Type ${type} trivially inferred from a ${type} literal, remove type annotation`,
                fix: fixer => fixer.remove(typeNode)
            });
        }

        /**
         * Visits variables
         * @param {ASTNode} node the node to be visited
         * @returns {void}
         */
        function inferrableVariableVisitor(node) {
            if (!node.id) {
                return;
            }
            reportInferrableType(node, node.id.typeAnnotation, node.init);
        }

        /**
         * Visits parameters
         * @param {ASTNode} node the node to be visited
         * @returns {void}
         */
        function inferrableParameterVisitor(node) {
            if (ignoreParameters || !node.params) {
                return;
            }
            node.params
                .filter(
                    param =>
                        param.type === "AssignmentPattern" &&
                        param.left &&
                        param.right
                )
                .forEach(param => {
                    reportInferrableType(
                        param,
                        param.left.typeAnnotation,
                        param.right
                    );
                });
        }

        /**
         * Visits properties
         * @param {ASTNode} node the node to be visited
         * @returns {void}
         */
        function inferrablePropertyVisitor(node) {
            // We ignore `readonly` because of Microsoft/TypeScript#14416
            // Essentially a readonly property without a type
            // will result in its value being the type, leading to
            // compile errors if the type is stripped.
            if (ignoreProperties || node.readonly) {
                return;
            }
            reportInferrableType(node, node.typeAnnotation, node.value);
        }

        return {
            VariableDeclarator: inferrableVariableVisitor,
            FunctionExpression: inferrableParameterVisitor,
            FunctionDeclaration: inferrableParameterVisitor,
            ArrowFunctionExpression: inferrableParameterVisitor,
            ClassProperty: inferrablePropertyVisitor
        };
    }
};
