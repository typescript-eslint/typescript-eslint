/**
 * @fileoverview Disallows the use of type aliases.
 * @author Patricio Trevino
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
    {
        allowAliases: "never",
        allowCallbacks: "never",
        allowLiterals: "never",
        allowMappedTypes: "never",
    },
];

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Disallow the use of type aliases",
            extraDescription: [util.tslintRule("interface-over-type-literal")],
            category: "TypeScript",
            url: util.metaDocsUrl("no-type-alias"),
            recommended: false,
        },
        messages: {
            noTypeAlias: "Type {{alias}} are not allowed.",
            noCompositionAlias:
                "{{typeName}} in {{compositionType}} types are not allowed.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    allowAliases: {
                        enum: [
                            "always",
                            "never",
                            "in-unions",
                            "in-intersections",
                            "in-unions-and-intersections",
                        ],
                    },
                    allowCallbacks: {
                        enum: ["always", "never"],
                    },
                    allowLiterals: {
                        enum: [
                            "always",
                            "never",
                            "in-unions",
                            "in-intersections",
                            "in-unions-and-intersections",
                        ],
                    },
                    allowMappedTypes: {
                        enum: [
                            "always",
                            "never",
                            "in-unions",
                            "in-intersections",
                            "in-unions-and-intersections",
                        ],
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        const {
            allowAliases,
            allowCallbacks,
            allowLiterals,
            allowMappedTypes,
        } = util.applyDefault(defaultOptions, context.options)[0];

        const unions = ["always", "in-unions", "in-unions-and-intersections"];
        const intersections = [
            "always",
            "in-intersections",
            "in-unions-and-intersections",
        ];
        const compositions = [
            "in-unions",
            "in-intersections",
            "in-unions-and-intersections",
        ];
        const aliasTypes = [
            "TSLastTypeNode",
            "TSArrayType",
            "TSTypeReference",
            "TSLiteralType",
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
         * @param {Object} node the location
         * @param {string} compositionType the type of composition this alias is part of (undefined if not
         *                                  part of a composition)
         * @param {boolean} isRoot a flag indicating we are dealing with the top level declaration.
         * @param {string} type the kind of type alias being validated.
         * @returns {string} the message to be displayed.
         * @private
         */
        function getMessage(node, compositionType, isRoot, type) {
            if (isRoot) {
                return {
                    node,
                    messageId: "noTypeAlias",
                    data: {
                        alias: type || "aliases",
                    },
                };
            }

            return {
                node,
                messageId: "noCompositionAlias",
                data: {
                    compositionType:
                        compositionType === "TSUnionType"
                            ? "union"
                            : "intersection",
                    typeName: util.upperCaseFirst(type),
                },
            };
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
                    context.report(
                        getMessage(node, compositionType, isTopLevel, "aliases")
                    );
                }
            } else if (isCallback(node)) {
                if (allowCallbacks === "never") {
                    context.report(
                        getMessage(
                            node,
                            compositionType,
                            isTopLevel,
                            "callbacks"
                        )
                    );
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
                    context.report(
                        getMessage(
                            node,
                            compositionType,
                            isTopLevel,
                            "literals"
                        )
                    );
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
                    context.report(
                        getMessage(
                            node,
                            compositionType,
                            isTopLevel,
                            "mapped types"
                        )
                    );
                }
            } else {
                context.report(getMessage(node, compositionType, isTopLevel));
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
            },
        };
    },
};
