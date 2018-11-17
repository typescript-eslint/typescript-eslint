/**
 * @fileoverview Disallows the use of type aliases.
 * @author Patricio Trevino
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallow the use of type aliases",
            extraDescription: [util.tslintRule("interface-over-type-literal")],
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/no-type-alias.md"
        },
        schema: [
            {
                type: "object",
                properties: {
                    allowAliases: {
                        enum: [
                            true,
                            false,
                            "always",
                            "never",
                            "in-unions",
                            "in-intersections",
                            "in-unions-and-intersections"
                        ]
                    },
                    allowCallbacks: {
                        enum: [true, false, "always", "never"]
                    },
                    allowLiterals: {
                        enum: [
                            true,
                            false,
                            "always",
                            "never",
                            "in-unions",
                            "in-intersections",
                            "in-unions-and-intersections"
                        ]
                    },
                    allowMappedTypes: {
                        enum: [
                            true,
                            false,
                            "always",
                            "never",
                            "in-unions",
                            "in-intersections",
                            "in-unions-and-intersections"
                        ]
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const options = context.options[0];

        const allowAliases = (options && options.allowAliases) || "never";
        const allowCallbacks = (options && options.allowCallbacks) || "never";
        const allowLiterals = (options && options.allowLiterals) || "never";
        const allowMappedTypes =
            (options && options.allowMappedTypes) || "never";

        const unions = [
            true,
            "always",
            "in-unions",
            "in-unions-and-intersections"
        ];
        const intersections = [
            true,
            "always",
            "in-intersections",
            "in-unions-and-intersections"
        ];
        const compositions = [
            "in-unions",
            "in-intersections",
            "in-unions-and-intersections"
        ];
        const aliasTypes = [
            "TSLastTypeNode",
            "TSArrayType",
            "TSTypeReference",
            "TSLiteralType"
        ];

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Determines if the given node is a union or an intersection.
         * @param {TSNode} node the node to be evaluated.
         * @returns {boolean} true when node if a union or intersection.
         * @private
         */
        function isComposition(node) {
            return (
                node &&
                (node.type === "TSUnionType" ||
                    node.type === "TSIntersectionType")
            );
        }

        /**
         * Determines if the composition type is supported by the allowed flags.
         * @param {boolean} isTopLevel a flag indicating this is the top level node.
         * @param {string} compositionType the composition type (either TSUnionType or TSIntersectionType)
         * @param {string} allowed the currently allowed flags.
         * @returns {boolean} true if the composition type supported by the allowed flags.
         * @private
         */
        function isSupportedComposition(isTopLevel, compositionType, allowed) {
            return (
                compositions.indexOf(allowed) === -1 ||
                (!isTopLevel &&
                    ((compositionType === "TSUnionType" &&
                        unions.indexOf(allowed) > -1) ||
                        (compositionType === "TSIntersectionType" &&
                            intersections.indexOf(allowed) > -1)))
            );
        }

        /**
         * Determines if the given node is an alias type (keywords, arrays, type references and constants).
         * @param {TSNode} node the node to be evaluated.
         * @returns {boolean} true when the node is an alias type.
         * @private
         */
        function isAlias(node) {
            return (
                node &&
                (/Keyword$/.test(node.type) ||
                    aliasTypes.indexOf(node.type) > -1)
            );
        }

        /**
         * Determines if the given node is a callback type.
         * @param {TSNode} node the node to be evaluated.
         * @returns {boolean} true when the node is a callback type.
         * @private
         */
        function isCallback(node) {
            return node && node.type === "TSFunctionType";
        }

        /**
         * Determines if the given node is a literal type (objects).
         * @param {TSNode} node the node to be evaluated.
         * @returns {boolean} true when the node is a literal type (object).
         * @private
         */
        function isLiteral(node) {
            return node && node.type === "TSTypeLiteral";
        }

        /**
         * Determines if the given node is a mapped type.
         * @param {TSNode} node the node to be evaluated.
         * @returns {boolean} true when the node is a mapped type.
         * @private
         */
        function isMappedType(node) {
            return node && node.type === "TSMappedType";
        }

        /**
         * Gets the message to be displayed based on the node type and whether the node is a top level declaration.
         * @param {string} compositionType the type of composition this alias is part of (undefined if not
         *                                  part of a composition)
         * @param {boolean} isRoot a flag indicating we are dealing with the top level declaration.
         * @param {string} type the kind of type alias being validated.
         * @returns {string} the message to be displayed.
         * @private
         */
        function getMessage(compositionType, isRoot, type) {
            if (isRoot) {
                return type
                    ? `Type ${type} are not allowed`
                    : "Type aliases are not allowed";
            }

            return compositionType === "TSUnionType"
                ? `${type[0].toUpperCase()}${type.substring(
                      1
                  )} in union types are not allowed`
                : `${type[0].toUpperCase()}${type.substring(
                      1
                  )} in intersection types are not allowed`;
        }

        /**
         * Validates the node looking for aliases, callbacks and literals.
         * @param {TSNode} node the node to be validated.
         * @param {boolean} isTopLevel a flag indicating this is the top level node.
         * @param {boolean} compositionType the type of composition this alias is part of (undefined if not
         *                                  part of a composition)
         * @returns {void}
         * @private
         */
        function validateTypeAliases(node, isTopLevel, compositionType) {
            if (isAlias(node)) {
                if (
                    allowAliases === "never" ||
                    !isSupportedComposition(
                        isTopLevel,
                        compositionType,
                        allowAliases
                    )
                ) {
                    context.report({
                        node,
                        message: getMessage(
                            compositionType,
                            isTopLevel,
                            "aliases"
                        )
                    });
                }
            } else if (isCallback(node)) {
                if (allowCallbacks === "never") {
                    context.report({
                        node,
                        message: getMessage(
                            compositionType,
                            isTopLevel,
                            "callbacks"
                        )
                    });
                }
            } else if (isLiteral(node)) {
                if (
                    allowLiterals === "never" ||
                    !isSupportedComposition(
                        isTopLevel,
                        compositionType,
                        allowLiterals
                    )
                ) {
                    context.report({
                        node,
                        message: getMessage(
                            compositionType,
                            isTopLevel,
                            "literals"
                        )
                    });
                }
            } else if (isMappedType(node)) {
                if (
                    allowMappedTypes === "never" ||
                    !isSupportedComposition(
                        isTopLevel,
                        compositionType,
                        allowMappedTypes
                    )
                ) {
                    context.report({
                        node,
                        message: getMessage(
                            compositionType,
                            isTopLevel,
                            "mapped types"
                        )
                    });
                }
            } else {
                context.report({
                    node,
                    message: getMessage(compositionType, isTopLevel)
                });
            }
        }

        /**
         * Validates compositions (unions and/or intersections).
         * @param {TSNode} node the node to be validated.
         * @returns {void}
         * @private
         */
        function validateCompositions(node) {
            node.types.forEach(type => {
                if (isComposition(type)) {
                    validateCompositions(type);
                } else {
                    validateTypeAliases(type, false, node.type);
                }
            });
        }

        /**
         * Validates the node looking for compositions, aliases, callbacks and literals.
         * @param {TSNode} node the node to be validated.
         * @param {boolean} isTopLevel a flag indicating this is the top level node.
         * @returns {void}
         * @private
         */
        function validateNode(node, isTopLevel) {
            if (isComposition(node)) {
                validateCompositions(node);
            } else {
                validateTypeAliases(node, isTopLevel);
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            VariableDeclaration(node) {
                if (node.kind === "type") {
                    validateNode(node.declarations[0].init, true);
                }
            }
        };
    }
};
