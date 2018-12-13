/**
 * @fileoverview Requires using either `T[]` or `Array<T>` for arrays.
 * @author Mackie Underdown
 * @author Armano <https://github.com/armano2>
 */
"use strict";

const util = require("../util");

/**
 * Check whatever node can be considered as simple
 * @param {ASTNode} node the node to be evaluated.
 * @returns {*} true or false
 */
function isSimpleType(node) {
    switch (node.type) {
        case "Identifier":
        case "TSAnyKeyword":
        case "TSBooleanKeyword":
        case "TSNeverKeyword":
        case "TSNumberKeyword":
        case "TSObjectKeyword":
        case "TSStringKeyword":
        case "TSSymbolKeyword":
        case "TSUnknownKeyword":
        case "TSVoidKeyword":
        case "TSNullKeyword":
        case "TSArrayType":
        case "TSUndefinedKeyword":
        case "TSThisType":
        case "TSQualifiedName":
            return true;
        case "TSTypeReference":
            if (
                node.typeName &&
                node.typeName.type === "Identifier" &&
                node.typeName.name === "Array"
            ) {
                if (!node.typeParameters) {
                    return true;
                }
                if (node.typeParameters.params.length === 1) {
                    return isSimpleType(node.typeParameters.params[0]);
                }
            } else {
                if (node.typeParameters) {
                    return false;
                }
                return isSimpleType(node.typeName);
            }
            return false;
        default:
            return false;
    }
}

/**
 * Check if node needs parentheses
 * @param {ASTNode} node the node to be evaluated.
 * @returns {*} true or false
 */
function typeNeedsParentheses(node) {
    if (node.type === "TSTypeReference") {
        switch (node.typeName.type) {
            case "TSUnionType":
            case "TSFunctionType":
            case "TSIntersectionType":
            case "TSTypeOperator":
                return true;
            default:
                return false;
        }
    }
    return false;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Requires using either `T[]` or `Array<T>` for arrays",
            extraDescription: [util.tslintRule("array-type")],
            category: "TypeScript",
            url: util.metaDocsUrl("array-type"),
        },
        fixable: "code",
        messages: {
            errorStringGeneric:
                "Array type using '{{type}}[]' is forbidden. Use 'Array<{{type}}>' instead.",
            errorStringGenericSimple:
                "Array type using '{{type}}[]' is forbidden for non-simple types. Use 'Array<{{type}}>' instead.",
            errorStringArray:
                "Array type using 'Array<{{type}}>' is forbidden. Use '{{type}}[]' instead.",
            errorStringArraySimple:
                "Array type using 'Array<{{type}}>' is forbidden for simple types. Use '{{type}}[]' instead.",
        },
        schema: [
            {
                enum: ["array", "generic", "array-simple"],
            },
        ],
    },
    create(context) {
        const option = context.options[0] || "array";
        const sourceCode = context.getSourceCode();

        /**
         * Check if whitespace is needed before this node
         * @param {ASTNode} node the node to be evaluated.
         * @returns {boolean} true of false
         */
        function requireWhitespaceBefore(node) {
            const prevToken = sourceCode.getTokenBefore(node);

            if (node.range[0] - prevToken.range[1] > 0) {
                return false;
            }

            return prevToken.type === "Identifier";
        }

        /**
         * @param {ASTNode} node the node to be evaluated.
         * @returns {string} Type used in message
         */
        function getMessageType(node) {
            if (node) {
                if (node.type === "TSParenthesizedType") {
                    return getMessageType(node.typeAnnotation);
                }
                if (isSimpleType(node)) {
                    return sourceCode.getText(node);
                }
            }
            return "T";
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            TSArrayType(node) {
                if (
                    option === "array" ||
                    (option === "array-simple" &&
                        isSimpleType(node.elementType))
                ) {
                    return;
                }
                const messageId =
                    option === "generic"
                        ? "errorStringGeneric"
                        : "errorStringGenericSimple";

                context.report({
                    node,
                    messageId,
                    data: {
                        type: getMessageType(node.elementType),
                    },
                    fix(fixer) {
                        const startText = requireWhitespaceBefore(node);
                        const toFix = [
                            fixer.replaceTextRange(
                                [node.range[1] - 2, node.range[1]],
                                ">"
                            ),
                            fixer.insertTextBefore(
                                node,
                                `${startText ? " " : ""}Array<`
                            ),
                        ];

                        if (node.elementType.type === "TSParenthesizedType") {
                            toFix.push(
                                fixer.remove(
                                    sourceCode.getFirstToken(node.elementType)
                                )
                            );
                            toFix.push(
                                fixer.remove(
                                    sourceCode.getLastToken(node.elementType)
                                )
                            );
                        }

                        return toFix;
                    },
                });
            },
            TSTypeReference(node) {
                if (
                    option === "generic" ||
                    node.typeName.type !== "Identifier" ||
                    node.typeName.name !== "Array"
                ) {
                    return;
                }
                const messageId =
                    option === "array"
                        ? "errorStringArray"
                        : "errorStringArraySimple";

                const typeParams =
                    node.typeParameters && node.typeParameters.params;

                if (!typeParams || typeParams.length === 0) {
                    // Create an 'any' array
                    context.report({
                        node,
                        messageId,
                        data: {
                            type: "any",
                        },
                        fix(fixer) {
                            return fixer.replaceText(node, "any[]");
                        },
                    });
                    return;
                }

                if (
                    typeParams.length !== 1 ||
                    (option === "array-simple" && !isSimpleType(typeParams[0]))
                ) {
                    return;
                }

                const type = typeParams[0];
                const parens = typeNeedsParentheses(type);

                context.report({
                    node,
                    messageId,
                    data: {
                        type: getMessageType(type),
                    },
                    fix(fixer) {
                        return [
                            fixer.replaceTextRange(
                                [node.range[0], type.range[0]],
                                parens ? "(" : ""
                            ),
                            fixer.replaceTextRange(
                                [type.range[1], node.range[1]],
                                parens ? ")[]" : "[]"
                            ),
                        ];
                    },
                });
            },
        };
    },
};
