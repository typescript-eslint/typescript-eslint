/**
 * @fileoverview Rule to flag non-camelcased identifiers
 * @author Patricio Trevino
 */
"use strict";

const baseRule = require("eslint/lib/rules/indent");
const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const KNOWN_NODES = new Set([
    // Class properties aren't yet supported by eslint...
    "ClassProperty",

    // ts keywords
    "TSAbstractKeyword",
    "TSAnyKeyword",
    "TSBooleanKeyword",
    "TSNeverKeyword",
    "TSNumberKeyword",
    "TSStringKeyword",
    "TSSymbolKeyword",
    "TSUndefinedKeyword",
    "TSUnknownKeyword",
    "TSVoidKeyword",
    "TSNullKeyword",

    // ts specific nodes we want to support
    "TSAbstractClassDeclaration",
    "TSAbstractClassProperty",
    "TSAbstractMethodDefinition",
    "TSArrayType",
    "TSAsExpression",
    "TSConditionalType",
    "TSConstructorType",
    "TSConstructSignature",
    "TSEmptyBodyDeclareFunction",
    "TSEmptyBodyFunctionExpression",
    "TSEnumDeclaration",
    "TSEnumMember",
    "TSExportAssignment",
    "TSExternalModuleReference",
    "TSFunctionType",
    "TSImportType",
    "TSIndexedAccessType",
    "TSIndexSignature",
    "TSInferType",
    "TSInterfaceBody",
    "TSInterfaceDeclaration",
    "TSInterfaceHeritage",
    "TSIntersectionType",
    "TSImportEqualsDeclaration",
    "TSLiteralType",
    "TSMappedType",
    "TSMethodSignature",
    "TSMinusToken",
    "TSModuleBlock",
    "TSModuleDeclaration",
    "TSNonNullExpression",
    "TSParameterProperty",
    "TSParenthesizedType",
    "TSPlusToken",
    "TSPropertySignature",
    "TSQualifiedName",
    "TSQuestionToken",
    "TSRestType",
    "TSThisType",
    "TSTupleType",
    "TSTypeAnnotation",
    "TSTypeLiteral",
    "TSTypeOperator",
    "TSTypeParameter",
    "TSTypeParameterDeclaration",
    "TSTypeReference",
    "TSUnionType",
]);

const defaultOptions = [
    // typescript docs and playground use 4 space indent
    4,
    {
        // typescript docs indent the case from the switch
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-8.html#example-4
        SwitchCase: 1,
        flatTernaryExpressions: false,
        ignoredNodes: [],
    },
];

module.exports = Object.assign({}, baseRule, {
    meta: {
        type: "layout",
        docs: {
            description: "Enforce consistent indentation",
            extraDescription: [util.tslintRule("indent")],
            category: "Stylistic Issues",
            recommended: "error",
            url: util.metaDocsUrl("indent"),
        },
        fixable: "whitespace",
        schema: baseRule.meta.schema,
    },

    create(context) {
        // because we extend the base rule, have to update opts on the context
        // the context defines options as readonly though...
        const contextWithDefaults = Object.create(context, {
            options: {
                writable: false,
                configurable: false,
                value: util.applyDefault(defaultOptions, context.options),
            },
        });

        const rules = baseRule.create(contextWithDefaults);

        /**
         * Converts from a TSPropertySignature to a Property
         * @param {Object} node a TSPropertySignature node
         * @param {string} [type] the type to give the new node
         * @returns {Object} a Property node
         */
        function TSPropertySignatureToProperty(node, type = "Property") {
            return {
                type,
                key: node.key,
                value: node.value || node.typeAnnotation,

                // Property flags
                computed: false,
                method: false,
                kind: "init",
                // this will stop eslint from interrogating the type literal
                shorthand: true,

                // location data
                parent: node.parent,
                range: node.range,
                loc: node.loc,
            };
        }

        return Object.assign({}, rules, {
            // overwrite the base rule here so we can use our KNOWN_NODES list instead
            "*:exit"(node) {
                // For nodes we care about, skip the default handling, because it just marks the node as ignored...
                if (!KNOWN_NODES.has(node.type)) {
                    rules["*:exit"](node);
                }
            },

            TSAsExpression(node) {
                // transform it to a BinaryExpression
                return rules["BinaryExpression, LogicalExpression"]({
                    type: "BinaryExpression",
                    operator: "as",
                    left: node.expression,
                    // the first typeAnnotation includes the as token
                    right: node.typeAnnotation.typeAnnotation,

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSConditionalType(node) {
                // transform it to a ConditionalExpression
                return rules.ConditionalExpression({
                    type: "ConditionalExpression",
                    test: {
                        type: "BinaryExpression",
                        operator: "extends",
                        left: node.checkType,
                        right: node.extendsType,

                        // location data
                        range: [
                            node.checkType.range[0],
                            node.extendsType.range[1],
                        ],
                        loc: {
                            start: node.checkType.loc.start,
                            end: node.extendsType.loc.end,
                        },
                    },
                    consequent: node.trueType,
                    alternate: node.falseType,

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            "TSEnumDeclaration, TSTypeLiteral"(node) {
                // transform it to an ObjectExpression
                return rules["ObjectExpression, ObjectPattern"]({
                    type: "ObjectExpression",
                    properties: node.members.map(TSPropertySignatureToProperty),

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSImportEqualsDeclaration(node) {
                // transform it to an VariableDeclaration
                // use VariableDeclaration instead of ImportDeclaration because it's essentially the same thing
                const { name, moduleReference } = node;

                return rules.VariableDeclaration({
                    type: "VariableDeclaration",
                    declarations: [
                        {
                            type: "VariableDeclarator",
                            range: [name.range[0], moduleReference.range[1]],
                            loc: {
                                start: name.loc.start,
                                end: moduleReference.loc.end,
                            },
                            id: name,
                            init: {
                                type: "CallExpression",
                                callee: {
                                    type: "Identifier",
                                    name: "require",
                                    range: [
                                        moduleReference.range[0],
                                        moduleReference.range[0] +
                                            "require".length,
                                    ],
                                    loc: {
                                        start: moduleReference.loc.start,
                                        end: {
                                            line: moduleReference.loc.end.line,
                                            column:
                                                moduleReference.loc.start +
                                                "require".length,
                                        },
                                    },
                                },
                                arguments: [moduleReference.expression],

                                // location data
                                range: moduleReference.range,
                                loc: moduleReference.loc,
                            },
                        },
                    ],

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSIndexedAccessType(node) {
                // convert to a MemberExpression
                return rules[
                    "MemberExpression, JSXMemberExpression, MetaProperty"
                ]({
                    type: "MemberExpression",
                    object: node.objectType,
                    property: node.indexType,

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSInterfaceBody(node) {
                // transform it to an ClassBody
                return rules["BlockStatement, ClassBody"]({
                    type: "ClassBody",
                    body: node.body.map(p =>
                        TSPropertySignatureToProperty(p, "ClassProperty")
                    ),

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            "TSInterfaceDeclaration[heritage.length > 0]"(node) {
                // transform it to a ClassDeclaration
                return rules[
                    "ClassDeclaration[superClass], ClassExpression[superClass]"
                ]({
                    type: "ClassDeclaration",
                    body: node.body,
                    superClass: node.heritage[0].id,

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSMappedType(node) {
                const sourceCode = context.getSourceCode();
                const squareBracketStart = sourceCode.getTokenBefore(
                    node.typeParameter
                );

                // transform it to an ObjectExpression
                return rules["ObjectExpression, ObjectPattern"]({
                    type: "ObjectExpression",
                    properties: [
                        {
                            type: "Property",
                            key: node.typeParameter,
                            value: node.typeAnnotation,

                            // location data
                            range: [
                                squareBracketStart.range[0],
                                node.typeAnnotation.range[1],
                            ],
                            loc: {
                                start: squareBracketStart.loc.start,
                                end: node.typeAnnotation.loc.end,
                            },
                        },
                    ],

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSModuleBlock(node) {
                // transform it to a BlockStatement
                return rules["BlockStatement, ClassBody"]({
                    type: "BlockStatement",
                    body: node.body,

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSQualifiedName(node) {
                return rules[
                    "MemberExpression, JSXMemberExpression, MetaProperty"
                ]({
                    type: "MemberExpression",
                    object: node.left,
                    property: node.right,

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSTupleType(node) {
                // transform it to an ArrayExpression
                return rules["ArrayExpression, ArrayPattern"]({
                    type: "ArrayExpression",
                    elements: node.elementTypes,

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },

            TSTypeParameterDeclaration(node) {
                const [name, ...attributes] = node.params;

                // JSX is about the closest we can get because the angle brackets
                // it's not perfect but it works!
                return rules.JSXOpeningElement({
                    type: "JSXOpeningElement",
                    selfClosing: false,
                    name,
                    attributes,

                    // location data
                    parent: node.parent,
                    range: node.range,
                    loc: node.loc,
                });
            },
        });
    },
});
