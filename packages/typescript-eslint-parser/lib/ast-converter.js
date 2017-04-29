/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var ts = require("typescript"),
    assign = require("object-assign"),
    unescape = require("lodash.unescape");

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var SyntaxKind = ts.SyntaxKind;

var ASSIGNMENT_OPERATORS = [
    SyntaxKind.EqualsToken,
    SyntaxKind.PlusEqualsToken,
    SyntaxKind.MinusEqualsToken,
    SyntaxKind.AsteriskEqualsToken,
    SyntaxKind.SlashEqualsToken,
    SyntaxKind.PercentEqualsToken,
    SyntaxKind.LessThanLessThanEqualsToken,
    SyntaxKind.GreaterThanGreaterThanEqualsToken,
    SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
    SyntaxKind.AmpersandEqualsToken,
    SyntaxKind.BarEqualsToken,
    SyntaxKind.CaretEqualsToken
];

var LOGICAL_OPERATORS = [
    SyntaxKind.BarBarToken,
    SyntaxKind.AmpersandAmpersandToken
];

var TOKEN_TO_TEXT = {};
TOKEN_TO_TEXT[SyntaxKind.OpenBraceToken] = "{";
TOKEN_TO_TEXT[SyntaxKind.CloseBraceToken] = "}";
TOKEN_TO_TEXT[SyntaxKind.OpenParenToken] = "(";
TOKEN_TO_TEXT[SyntaxKind.CloseParenToken] = ")";
TOKEN_TO_TEXT[SyntaxKind.OpenBracketToken] = "[";
TOKEN_TO_TEXT[SyntaxKind.CloseBracketToken] = "]";
TOKEN_TO_TEXT[SyntaxKind.DotToken] = ".";
TOKEN_TO_TEXT[SyntaxKind.DotDotDotToken] = "...";
TOKEN_TO_TEXT[SyntaxKind.SemicolonToken] = ";";
TOKEN_TO_TEXT[SyntaxKind.CommaToken] = ",";
TOKEN_TO_TEXT[SyntaxKind.LessThanToken] = "<";
TOKEN_TO_TEXT[SyntaxKind.GreaterThanToken] = ">";
TOKEN_TO_TEXT[SyntaxKind.LessThanEqualsToken] = "<=";
TOKEN_TO_TEXT[SyntaxKind.GreaterThanEqualsToken] = ">=";
TOKEN_TO_TEXT[SyntaxKind.EqualsEqualsToken] = "==";
TOKEN_TO_TEXT[SyntaxKind.ExclamationEqualsToken] = "!=";
TOKEN_TO_TEXT[SyntaxKind.EqualsEqualsEqualsToken] = "===";
TOKEN_TO_TEXT[SyntaxKind.ExclamationEqualsEqualsToken] = "!==";
TOKEN_TO_TEXT[SyntaxKind.EqualsGreaterThanToken] = "=>";
TOKEN_TO_TEXT[SyntaxKind.PlusToken] = "+";
TOKEN_TO_TEXT[SyntaxKind.MinusToken] = "-";
TOKEN_TO_TEXT[SyntaxKind.AsteriskToken] = "*";
TOKEN_TO_TEXT[SyntaxKind.SlashToken] = "/";
TOKEN_TO_TEXT[SyntaxKind.PercentToken] = "%";
TOKEN_TO_TEXT[SyntaxKind.PlusPlusToken] = "++";
TOKEN_TO_TEXT[SyntaxKind.MinusMinusToken] = "--";
TOKEN_TO_TEXT[SyntaxKind.LessThanLessThanToken] = "<<";
TOKEN_TO_TEXT[SyntaxKind.LessThanSlashToken] = "</";
TOKEN_TO_TEXT[SyntaxKind.GreaterThanGreaterThanToken] = ">>";
TOKEN_TO_TEXT[SyntaxKind.GreaterThanGreaterThanGreaterThanToken] = ">>>";
TOKEN_TO_TEXT[SyntaxKind.AmpersandToken] = "&";
TOKEN_TO_TEXT[SyntaxKind.BarToken] = "|";
TOKEN_TO_TEXT[SyntaxKind.CaretToken] = "^";
TOKEN_TO_TEXT[SyntaxKind.ExclamationToken] = "!";
TOKEN_TO_TEXT[SyntaxKind.TildeToken] = "~";
TOKEN_TO_TEXT[SyntaxKind.AmpersandAmpersandToken] = "&&";
TOKEN_TO_TEXT[SyntaxKind.BarBarToken] = "||";
TOKEN_TO_TEXT[SyntaxKind.QuestionToken] = "?";
TOKEN_TO_TEXT[SyntaxKind.ColonToken] = ":";
TOKEN_TO_TEXT[SyntaxKind.EqualsToken] = "=";
TOKEN_TO_TEXT[SyntaxKind.PlusEqualsToken] = "+=";
TOKEN_TO_TEXT[SyntaxKind.MinusEqualsToken] = "-=";
TOKEN_TO_TEXT[SyntaxKind.AsteriskEqualsToken] = "*=";
TOKEN_TO_TEXT[SyntaxKind.SlashEqualsToken] = "/=";
TOKEN_TO_TEXT[SyntaxKind.PercentEqualsToken] = "%=";
TOKEN_TO_TEXT[SyntaxKind.LessThanLessThanEqualsToken] = "<<=";
TOKEN_TO_TEXT[SyntaxKind.GreaterThanGreaterThanEqualsToken] = ">>=";
TOKEN_TO_TEXT[SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken] = ">>>=";
TOKEN_TO_TEXT[SyntaxKind.AmpersandEqualsToken] = "&=";
TOKEN_TO_TEXT[SyntaxKind.BarEqualsToken] = "|=";
TOKEN_TO_TEXT[SyntaxKind.CaretEqualsToken] = "^=";
TOKEN_TO_TEXT[SyntaxKind.AtToken] = "@";
TOKEN_TO_TEXT[SyntaxKind.InKeyword] = "in";

/**
 * Returns true if the given TSNode is a valid ESTree class member
 * @param  {TSNode}  node TypeScript AST node
 * @returns {boolean}      is valid ESTree class member
 */
function isESTreeClassMember(node) {
    return node.kind !== SyntaxKind.SemicolonClassElement;
}

/**
 * Returns true if the given node is an async function
 * @param  {TSNode}  node TypeScript AST node
 * @returns {boolean}     is an async function
 */
function isAsyncFunction(node) {
    return !!node.modifiers && !!node.modifiers.length && node.modifiers.some(function(modifier) {
        return modifier.kind === SyntaxKind.AsyncKeyword;
    });
}

/**
 * Returns true if the given TSToken is a comma
 * @param  {TSToken}  token the TypeScript token
 * @returns {boolean}       is comma
 */
function isComma(token) {
    return token.kind === SyntaxKind.CommaToken;
}

/**
 * Returns true if the given TSToken is the assignment operator
 * @param  {TSToken}  operator the operator token
 * @returns {boolean}          is assignment
 */
function isAssignmentOperator(operator) {
    return ASSIGNMENT_OPERATORS.indexOf(operator.kind) > -1;
}

/**
 * Returns true if the given TSToken is a logical operator
 * @param  {TSToken}  operator the operator token
 * @returns {boolean}          is a logical operator
 */
function isLogicalOperator(operator) {
    return LOGICAL_OPERATORS.indexOf(operator.kind) > -1;
}

/**
 * Returns the binary expression type of the given TSToken
 * @param  {TSToken} operator the operator token
 * @returns {string}          the binary expression type
 */
function getBinaryExpressionType(operator) {
    if (isAssignmentOperator(operator)) {
        return "AssignmentExpression";
    } else if (isLogicalOperator(operator)) {
        return "LogicalExpression";
    } else {
        return "BinaryExpression";
    }
}

/**
 * Returns line and column data for the given start and end positions,
 * for the given AST
 * @param  {Object} start start data
 * @param  {Object} end   end data
 * @param  {Object} ast   the AST object
 * @returns {Object}       the loc data
 */
function getLocFor(start, end, ast) {
    var startLoc = ast.getLineAndCharacterOfPosition(start),
        endLoc = ast.getLineAndCharacterOfPosition(end);

    return {
        start: {
            line: startLoc.line + 1,
            column: startLoc.character
        },
        end: {
            line: endLoc.line + 1,
            column: endLoc.character
        }
    };
}

/**
 * Returns line and column data for the given ESTreeNode or ESTreeToken,
 * for the given AST
 * @param  {ESTreeToken|ESTreeNode} nodeOrToken the ESTreeNode or ESTreeToken
 * @param  {Object} ast         the AST object
 * @returns {Object}             the loc data
 */
function getLoc(nodeOrToken, ast) {
    return getLocFor(nodeOrToken.getStart(), nodeOrToken.end, ast);
    // var start = nodeOrToken.getStart(),
    //     startLoc = ast.getLineAndCharacterOfPosition(start),
    //     endLoc = ast.getLineAndCharacterOfPosition(nodeOrToken.end);

    // return {
    //     start: {
    //         line: startLoc.line + 1,
    //         column: startLoc.character
    //     },
    //     end: {
    //         line: endLoc.line + 1,
    //         column: endLoc.character
    //     }
    // };
}

/**
 * Fixes the exports of the given TSNode
 * @param  {TSNode} node   the TSNode
 * @param  {Object} result result
 * @param  {Object} ast    the AST
 * @returns {TSNode}        the TSNode with fixed exports
 */
function fixExports(node, result, ast) {
    // check for exports
    if (node.modifiers && node.modifiers[0].kind === SyntaxKind.ExportKeyword) {
        var exportKeyword = node.modifiers[0],
            nextModifier = node.modifiers[1],
            lastModifier = node.modifiers[node.modifiers.length - 1],
            declarationIsDefault = nextModifier && (nextModifier.kind === SyntaxKind.DefaultKeyword),
            varToken = ts.findNextToken(lastModifier, ast);

        result.range[0] = varToken.getStart();
        result.loc = getLocFor(result.range[0], result.range[1], ast);

        var declarationType = declarationIsDefault ? "ExportDefaultDeclaration" : "ExportNamedDeclaration";

        /**
         * Prefix exports from TypeScript namespaces with "TS" to distinguish
         * them from ES2015 exports
         */
        if (node.parent && node.parent.kind === SyntaxKind.ModuleBlock) {
            declarationType = "TSNamespaceExportDeclaration";
        }

        var newResult = {
            type: declarationType,
            declaration: result,
            range: [ exportKeyword.getStart(), result.range[1] ],
            loc: getLocFor(exportKeyword.getStart(), result.range[1], ast)
        };

        if (!declarationIsDefault) {
            newResult.specifiers = [];
            newResult.source = null;
        }

        return newResult;

    }

    return result;
}

/**
 * Returns true if a given TSNode is a token
 * @param  {TSNode} node the TSNode
 * @returns {boolean}     is a token
 */
function isToken(node) {
    return node.kind >= ts.SyntaxKind.FirstToken && node.kind <= ts.SyntaxKind.LastToken;
}

/**
 * Returns true if a given TSNode is a JSX token
 * @param  {TSNode} node TSNode to be checked
 * @returns {boolean}       is a JSX token
 */
function isJSXToken(node) {
    return (
        node.kind >= SyntaxKind.JsxElement
        && node.kind <= SyntaxKind.JsxAttribute
    );
}

/**
 * Returns true if a given TSNode has a JSX token within its hierarchy
 * @param  {TSNode} node TSNode to be checked
 * @returns {boolean}       has JSX ancestor
 */
function hasJSXAncestor(node) {
    while (node) {
        if (isJSXToken(node)) {
            return true;
        }
        node = node.parent;
    }
    return false;
}


/**
 * Extends and formats a given error object
 * @param  {Object} error the error object
 * @returns {Object}       converted error object
 */
function convertError(error) {

    var loc = error.file.getLineAndCharacterOfPosition(error.start);

    return {
        index: error.start,
        lineNumber: loc.line + 1,
        column: loc.character,
        message: error.message || error.messageText
    };
}

/**
 * Returns the type of a given ESTreeToken
 * @param  {ESTreeToken} token the ESTreeToken
 * @returns {string}       the token type
 */
function getTokenType(token) {

    // Need two checks for keywords since some are also identifiers
    if (token.originalKeywordKind) {

        switch (token.originalKeywordKind) {
            case SyntaxKind.NullKeyword:
                return "Null";

            case SyntaxKind.GetKeyword:
            case SyntaxKind.SetKeyword:
            case SyntaxKind.TypeKeyword:
            case SyntaxKind.ModuleKeyword:
                return "Identifier";

            default:
                return "Keyword";
        }
    }

    if (token.kind >= SyntaxKind.FirstKeyword && token.kind <= SyntaxKind.LastFutureReservedWord) {
        if (token.kind === SyntaxKind.FalseKeyword || token.kind === SyntaxKind.TrueKeyword) {
            return "Boolean";
        }

        return "Keyword";
    }

    if (token.kind >= SyntaxKind.FirstPunctuation && token.kind <= SyntaxKind.LastBinaryOperator) {
        return "Punctuator";
    }

    if (token.kind >= SyntaxKind.NoSubstitutionTemplateLiteral && token.kind <= SyntaxKind.TemplateTail) {
        return "Template";
    }

    switch (token.kind) {
        case SyntaxKind.NumericLiteral:
            return "Numeric";

        case SyntaxKind.JsxText:
            return "JSXText";

        case SyntaxKind.StringLiteral:
            // A TypeScript-StringLiteral token with a TypeScript-JsxAttribute or TypeScript-JsxElement parent,
            // must actually be an ESTree-JSXText token
            if (token.parent && (token.parent.kind === SyntaxKind.JsxAttribute || token.parent.kind === SyntaxKind.JsxElement)) {
                return "JSXText";
            }

            return "String";

        case SyntaxKind.RegularExpressionLiteral:
            return "RegularExpression";

        case SyntaxKind.Identifier:
        case SyntaxKind.ConstructorKeyword:
        case SyntaxKind.GetKeyword:
        case SyntaxKind.SetKeyword:
            // falls through
        default:
    }

    // Some JSX tokens have to be determined based on their parent
    if (token.parent) {
        if (token.kind === SyntaxKind.Identifier && token.parent.kind === SyntaxKind.PropertyAccessExpression && hasJSXAncestor(token)) {
            return "JSXIdentifier";
        }

        if (isJSXToken(token.parent)) {
            if (token.kind === SyntaxKind.PropertyAccessExpression) {
                return "JSXMemberExpression";
            }

            if (token.kind === SyntaxKind.Identifier) {
                return "JSXIdentifier";
            }
        }
    }

    return "Identifier";
}

/**
 * Extends and formats a given ESTreeToken, for a given AST
 * @param  {ESTreeToken} token the ESTreeToken
 * @param  {Object} ast   the AST object
 * @returns {ESTreeToken}       the converted ESTreeToken
 */
function convertToken(token, ast) {

    var start = token.getStart(),
        value = ast.text.slice(start, token.end),
        newToken = {
            type: getTokenType(token),
            value: value,
            start: start,
            end: token.end,
            range: [start, token.end],
            loc: getLoc(token, ast)
        };

    if (newToken.type === "RegularExpression") {
        newToken.regex = {
            pattern: value.slice(1, value.lastIndexOf("/")),
            flags: value.slice(value.lastIndexOf("/") + 1)
        };
    }

    return newToken;
}

/**
 * Converts all tokens for the given AST
 * @param  {Object} ast the AST object
 * @returns {ESTreeToken[]}     the converted ESTreeTokens
 */
function convertTokens(ast) {
    var result = [];
    /**
     * @param  {TSNode} node the TSNode
     * @returns {undefined}
     */
    function walk(node) {
        if (isToken(node) && node.kind !== ts.SyntaxKind.EndOfFileToken) {
            var converted = convertToken(node, ast);
            if (converted) {
                result.push(converted);
            }
        } else {
            node.getChildren().forEach(walk);
        }
    }
    walk(ast);
    return result;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = function(ast, extra) {

    if (ast.parseDiagnostics.length) {
        throw convertError(ast.parseDiagnostics[0]);
    }

    /**
     * Converts a TypeScript node into an ESTree node
     * @param  {TSNode} node   the TSNode
     * @param  {TSNode} parent the parent TSNode
     * @returns {ESTreeNode}        the converted ESTreeNode
     */
    function convert(node, parent) {

        // exit early for null and undefined
        if (!node) {
            return null;
        }

        var result = {
            type: "",
            range: [node.getStart(), node.end],
            loc: getLoc(node, ast)
        };

        /**
         * Copies the result object into an ESTree node with just a type property.
         * This is used only for leaf nodes that have no other properties.
         * @returns {void}
         */
        function simplyCopy() {
            assign(result, {
                type: SyntaxKind[node.kind]
            });
        }

        /**
         * Converts a TypeScript node into an ESTree node.
         * @param  {TSNode} child the child TSNode
         * @returns {ESTreeNode}       the converted ESTree node
         */
        function convertChild(child) {
            return convert(child, node);
        }

        /**
         * Converts a child into a type annotation. This creates an intermediary
         * TypeAnnotation node to match what Flow does.
         * @param {TSNode} child The TypeScript AST node to convert.
         * @returns {ESTreeNode} The type annotation node.
         */
        function convertTypeAnnotation(child) {
            var annotation = convertChild(child);
            return {
                type: "TypeAnnotation",
                loc: annotation.loc,
                range: annotation.range,
                typeAnnotation: annotation
            };
        }

        /**
         * Converts a TSNode's typeArguments array to a flow-like typeParameters node
         * @param {TSNode[]} typeArguments TSNode typeArguments
         * @returns {TypeParameterInstantiation} TypeParameterInstantiation node
         */
        function convertTypeArgumentsToTypeParameters(typeArguments) {
            var firstTypeArgument = typeArguments[0];
            var lastTypeArgument = typeArguments[typeArguments.length - 1];
            return {
                type: "TypeParameterInstantiation",
                range: [
                    firstTypeArgument.pos - 1,
                    lastTypeArgument.end + 1
                ],
                loc: getLocFor(firstTypeArgument.pos - 1, lastTypeArgument.end + 1, ast),
                params: typeArguments.map(function(typeArgument) {
                    /**
                     * Have to manually calculate the start of the range,
                     * because TypeScript includes leading whitespace but Flow does not
                     */
                    var typeArgumentStart = (typeArgument.typeName && typeArgument.typeName.text)
                        ? typeArgument.end - typeArgument.typeName.text.length
                        : typeArgument.pos;
                    return {
                        type: "GenericTypeAnnotation",
                        range: [
                            typeArgumentStart,
                            typeArgument.end
                        ],
                        loc: getLocFor(typeArgumentStart, typeArgument.end, ast),
                        id: convertChild(typeArgument.typeName || typeArgument),
                        typeParameters: (typeArgument.typeArguments)
                            ? convertTypeArgumentsToTypeParameters(typeArgument.typeArguments)
                            : null
                    };
                })
            };
        }

        /**
         * Gets a TSNode's accessibility level
         * @param {TSNode} tsNode The TSNode
         * @returns {string | null} accessibility "public", "protected", "private", or null
         */
        function getTSNodeAccessibility(tsNode) {
            var modifiers = tsNode.modifiers;
            if (!modifiers) {
                return null;
            }
            for (var i = 0; i < modifiers.length; i++) {
                var modifier = modifiers[i];
                switch (modifier.kind) {
                    case SyntaxKind.PublicKeyword:
                        return "public";
                    case SyntaxKind.ProtectedKeyword:
                        return "protected";
                    case SyntaxKind.PrivateKeyword:
                        return "private";
                    default:
                        continue;
                }
            }
            return null;
        }

        /**
         * Returns the declaration kind of the given TSNode
         * @param  {TSNode}  tsNode TypeScript AST node
         * @returns {string}     declaration kind
         */
        function getDeclarationKind(tsNode) {
            var varDeclarationKind;

            switch (tsNode.kind) {
                case SyntaxKind.TypeAliasDeclaration:
                    varDeclarationKind = "type";
                    break;
                case SyntaxKind.VariableDeclarationList:
                    if (ts.isLet(tsNode)) {
                        varDeclarationKind = "let";
                    } else if (ts.isConst(tsNode)) {
                        varDeclarationKind = "const";
                    } else {
                        varDeclarationKind = "var";
                    }
                    break;
                default:
                    throw "Unable to determine declaration kind.";
            }

            return varDeclarationKind;
        }

        /**
         * Converts a TSNode's typeParameters array to a flow-like TypeParameterDeclaration node
         * @param {TSNode[]} typeParameters TSNode typeParameters
         * @returns {TypeParameterDeclaration} TypeParameterDeclaration node
         */
        function convertTSTypeParametersToTypeParametersDeclaration(typeParameters) {
            var firstTypeParameter = typeParameters[0];
            var lastTypeParameter = typeParameters[typeParameters.length - 1];
            return {
                type: "TypeParameterDeclaration",
                range: [
                    firstTypeParameter.pos - 1,
                    lastTypeParameter.end + 1
                ],
                loc: getLocFor(firstTypeParameter.pos - 1, lastTypeParameter.end + 1, ast),
                params: typeParameters.map(function(typeParameter) {
                    /**
                     * Have to manually calculate the start of the range,
                     * because TypeScript includes leading whitespace but Flow does not
                     */
                    var typeParameterStart = (typeParameter.typeName && typeParameter.typeName.text)
                        ? typeParameter.end - typeParameter.typeName.text.length
                        : typeParameter.pos;
                    return {
                        type: "TypeParameter",
                        range: [
                            typeParameterStart,
                            typeParameter.end
                        ],
                        loc: getLocFor(typeParameterStart, typeParameter.end, ast),
                        name: typeParameter.name.text,
                        constraint: (typeParameter.constraint)
                            ? convertTypeAnnotation(typeParameter.constraint)
                            : null
                    };
                })
            };
        }

        /**
         * Converts a child into a class implements node. This creates an intermediary
         * ClassImplements node to match what Flow does.
         * @param {TSNode} child The TypeScript AST node to convert.
         * @returns {ESTreeNode} The type annotation node.
         */
        function convertClassImplements(child) {
            var id = convertChild(child.expression);
            var classImplementsNode = {
                type: "ClassImplements",
                loc: id.loc,
                range: id.range,
                id: id
            };
            if (child.typeArguments && child.typeArguments.length) {
                classImplementsNode.typeParameters = convertTypeArgumentsToTypeParameters(child.typeArguments);
            }
            return classImplementsNode;
        }

        /**
         * For nodes that are copied directly from the TypeScript AST into
         * ESTree mostly as-is. The only difference is the addition of a type
         * property instead of a kind property. Recursively copies all children.
         * @returns {void}
         */
        function deeplyCopy() {
            result.type = "TS" + SyntaxKind[node.kind];
            Object.keys(node).filter(function(key) {
                return !(/^(?:kind|parent|pos|end|flags|modifierFlagsCache|jsDoc)$/.test(key));
            }).forEach(function(key) {
                if (key === "type") {
                    result.typeAnnotation = (node.type) ? convertTypeAnnotation(node.type) : null;
                } else {
                    if (Array.isArray(node[key])) {
                        result[key] = node[key].map(convertChild);
                    } else if (node[key] && typeof node[key] === "object") {
                        result[key] = convertChild(node[key]);
                    } else {
                        result[key] = node[key];
                    }
                }
            });
        }

        /**
         * Converts a TypeScript JSX node.tagName into an ESTree node.name
         * @param {Object} tagName  the tagName object from a JSX TSNode
         * @param  {Object} ast   the AST object
         * @returns {Object}    the converted ESTree name object
         */
        function convertTypeScriptJSXTagNameToESTreeName(tagName) {
            var tagNameToken = convertToken(tagName, ast);

            if (tagNameToken.type === "JSXMemberExpression") {

                var isNestedMemberExpression = (node.tagName.expression.kind === SyntaxKind.PropertyAccessExpression);

                // Convert TSNode left and right objects into ESTreeNode object
                // and property objects
                tagNameToken.object = convertChild(node.tagName.expression);
                tagNameToken.property = convertChild(node.tagName.name);

                // Assign the appropriate types
                tagNameToken.object.type = (isNestedMemberExpression) ? "JSXMemberExpression" : "JSXIdentifier";
                tagNameToken.property.type = "JSXIdentifier";

            } else {

                tagNameToken.name = tagNameToken.value;
            }

            delete tagNameToken.value;

            return tagNameToken;
        }

        switch (node.kind) {
            case SyntaxKind.SourceFile:
                assign(result, {
                    type: "Program",
                    body: [],
                    sourceType: node.externalModuleIndicator ? "module" : "script"
                });

                // filter out unknown nodes for now
                node.statements.forEach(function(statement) {
                    var convertedStatement = convertChild(statement);
                    if (convertedStatement) {
                        result.body.push(convertedStatement);
                    }
                });

                // fix end location
                result.range[1] = node.endOfFileToken.pos;
                result.loc = getLocFor(node.getStart(), result.range[1], ast);
                break;

            case SyntaxKind.Block:
                assign(result, {
                    type: "BlockStatement",
                    body: node.statements.map(convertChild)
                });
                break;

            case SyntaxKind.Identifier:
                assign(result, {
                    type: "Identifier",
                    name: ts.unescapeIdentifier(node.text)
                });
                if (node.parent.questionToken && (
                    SyntaxKind.Parameter === node.parent.kind ||
                    SyntaxKind.PropertyDeclaration === node.parent.kind ||
                    SyntaxKind.PropertySignature === node.parent.kind ||
                    SyntaxKind.MethodDeclaration === node.parent.kind ||
                    SyntaxKind.MethodSignature === node.parent.kind
                )) {
                    result.optional = true;
                }
                break;

            case SyntaxKind.WithStatement:
                assign(result, {
                    type: "WithStatement",
                    object: convertChild(node.expression),
                    body: convertChild(node.statement)
                });
                break;

            // Control Flow

            case SyntaxKind.ReturnStatement:
                assign(result, {
                    type: "ReturnStatement",
                    argument: convertChild(node.expression)
                });
                break;

            case SyntaxKind.LabeledStatement:
                assign(result, {
                    type: "LabeledStatement",
                    label: convertChild(node.label),
                    body: convertChild(node.statement)
                });
                break;

            case SyntaxKind.BreakStatement:
            case SyntaxKind.ContinueStatement:
                assign(result, {
                    type: SyntaxKind[node.kind],
                    label: convertChild(node.label)
                });
                break;

            // Choice

            case SyntaxKind.IfStatement:
                assign(result, {
                    type: "IfStatement",
                    test: convertChild(node.expression),
                    consequent: convertChild(node.thenStatement),
                    alternate: convertChild(node.elseStatement)
                });
                break;

            case SyntaxKind.SwitchStatement:
                assign(result, {
                    type: "SwitchStatement",
                    discriminant: convertChild(node.expression),
                    cases: node.caseBlock.clauses.map(convertChild)
                });
                break;

            case SyntaxKind.CaseClause:
            case SyntaxKind.DefaultClause:
                assign(result, {
                    type: "SwitchCase",
                    test: convertChild(node.expression),
                    consequent: node.statements.map(convertChild)
                });
                break;

            // Exceptions

            case SyntaxKind.ThrowStatement:
                assign(result, {
                    type: "ThrowStatement",
                    argument: convertChild(node.expression)
                });
                break;

            case SyntaxKind.TryStatement:
                assign(result, {
                    type: "TryStatement",
                    block: convert(node.tryBlock),
                    handler: convertChild(node.catchClause),
                    finalizer: convertChild(node.finallyBlock)
                });
                break;

            case SyntaxKind.CatchClause:
                assign(result, {
                    type: "CatchClause",
                    param: convertChild(node.variableDeclaration.name),
                    body: convertChild(node.block)
                });
                break;


            // Loops

            case SyntaxKind.WhileStatement:
                assign(result, {
                    type: "WhileStatement",
                    test: convertChild(node.expression),
                    body: convertChild(node.statement)
                });
                break;

            /**
             * Unlike other parsers, TypeScript calls a "DoWhileStatement"
             * a "DoStatement"
             */
            case SyntaxKind.DoStatement:
                assign(result, {
                    type: "DoWhileStatement",
                    test: convertChild(node.expression),
                    body: convertChild(node.statement)
                });
                break;

            case SyntaxKind.ForStatement:
                assign(result, {
                    type: "ForStatement",
                    init: convertChild(node.initializer),
                    test: convertChild(node.condition),
                    update: convertChild(node.incrementor),
                    body: convertChild(node.statement)
                });
                break;

            case SyntaxKind.ForInStatement:
            case SyntaxKind.ForOfStatement:
                assign(result, {
                    type: SyntaxKind[node.kind],
                    left: convertChild(node.initializer),
                    right: convertChild(node.expression),
                    body: convertChild(node.statement)
                });
                break;

            // Declarations

            case SyntaxKind.FunctionDeclaration:

                var functionDeclarationType = "FunctionDeclaration";
                if (node.modifiers && node.modifiers.length) {
                    var isDeclareFunction = node.modifiers.some(function(modifier) {
                        return modifier.kind === ts.SyntaxKind.DeclareKeyword;
                    });
                    if (isDeclareFunction) {
                        functionDeclarationType = "DeclareFunction";
                    }
                }

                /**
                 * Prefix FunctionDeclarations within TypeScript namespaces with "TS"
                 */
                if (node.parent && node.parent.kind === SyntaxKind.ModuleBlock) {
                    functionDeclarationType = "TSNamespaceFunctionDeclaration";
                }

                assign(result, {
                    type: functionDeclarationType,
                    id: convertChild(node.name),
                    generator: !!node.asteriskToken,
                    expression: false,
                    async: isAsyncFunction(node),
                    params: node.parameters.map(convertChild),
                    body: convertChild(node.body)
                });

                // Process returnType
                if (node.type) {
                    result.returnType = convertTypeAnnotation(node.type);
                }

                // Process typeParameters
                if (node.typeParameters && node.typeParameters.length) {
                    result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
                }

                // check for exports
                result = fixExports(node, result, ast);

                break;

            case SyntaxKind.VariableDeclaration:
                assign(result, {
                    type: "VariableDeclarator",
                    id: convertChild(node.name),
                    init: convertChild(node.initializer)
                });

                if (node.type) {
                    result.id.typeAnnotation = convertTypeAnnotation(node.type);
                }
                break;

            case SyntaxKind.VariableStatement:
                assign(result, {
                    type: "VariableDeclaration",
                    declarations: node.declarationList.declarations.map(convertChild),
                    kind: getDeclarationKind(node.declarationList)
                });

                // check for exports
                result = fixExports(node, result, ast);
                break;

            // mostly for for-of, for-in
            case SyntaxKind.VariableDeclarationList:
                assign(result, {
                    type: "VariableDeclaration",
                    declarations: node.declarations.map(convertChild),
                    kind: getDeclarationKind(node)
                });
                break;

            // Expressions

            case SyntaxKind.ExpressionStatement:
                assign(result, {
                    type: "ExpressionStatement",
                    expression: convertChild(node.expression)
                });
                break;

            case SyntaxKind.ThisKeyword:
                assign(result, {
                    type: "ThisExpression"
                });
                break;

            case SyntaxKind.ArrayLiteralExpression:

                var arrayAssignNode = ts.getAncestor(node, SyntaxKind.BinaryExpression),
                    arrayIsInAssignment;

                if (arrayAssignNode) {
                    if (arrayAssignNode.left === node) {
                        arrayIsInAssignment = true;
                    } else {
                        arrayIsInAssignment = (ts.findChildOfKind(arrayAssignNode.left, SyntaxKind.ArrayLiteralExpression, ast) === node);
                    }
                }

                // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
                if (arrayIsInAssignment) {
                    assign(result, {
                        type: "ArrayPattern",
                        elements: node.elements.map(convertChild)
                    });
                } else {
                    assign(result, {
                        type: "ArrayExpression",
                        elements: node.elements.map(convertChild)
                    });
                }
                break;

            case SyntaxKind.ObjectLiteralExpression:

                var objectAssignNode = ts.getAncestor(node, SyntaxKind.BinaryExpression),
                    objectIsInAssignment;

                if (objectAssignNode) {
                    if (objectAssignNode.left === node) {
                        objectIsInAssignment = true;
                    } else {
                        objectIsInAssignment = (ts.findChildOfKind(objectAssignNode.left, SyntaxKind.ObjectLiteralExpression, ast) === node);
                    }
                }

                // TypeScript uses ObjectLiteralExpression in destructuring assignment, too
                if (objectIsInAssignment) {
                    assign(result, {
                        type: "ObjectPattern",
                        properties: node.properties.map(convertChild)
                    });
                } else {
                    assign(result, {
                        type: "ObjectExpression",
                        properties: node.properties.map(convertChild)
                    });
                }
                break;

            case SyntaxKind.PropertyAssignment:
                assign(result, {
                    type: "Property",
                    key: convertChild(node.name),
                    value: convertChild(node.initializer),
                    computed: (node.name.kind === SyntaxKind.ComputedPropertyName),
                    method: false,
                    shorthand: false,
                    kind: "init"
                });
                break;

            case SyntaxKind.ShorthandPropertyAssignment:
                assign(result, {
                    type: "Property",
                    key: convertChild(node.name),
                    value: convertChild(node.name),
                    computed: false,
                    method: false,
                    shorthand: true,
                    kind: "init"
                });
                break;

            case SyntaxKind.ComputedPropertyName:

                if (parent.kind === SyntaxKind.ObjectLiteralExpression) {
                    assign(result, {
                        type: "Property",
                        key: convertChild(node.name),
                        value: convertChild(node.name),
                        computed: false,
                        method: false,
                        shorthand: true,
                        kind: "init"
                    });
                } else {
                    return convertChild(node.expression);
                }
                break;

            case SyntaxKind.PropertyDeclaration:
                assign(result, {
                    type: "ClassProperty",
                    key: convertChild(node.name),
                    value: convertChild(node.initializer),
                    computed: (node.name.kind === SyntaxKind.ComputedPropertyName),
                    static: Boolean(ts.getModifierFlags(node) & ts.ModifierFlags.Static),
                    accessibility: getTSNodeAccessibility(node),
                    decorators: (node.decorators) ? node.decorators.map(function(d) {
                        return convertChild(d.expression);
                    }) : [],
                    typeAnnotation: (node.type) ? convertTypeAnnotation(node.type) : null
                });
                break;

            case SyntaxKind.GetAccessor:
            case SyntaxKind.SetAccessor:
            case SyntaxKind.MethodDeclaration:

                // TODO: double-check that these positions are correct
                var methodLoc = ast.getLineAndCharacterOfPosition(node.name.end + 1),
                    nodeIsMethod = (node.kind === SyntaxKind.MethodDeclaration),
                    method = {
                        type: "FunctionExpression",
                        id: null,
                        generator: false,
                        expression: false,
                        async: isAsyncFunction(node),
                        body: convertChild(node.body),
                        range: [ node.parameters.pos - 1, result.range[1]],
                        loc: {
                            start: {
                                line: methodLoc.line + 1,
                                column: methodLoc.character - 1
                            },
                            end: result.loc.end
                        }
                    };

                if (node.type) {
                    method.returnType = convertTypeAnnotation(node.type);
                }

                if (parent.kind === SyntaxKind.ObjectLiteralExpression) {

                    method.params = node.parameters.map(convertChild);

                    assign(result, {
                        type: "Property",
                        key: convertChild(node.name),
                        value: method,
                        computed: (node.name.kind === SyntaxKind.ComputedPropertyName),
                        method: nodeIsMethod,
                        shorthand: false,
                        kind: "init"
                    });

                } else { // class

                    /**
                     * Unlike in object literal methods, class method params can have decorators
                     */
                    method.params = node.parameters.map(function(param) {
                        var convertedParam = convertChild(param);
                        convertedParam.decorators = (param.decorators) ? param.decorators.map(function(d) {
                            return convertChild(d.expression);
                        }) : [];
                        return convertedParam;
                    });

                    var isMethodNameComputed = (node.name.kind === SyntaxKind.ComputedPropertyName);

                    /**
                     * TypeScript class methods can be defined as "abstract"
                     */
                    var methodDefinitionType = "MethodDefinition";
                    if (node.modifiers && node.modifiers.length) {
                        var isAbstractMethod = node.modifiers.some(function(modifier) {
                            return modifier.kind === ts.SyntaxKind.AbstractKeyword;
                        });
                        if (isAbstractMethod) {
                            methodDefinitionType = "TSAbstractMethodDefinition";
                        }
                    }

                    assign(result, {
                        type: methodDefinitionType,
                        key: convertChild(node.name),
                        value: method,
                        computed: isMethodNameComputed,
                        static: Boolean(ts.getModifierFlags(node) & ts.ModifierFlags.Static),
                        kind: "method",
                        accessibility: getTSNodeAccessibility(node),
                        decorators: (node.decorators) ? node.decorators.map(function(d) {
                            return convertChild(d.expression);
                        }) : []
                    });

                }

                if (node.kind === SyntaxKind.GetAccessor) {
                    result.kind = "get";
                } else if (node.kind === SyntaxKind.SetAccessor) {
                    result.kind = "set";
                } else if (!result.static && node.name.kind === SyntaxKind.StringLiteral && node.name.text === "constructor") {
                    result.kind = "constructor";
                }

                // Process typeParameters
                if (node.typeParameters && node.typeParameters.length) {
                    method.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
                }

                break;

            // TypeScript uses this even for static methods named "constructor"
            case SyntaxKind.Constructor:

                var constructorIsStatic = Boolean(ts.getModifierFlags(node) & ts.ModifierFlags.Static),
                    firstConstructorToken = constructorIsStatic ? ts.findNextToken(node.getFirstToken(), ast) : node.getFirstToken(),
                    constructorLoc = ast.getLineAndCharacterOfPosition(node.parameters.pos - 1),
                    constructor = {
                        type: "FunctionExpression",
                        id: null,
                        params: node.parameters.map(function(param) {
                            var convertedParam = convertChild(param);
                            var decorators = (param.decorators) ? param.decorators.map(function(d) {
                                return convertChild(d.expression);
                            }) : [];

                            return assign(convertedParam, {
                                decorators: decorators
                            });
                        }),
                        generator: false,
                        expression: false,
                        async: false,
                        body: convertChild(node.body),
                        range: [ node.parameters.pos - 1, result.range[1]],
                        loc: {
                            start: {
                                line: constructorLoc.line + 1,
                                column: constructorLoc.character
                            },
                            end: result.loc.end
                        }
                    };

                var constructorIdentifierLoc = ast.getLineAndCharacterOfPosition(firstConstructorToken.getStart()),
                    constructorIsComputed = !!node.name && (node.name.kind === SyntaxKind.ComputedPropertyName),
                    constructorKey;

                if (constructorIsComputed) {
                    constructorKey = {
                        type: "Literal",
                        value: "constructor",
                        raw: node.name.getText(),
                        range: [ firstConstructorToken.getStart(), firstConstructorToken.end ],
                        loc: {
                            start: {
                                line: constructorIdentifierLoc.line + 1,
                                column: constructorIdentifierLoc.character
                            },
                            end: {
                                line: constructor.loc.start.line,
                                column: constructor.loc.start.column
                            }
                        }
                    };
                } else {
                    constructorKey = {
                        type: "Identifier",
                        name: "constructor",
                        range: [ firstConstructorToken.getStart(), firstConstructorToken.end ],
                        loc: {
                            start: {
                                line: constructorIdentifierLoc.line + 1,
                                column: constructorIdentifierLoc.character
                            },
                            end: {
                                line: constructor.loc.start.line,
                                column: constructor.loc.start.column
                            }
                        }
                    };
                }

                assign(result, {
                    type: "MethodDefinition",
                    key: constructorKey,
                    value: constructor,
                    computed: constructorIsComputed,
                    accessibility: getTSNodeAccessibility(node),
                    static: constructorIsStatic,
                    kind: (constructorIsStatic || constructorIsComputed) ? "method" : "constructor"
                });
                break;

            case SyntaxKind.FunctionExpression:
                assign(result, {
                    type: "FunctionExpression",
                    id: convertChild(node.name),
                    generator: !!node.asteriskToken,
                    params: node.parameters.map(convertChild),
                    body: convertChild(node.body),
                    async: isAsyncFunction(node),
                    expression: false
                });
                // Process returnType
                if (node.type) {
                    result.returnType = convertTypeAnnotation(node.type);
                }
                // Process typeParameters
                if (node.typeParameters && node.typeParameters.length) {
                    result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
                }
                break;

            case SyntaxKind.SuperKeyword:
                assign(result, {
                    type: "Super"
                });
                break;

            case SyntaxKind.ArrayBindingPattern:
                assign(result, {
                    type: "ArrayPattern",
                    elements: node.elements.map(convertChild)
                });
                break;

            // occurs with missing array elements like [,]
            case SyntaxKind.OmittedExpression:
                return null;

            case SyntaxKind.ObjectBindingPattern:
                assign(result, {
                    type: "ObjectPattern",
                    properties: node.elements.map(convertChild)
                });
                break;

            case SyntaxKind.BindingElement:

                if (parent.kind === SyntaxKind.ArrayBindingPattern) {
                    var arrayItem = convert(node.name, parent);
                    if (node.initializer) {
                        assign(result, {
                            type: "AssignmentPattern",
                            left: arrayItem,
                            right: convertChild(node.initializer)
                        });
                    } else {
                        return arrayItem;
                    }
                } else {

                    assign(result, {
                        type: "Property",
                        key: convertChild(node.propertyName || node.name),
                        value: convertChild(node.name),
                        computed: false,
                        method: false,
                        shorthand: !node.propertyName,
                        kind: "init"
                    });

                    if (node.initializer) {
                        result.value = {
                            type: "AssignmentPattern",
                            left: convertChild(node.name),
                            right: convertChild(node.initializer),
                            range: [ node.name.getStart(), node.initializer.end ],
                            loc: getLocFor(node.name.getStart(), node.initializer.end, ast)
                        };
                    }

                }
                break;


            case SyntaxKind.ArrowFunction:
                assign(result, {
                    type: "ArrowFunctionExpression",
                    generator: false,
                    id: null,
                    params: node.parameters.map(convertChild),
                    body: convertChild(node.body),
                    async: isAsyncFunction(node),
                    expression: node.body.kind !== SyntaxKind.Block
                });
                // Process returnType
                if (node.type) {
                    result.returnType = convertTypeAnnotation(node.type);
                }
                // Process typeParameters
                if (node.typeParameters && node.typeParameters.length) {
                    result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
                }
                break;

            case SyntaxKind.YieldExpression:
                assign(result, {
                    type: "YieldExpression",
                    delegate: !!node.asteriskToken,
                    argument: convertChild(node.expression)
                });
                break;

            case SyntaxKind.AwaitExpression:
                assign(result, {
                    type: "AwaitExpression",
                    argument: convertChild(node.expression)
                });
                break;

            // Template Literals

            case SyntaxKind.NoSubstitutionTemplateLiteral:
                assign(result, {
                    type: "TemplateLiteral",
                    quasis: [
                        {
                            type: "TemplateElement",
                            value: {
                                raw: ast.text.slice(node.getStart() + 1, node.end - 1),
                                cooked: node.text
                            },
                            tail: true,
                            range: result.range,
                            loc: result.loc
                        }
                    ],
                    expressions: []
                });
                break;

            case SyntaxKind.TemplateExpression:
                assign(result, {
                    type: "TemplateLiteral",
                    quasis: [ convertChild(node.head) ],
                    expressions: []
                });

                node.templateSpans.forEach(function(templateSpan) {
                    result.expressions.push(convertChild(templateSpan.expression));
                    result.quasis.push(convertChild(templateSpan.literal));
                });
                break;

            case SyntaxKind.TaggedTemplateExpression:
                assign(result, {
                    type: "TaggedTemplateExpression",
                    tag: convertChild(node.tag),
                    quasi: convertChild(node.template)
                });
                break;

            case SyntaxKind.TemplateHead:
            case SyntaxKind.TemplateMiddle:
            case SyntaxKind.TemplateTail:
                var tail = (node.kind === SyntaxKind.TemplateTail);
                assign(result, {
                    type: "TemplateElement",
                    value: {
                        raw: ast.text.slice(node.getStart() + 1, node.end - (tail ? 1 : 2)),
                        cooked: node.text
                    },
                    tail: tail
                });
                break;

            // Patterns

            case SyntaxKind.SpreadElement:
            case SyntaxKind.SpreadAssignment:
                assign(result, {
                    type: "SpreadElement",
                    argument: convertChild(node.expression)
                });
                break;

            case SyntaxKind.Parameter:
                var parameter;
                if (node.dotDotDotToken) {
                    parameter = convertChild(node.name);
                    assign(result, {
                        type: "RestElement",
                        argument: parameter
                    });
                } else if (node.initializer) {
                    parameter = convertChild(node.name);
                    assign(result, {
                        type: "AssignmentPattern",
                        left: parameter,
                        right: convertChild(node.initializer)
                    });
                } else {
                    parameter = convert(node.name, parent);
                    result = parameter;
                }

                if (node.type) {
                    assign(parameter, {
                        typeAnnotation: convertTypeAnnotation(node.type)
                    });
                }

                if (node.modifiers) {
                    return {
                        type: "TSParameterProperty",
                        range: [node.getStart(), node.end],
                        loc: getLoc(node, ast),
                        accessibility: getTSNodeAccessibility(node),
                        isReadonly: node.modifiers.some(function(modifier) {
                            return modifier.kind === SyntaxKind.ReadonlyKeyword;
                        }),
                        parameter: result
                    };
                }

                break;

            // Classes

            case SyntaxKind.ClassDeclaration:
            case SyntaxKind.ClassExpression:

                var heritageClauses = node.heritageClauses || [];
                var lastClassToken = heritageClauses.length ? heritageClauses[heritageClauses.length - 1] : node.name;
                var classNodeType = SyntaxKind[node.kind];

                if (node.typeParameters && node.typeParameters.length) {
                    var lastTypeParameter = node.typeParameters[node.typeParameters.length - 1];
                    if (!lastClassToken || lastTypeParameter.pos > lastClassToken.pos) {
                        lastClassToken = ts.findNextToken(lastTypeParameter, ast);
                    }
                    result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
                }

                if (node.modifiers && node.modifiers.length) {

                    /**
                     * TypeScript class declarations can be defined as "abstract"
                     */
                    if (node.kind === SyntaxKind.ClassDeclaration) {
                        var isAbstractClass = node.modifiers.some(function(modifier) {
                            return modifier.kind === ts.SyntaxKind.AbstractKeyword;
                        });
                        if (isAbstractClass) {
                            classNodeType = "TSAbstract" + classNodeType;
                        }
                    }

                    /**
                     * We need check for modifiers, and use the last one, as there
                     * could be multiple before the open brace
                     */
                    var lastModifier = node.modifiers[node.modifiers.length - 1];
                    if (!lastClassToken || lastModifier.pos > lastClassToken.pos) {
                        lastClassToken = ts.findNextToken(lastModifier, ast);
                    }

                } else if (!lastClassToken) { // no name
                    lastClassToken = node.getFirstToken();
                }

                var openBrace = ts.findNextToken(lastClassToken, ast);
                var hasExtends = (heritageClauses.length && node.heritageClauses[0].token === SyntaxKind.ExtendsKeyword),
                    superClass,
                    hasImplements = false;

                if (hasExtends) {
                    superClass = heritageClauses.shift();
                }

                hasImplements = heritageClauses.length > 0;

                assign(result, {
                    type: classNodeType,
                    id: convertChild(node.name),
                    body: {
                        type: "ClassBody",
                        body: [],

                        // TODO: Fix location info
                        range: [ openBrace.getStart(), result.range[1] ],
                        loc: getLocFor(openBrace.getStart(), node.end, ast)
                    },
                    superClass: (superClass ? convertChild(superClass.types[0].expression) : null),
                    implements: hasImplements ? heritageClauses[0].types.map(convertClassImplements) : [],
                    decorators: (node.decorators) ? node.decorators.map(function(d) {
                        return convertChild(d.expression);
                    }) : []
                });

                var filteredMembers = node.members.filter(isESTreeClassMember);
                if (filteredMembers.length) {
                    result.body.body = filteredMembers.map(convertChild);
                }

                // check for exports
                result = fixExports(node, result, ast);

                break;

            // Modules
            case SyntaxKind.ModuleBlock:
                assign(result, {
                    type: "TSModuleBlock",
                    body: node.statements.map(convertChild)
                });
                break;

            case SyntaxKind.ImportDeclaration:
                assign(result, {
                    type: "ImportDeclaration",
                    source: convertChild(node.moduleSpecifier),
                    specifiers: []
                });

                if (node.importClause) {
                    if (node.importClause.name) {
                        result.specifiers.push(convertChild(node.importClause));
                    }

                    if (node.importClause.namedBindings) {
                        if (node.importClause.namedBindings.kind === SyntaxKind.NamespaceImport) {
                            result.specifiers.push(convertChild(node.importClause.namedBindings));
                        } else {
                            result.specifiers = result.specifiers.concat(node.importClause.namedBindings.elements.map(convertChild));
                        }
                    }
                }

                break;

            case SyntaxKind.NamespaceImport:
                assign(result, {
                    type: "ImportNamespaceSpecifier",
                    local: convertChild(node.name)
                });
                break;

            case SyntaxKind.ImportSpecifier:
                assign(result, {
                    type: "ImportSpecifier",
                    local: convertChild(node.name),
                    imported: convertChild(node.propertyName || node.name)
                });
                break;

            case SyntaxKind.ImportClause:
                assign(result, {
                    type: "ImportDefaultSpecifier",
                    local: convertChild(node.name)
                });

                // have to adjust location information due to tree differences
                result.range[1] = node.name.end;
                result.loc = getLocFor(result.range[0], result.range[1], ast);
                break;

            case SyntaxKind.NamedImports:
                assign(result, {
                    type: "ImportDefaultSpecifier",
                    local: convertChild(node.name)
                });
                break;

            case SyntaxKind.ExportDeclaration:
                if (node.exportClause) {
                    assign(result, {
                        type: "ExportNamedDeclaration",
                        source: convertChild(node.moduleSpecifier),
                        specifiers: node.exportClause.elements.map(convertChild),
                        declaration: null
                    });
                } else {
                    assign(result, {
                        type: "ExportAllDeclaration",
                        source: convertChild(node.moduleSpecifier)
                    });
                }
                break;

            case SyntaxKind.ExportSpecifier:
                assign(result, {
                    type: "ExportSpecifier",
                    local: convertChild(node.propertyName || node.name),
                    exported: convertChild(node.name)
                });
                break;

            case SyntaxKind.ExportAssignment:
                assign(result, {
                    type: "ExportDefaultDeclaration",
                    declaration: convertChild(node.expression)
                });
                break;

            // Unary Operations

            case SyntaxKind.PrefixUnaryExpression:
            case SyntaxKind.PostfixUnaryExpression:
                var operator = TOKEN_TO_TEXT[node.operator];
                assign(result, {
                    // ESTree uses UpdateExpression for ++/--
                    type: /^(?:\+\+|\-\-)$/.test(operator) ? "UpdateExpression" : "UnaryExpression",
                    operator: operator,
                    prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
                    argument: convertChild(node.operand)
                });
                break;

            case SyntaxKind.DeleteExpression:
                assign(result, {
                    type: "UnaryExpression",
                    operator: "delete",
                    prefix: true,
                    argument: convertChild(node.expression)
                });
                break;

            case SyntaxKind.VoidExpression:
                assign(result, {
                    type: "UnaryExpression",
                    operator: "void",
                    prefix: true,
                    argument: convertChild(node.expression)
                });
                break;

            case SyntaxKind.TypeOfExpression:
                assign(result, {
                    type: "UnaryExpression",
                    operator: "typeof",
                    prefix: true,
                    argument: convertChild(node.expression)
                });
                break;

            // Binary Operations

            case SyntaxKind.BinaryExpression:

                // TypeScript uses BinaryExpression for sequences as well
                if (isComma(node.operatorToken)) {
                    assign(result, {
                        type: "SequenceExpression",
                        expressions: []
                    });

                    var left = convertChild(node.left),
                        right = convertChild(node.right);

                    if (left.type === "SequenceExpression") {
                        result.expressions = result.expressions.concat(left.expressions);
                    } else {
                        result.expressions.push(left);
                    }

                    if (right.type === "SequenceExpression") {
                        result.expressions = result.expressions.concat(right.expressions);
                    } else {
                        result.expressions.push(right);
                    }

                } else {
                    assign(result, {
                        type: getBinaryExpressionType(node.operatorToken),
                        operator: TOKEN_TO_TEXT[node.operatorToken.kind],
                        left: convertChild(node.left),
                        right: convertChild(node.right)
                    });

                    // if the binary expression is in a destructured array, switch it
                    if (result.type === "AssignmentExpression") {
                        var upperArrayNode = ts.getAncestor(node, SyntaxKind.ArrayLiteralExpression),
                            upperArrayAssignNode = upperArrayNode && ts.getAncestor(upperArrayNode, SyntaxKind.BinaryExpression),
                            upperArrayIsInAssignment;

                        if (upperArrayAssignNode) {
                            if (upperArrayAssignNode.left === upperArrayNode) {
                                upperArrayIsInAssignment = true;
                            } else {
                                upperArrayIsInAssignment = (ts.findChildOfKind(upperArrayAssignNode.left, SyntaxKind.ArrayLiteralExpression, ast) === upperArrayNode);
                            }
                        }

                        if (upperArrayIsInAssignment) {
                            delete result.operator;
                            result.type = "AssignmentPattern";
                        }
                    }
                }
                break;

            case SyntaxKind.PropertyAccessExpression:
                if (isJSXToken(parent)) {
                    var jsxMemberExpression = {
                        type: "MemberExpression",
                        object: convertChild(node.expression),
                        property: convertChild(node.name)
                    };
                    var isNestedMemberExpression = (node.expression.kind === SyntaxKind.PropertyAccessExpression);
                    jsxMemberExpression.object.type = (isNestedMemberExpression) ? "MemberExpression" : "JSXIdentifier";
                    jsxMemberExpression.property.type = "JSXIdentifier";
                    assign(result, jsxMemberExpression);
                } else {
                    assign(result, {
                        type: "MemberExpression",
                        object: convertChild(node.expression),
                        property: convertChild(node.name),
                        computed: false
                    });
                }
                break;

            case SyntaxKind.ElementAccessExpression:
                assign(result, {
                    type: "MemberExpression",
                    object: convertChild(node.expression),
                    property: convertChild(node.argumentExpression),
                    computed: true
                });
                break;

            case SyntaxKind.ConditionalExpression:
                assign(result, {
                    type: "ConditionalExpression",
                    test: convertChild(node.condition),
                    consequent: convertChild(node.whenTrue),
                    alternate: convertChild(node.whenFalse)
                });
                break;

            case SyntaxKind.CallExpression:
                assign(result, {
                    type: "CallExpression",
                    callee: convertChild(node.expression),
                    arguments: node.arguments.map(convertChild)
                });
                if (node.typeArguments && node.typeArguments.length) {
                    result.typeParameters = convertTypeArgumentsToTypeParameters(node.typeArguments);
                }
                break;

            case SyntaxKind.NewExpression:
                assign(result, {
                    type: "NewExpression",
                    callee: convertChild(node.expression),
                    arguments: (node.arguments) ? node.arguments.map(convertChild) : []
                });
                if (node.typeArguments && node.typeArguments.length) {
                    result.typeParameters = convertTypeArgumentsToTypeParameters(node.typeArguments);
                }
                break;

            case SyntaxKind.MetaProperty:
                var newToken = convertToken(node.getFirstToken(), ast);

                assign(result, {
                    type: "MetaProperty",
                    meta: {
                        type: "Identifier",
                        range: newToken.range,
                        loc: newToken.loc,
                        name: "new"
                    },
                    property: convertChild(node.name)
                });
                break;


            // Literals

            case SyntaxKind.StringLiteral:
                assign(result, {
                    type: "Literal",
                    value: unescape(node.text),
                    raw: ast.text.slice(result.range[0], result.range[1])
                });
                break;

            case SyntaxKind.NumericLiteral:
                assign(result, {
                    type: "Literal",
                    value: Number(node.text),
                    raw: ast.text.slice(result.range[0], result.range[1])
                });
                break;

            case SyntaxKind.RegularExpressionLiteral:
                assign(result, {
                    type: "Literal",
                    value: Number(node.text),
                    raw: node.text,
                    regex: {
                        pattern: node.text.slice(1, node.text.lastIndexOf("/")),
                        flags: node.text.slice(node.text.lastIndexOf("/") + 1)
                    }
                });
                break;

            case SyntaxKind.TrueKeyword:
                assign(result, {
                    type: "Literal",
                    value: true,
                    raw: "true"
                });
                break;

            case SyntaxKind.FalseKeyword:
                assign(result, {
                    type: "Literal",
                    value: false,
                    raw: "false"
                });
                break;

            case SyntaxKind.NullKeyword:
                assign(result, {
                    type: "Literal",
                    value: null,
                    raw: "null"
                });
                break;

            case SyntaxKind.EmptyStatement:
            case SyntaxKind.DebuggerStatement:
                simplyCopy();
                break;

            // JSX

            case SyntaxKind.JsxElement:
                assign(result, {
                    type: "JSXElement",
                    openingElement: convertChild(node.openingElement),
                    closingElement: convertChild(node.closingElement),
                    children: node.children.map(convertChild)
                });

                break;

            case SyntaxKind.JsxSelfClosingElement:
                // Convert SyntaxKind.JsxSelfClosingElement to SyntaxKind.JsxOpeningElement,
                // TypeScript does not seem to have the idea of openingElement when tag is self-closing
                node.kind = SyntaxKind.JsxOpeningElement;
                var openingElement = convertChild(node);
                openingElement.selfClosing = true;
                assign(result, {
                    type: "JSXElement",
                    openingElement: openingElement,
                    closingElement: null,
                    children: []
                });

                break;

            case SyntaxKind.JsxOpeningElement:
                var openingTagName = convertTypeScriptJSXTagNameToESTreeName(node.tagName);
                assign(result, {
                    type: "JSXOpeningElement",
                    selfClosing: false,
                    name: openingTagName,
                    attributes: node.attributes.map(convertChild)
                });

                break;

            case SyntaxKind.JsxClosingElement:
                var closingTagName = convertTypeScriptJSXTagNameToESTreeName(node.tagName);
                assign(result, {
                    type: "JSXClosingElement",
                    name: closingTagName
                });

                break;

            case SyntaxKind.JsxExpression:
                var eloc = ast.getLineAndCharacterOfPosition(result.range[0] + 1);
                var expression = (node.expression) ? convertChild(node.expression) : {
                    type: "JSXEmptyExpression",
                    loc: {
                        start: {
                            line: eloc.line + 1,
                            column: eloc.character
                        },
                        end: {
                            line: result.loc.end.line,
                            column: result.loc.end.column - 1
                        }
                    },
                    range: [result.range[0] + 1, result.range[1] - 1]
                };

                assign(result, {
                    type: "JSXExpressionContainer",
                    expression: expression
                });

                break;

            case SyntaxKind.JsxAttribute:
                var attributeName = convertToken(node.name, ast);
                attributeName.type = "JSXIdentifier";
                attributeName.name = attributeName.value;
                delete attributeName.value;

                assign(result, {
                    type: "JSXAttribute",
                    name: attributeName,
                    value: convertChild(node.initializer)
                });

                break;

            case SyntaxKind.JsxText:
                assign(result, {
                    type: "Literal",
                    value: ast.text.slice(node.pos, node.end),
                    raw: ast.text.slice(node.pos, node.end)
                });

                result.loc.start.column = node.pos;
                result.range[0] = node.pos;

                break;

            case SyntaxKind.JsxSpreadAttribute:
                assign(result, {
                    type: "JSXSpreadAttribute",
                    argument: convertChild(node.expression)
                });

                break;

            case SyntaxKind.FirstNode:
                var jsxMemberExpressionObject = convertChild(node.left);
                jsxMemberExpressionObject.type = "JSXIdentifier";
                delete jsxMemberExpressionObject.value;

                var jsxMemberExpressionProperty = convertChild(node.right);
                jsxMemberExpressionProperty.type = "JSXIdentifier";
                delete jsxMemberExpressionObject.value;

                assign(result, {
                    type: "JSXMemberExpression",
                    object: jsxMemberExpressionObject,
                    property: jsxMemberExpressionProperty
                });

                break;

            // TypeScript specific

            case SyntaxKind.ParenthesizedExpression:
                return convert(node.expression, parent);

            /**
             * Convert TypeAliasDeclaration node into VariableDeclaration
             * to allow core rules such as "semi" to work automatically
             */
            case SyntaxKind.TypeAliasDeclaration:
                var typeAliasDeclarator = {
                    type: "VariableDeclarator",
                    id: convertChild(node.name),
                    init: convertChild(node.type),
                    range: [node.name.getStart(), node.end]
                };

                typeAliasDeclarator.loc = getLocFor(typeAliasDeclarator.range[0], typeAliasDeclarator.range[1], ast);

                // Process typeParameters
                if (node.typeParameters && node.typeParameters.length) {
                    typeAliasDeclarator.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
                }

                assign(result, {
                    type: "VariableDeclaration",
                    kind: getDeclarationKind(node),
                    declarations: [typeAliasDeclarator]
                });

                // check for exports
                result = fixExports(node, result, ast);

                break;

            default:
                deeplyCopy();
        }

        return result;
    }

    var estree = convert(ast);

    if (extra.tokens) {
        estree.tokens = convertTokens(ast);
    }

    /**
     * Add the comment nodes to the AST (that were parsed separately in parser.js)
     * TODO: Track the progress of https://github.com/eslint/eslint/issues/6724
     * regarding ESLint itself becoming responsible for attributing comment nodes
     */
    if (extra.comment || extra.attachComment) {
        estree.comments = extra.comments || [];
    }

    return estree;

};
