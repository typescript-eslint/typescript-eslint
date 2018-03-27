/**
 * @fileoverview Enforces a standard member declaration order.
 * @author Patricio Trevino
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const schemaOptions = ["field", "method", "constructor"].reduce(
    (options, type) => {
        options.push(type);

        ["public", "protected", "private"].forEach(accessibility => {
            options.push(`${accessibility}-${type}`);
            if (type !== "constructor") {
                ["static", "instance"].forEach(scope => {
                    if (options.indexOf(`${scope}-${type}`) === -1) {
                        options.push(`${scope}-${type}`);
                    }
                    options.push(`${accessibility}-${scope}-${type}`);
                });
            }
        });

        return options;
    },
    []
);

module.exports = {
    meta: {
        docs: {
            description: "Require a consistent member declaration order",
            extraDescription: [util.tslintRule("member-ordering")],
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/member-ordering.md"
        },
        schema: [
            {
                type: "object",
                properties: {
                    default: {
                        oneOf: [
                            {
                                enum: ["never"]
                            },
                            {
                                type: "array",
                                items: {
                                    enum: schemaOptions
                                }
                            }
                        ]
                    },
                    classes: {
                        oneOf: [
                            {
                                enum: ["never"]
                            },
                            {
                                type: "array",
                                items: {
                                    enum: schemaOptions
                                }
                            }
                        ]
                    },
                    classExpressions: {
                        oneOf: [
                            {
                                enum: ["never"]
                            },
                            {
                                type: "array",
                                items: {
                                    enum: schemaOptions
                                }
                            }
                        ]
                    },
                    interfaces: {
                        oneOf: [
                            {
                                enum: ["never"]
                            },
                            {
                                type: "array",
                                items: {
                                    enum: ["field", "method", "constructor"]
                                }
                            }
                        ]
                    },
                    typeLiterals: {
                        oneOf: [
                            {
                                enum: ["never"]
                            },
                            {
                                type: "array",
                                items: {
                                    enum: ["field", "method", "constructor"]
                                }
                            }
                        ]
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const options = context.options[0] || {};

        const functionExpressions = [
            "FunctionExpression",
            "ArrowFunctionExpression"
        ];
        const defaultOrder = [
            "public-static-field",
            "protected-static-field",
            "private-static-field",

            "public-instance-field",
            "protected-instance-field",
            "private-instance-field",

            "public-field",
            "protected-field",
            "private-field",

            "static-field",
            "instance-field",

            "field",

            "constructor",

            "public-static-method",
            "protected-static-method",
            "private-static-method",

            "public-instance-method",
            "protected-instance-method",
            "private-instance-method",

            "public-method",
            "protected-method",
            "private-method",

            "static-method",
            "instance-method",

            "method"
        ];

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Determines if `node` should be processed as a method instead of a field.
         * @param {ASTNode} node the node to be inspected.
         * @returns {boolean} `true` if node should be processed as a method; `false` for fields.
         * @private
         */
        function shouldBeProcessedAsMethod(node) {
            // check for bound methods in ClassProperty nodes.
            return (
                node.value && functionExpressions.indexOf(node.value.type) > -1
            );
        }

        /**
         * Gets the node type.
         * @param {ASTNode} node the node to be evaluated.
         * @returns {string|null} the type of the node.
         * @private
         */
        function getNodeType(node) {
            switch (node.type) {
                case "MethodDefinition":
                    return node.kind;
                case "TSMethodSignature":
                    return "method";
                case "TSConstructSignature":
                    return "constructor";
                case "ClassProperty":
                case "TSPropertySignature":
                    return shouldBeProcessedAsMethod(node) ? "method" : "field";
                default:
                    return null;
            }
        }

        /**
         * Gets the member name based on the member type.
         * @param {ASTNode} node the node to be evaluated.
         * @returns {string|null} the name of the member.
         * @private
         */
        function getMemberName(node) {
            switch (node.type) {
                case "ClassProperty":
                case "MethodDefinition":
                    return node.kind === "constructor"
                        ? "constructor"
                        : node.key.name;
                case "TSPropertySignature":
                case "TSMethodSignature":
                    return node.key.name;
                case "TSConstructSignature":
                    return "new";
                default:
                    return null;
            }
        }

        /**
         * Gets the calculated rank using the provided method definition.
         * The algorithm is as follows:
         * - Get the rank based on the accessibility-scope-type name, e.g. public-instance-field
         * - If there is no order for accessibility-scope-type, then strip out the accessibility.
         * - If there is no order for scope-type, then strip out the scope.
         * - If there is no order for type, then return -1
         * @param {Array} names the valid names to be validated.
         * @param {Array} order the current order to be validated.
         * @returns {number} the rank of the method definition in the given order.
         * @private
         */
        function getRankOrder(names, order) {
            let rank = -1;
            const stack = names.slice();

            while (stack.length > 0 && rank === -1) {
                rank = order.indexOf(stack.shift());
            }

            return rank;
        }

        /**
         * Gets the rank of the node given the order.
         * @param {ASTNode} node the node to be evaluated.
         * @param {Array} order the current order to be validated.
         * @param {boolean} supportsModifiers a flag indicating whether the type supports modifiers or not.
         * @returns {number} the rank of the node.
         * @private
         */
        function getRank(node, order, supportsModifiers) {
            const type = getNodeType(node);
            const scope = node.static ? "static" : "instance";
            const accessibility = node.accessibility || "public";

            const names = [];

            if (supportsModifiers) {
                if (type !== "constructor") {
                    names.push(`${accessibility}-${scope}-${type}`);
                    names.push(`${scope}-${type}`);
                }
                names.push(`${accessibility}-${type}`);
            }

            names.push(type);

            return getRankOrder(names, order);
        }

        /**
         * Gets the lowest possible rank higher than target.
         * e.g. given the following order:
         *   ...
         *   public-static-method
         *   protected-static-method
         *   private-static-method
         *   public-instance-method
         *   protected-instance-method
         *   private-instance-method
         *   ...
         * and considering that a public-instance-method has already been declared, so ranks contains
         * public-instance-method, then the lowest possible rank for public-static-method is
         * public-instance-method.
         * @param {Array} ranks the existing ranks in the object.
         * @param {number} target the target rank.
         * @param {Array} order the current order to be validated.
         * @returns {string} the name of the lowest possible rank without dashes (-).
         * @private
         */
        function getLowestRank(ranks, target, order) {
            let lowest = ranks[ranks.length - 1];

            ranks.forEach(rank => {
                if (rank > target) {
                    lowest = Math.min(lowest, rank);
                }
            });

            return order[lowest].replace(/-/g, " ");
        }

        /**
         * Validates each member rank.
         * @param {Array} members the members to be validated.
         * @param {(Array|string)} order the current order to be validated.
         * @param {boolean} supportsModifiers a flag indicating whether the type supports modifiers or not.
         * @returns {void}
         * @private
         */
        function validateMembers(members, order, supportsModifiers) {
            if (members && order !== "never") {
                const previousRanks = [];

                members.forEach(member => {
                    const rank = getRank(member, order, supportsModifiers);

                    if (rank !== -1) {
                        if (rank < previousRanks[previousRanks.length - 1]) {
                            context.report({
                                node: member,
                                message:
                                    "Member {{name}} should be declared before all {{rank}} definitions.",
                                data: {
                                    name: getMemberName(member),
                                    rank: getLowestRank(
                                        previousRanks,
                                        rank,
                                        order
                                    )
                                }
                            });
                        } else {
                            previousRanks.push(rank);
                        }
                    }
                });
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            ClassDeclaration(node) {
                validateMembers(
                    node.body.body,
                    options.classes || options.default || defaultOrder,
                    true
                );
            },
            ClassExpression(node) {
                validateMembers(
                    node.body.body,
                    options.classExpressions || options.default || defaultOrder,
                    true
                );
            },
            TSInterfaceDeclaration(node) {
                validateMembers(
                    node.body.body,
                    options.interfaces || options.default || defaultOrder,
                    false
                );
            },
            TSTypeLiteral(node) {
                validateMembers(
                    node.members,
                    options.typeLiterals || options.default || defaultOrder,
                    false
                );
            }
        };
    }
};
