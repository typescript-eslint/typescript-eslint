/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @copyright 2015 Fred K. Schott. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var ts = require("typescript"),
    assign = require("object-assign");

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var SyntaxKind = ts.SyntaxKind,
    TokenClass = ts.TokenClass;

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

function isESTreeClassMember(node) {
    return node.kind !== SyntaxKind.PropertyDeclaration && node.kind !== SyntaxKind.SemicolonClassElement;
}

function isComma(token) {
    return token.kind === SyntaxKind.CommaToken;
}

function isAssignmentOperator(operator) {
    return ASSIGNMENT_OPERATORS.indexOf(operator) > -1;
}

function isLogicalOperator(operator) {
    return LOGICAL_OPERATORS.indexOf(operator) > -1;
}

function getBinaryExpressionType(operator) {
    if (isAssignmentOperator(operator)) {
        return "AssignmentExpression";
    } else if (isLogicalOperator(operator)) {
        return "LogicalExpression";
    } else {
        return "BinaryExpression";
    }
}

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



function convertError(error) {

    var loc = error.file.getLineAndCharacterOfPosition(error.start);

    return {
        index: error.start,
        lineNumber: loc.line + 1,
        column: loc.character,
        message: error.message
    };
}

function getTokenType(token) {

    // Need two checks for keywords since some are also identifiers
    if (token.originalKeywordKind) {
        return "Keyword";
    }

    if (token.kind >= 68 && token.kind <= 112) {
        return "Keyword";
    }

    switch (token.kind) {
        case SyntaxKind.NumericLiteral:
            return "Numeric";

        case SyntaxKind.StringLiteral:
            return "String";

        case SyntaxKind.RegularExpressionLiteral:
            return "RegularExpression";

        case SyntaxKind.Identifier:
        case SyntaxKind.ConstructorKeyword:
        case SyntaxKind.GetKeyword:
        case SyntaxKind.SetKeyword:
            return "Identifier"
    }


    if (token.kind >= 15 && token.kind <= 66) {
        return "Punctuator";
    }



    if (token.kind >= SyntaxKind.NoSubstitutionTemplateLiteral && token.kind <= SyntaxKind.TemplateTail) {
        return "Template";
    }


    return "Unknown";
}

function convertToken(token, ast) {

    var start = token.getStart(),
        value = ast.text.slice(start, token.end),
        newToken =  {
            type: getTokenType(token),
            value: value,
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

function convertTokens(ast) {
    var token = ast.getFirstToken(),
        converted,
        result = [];

    while (token) {
        converted = convertToken(token, ast);
        if (converted) {
            result.push(converted);
        }

        token = ts.findNextToken(token, ast);
    }

    return result;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = function(ast) {

    if (ast.parseDiagnostics.length) {
        throw convertError(ast.parseDiagnostics[0]);
    }

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

        function simplyCopy() {
            assign(result, {
                type: SyntaxKind[node.kind]
            });
        }

        function convertChild(child) {
            return convert(child, node);
        }

        switch (node.kind) {
            case SyntaxKind.SourceFile:
                assign(result, {
                    type: "Program",
                    body: node.statements.map(convertChild),
                    sourceType: node.externalModuleIndicator ? "module": "script"
                });
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
                    name: node.text
                });
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

            case SyntaxKind.DoWhileStatement:
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
                assign(result, {
                    type: "FunctionDeclaration",
                    id: convertChild(node.name),
                    generator: !!node.asteriskToken,
                    expression: false,
                    params: node.parameters.map(convertChild),
                    body: convertChild(node.body)
                });
                break;

            case SyntaxKind.VariableDeclaration:
                assign(result, {
                    type: "VariableDeclarator",
                    id: convertChild(node.name),
                    init: convertChild(node.initializer)
                });
                break;

            case SyntaxKind.VariableStatement:
                assign(result, {
                    type: "VariableDeclaration",
                    declarations: node.declarationList.declarations.map(convertChild),
                    kind: (node.declarationList.flags ? (node.declarationList.flags === ts.NodeFlags.Let ? "let" : "const") : "var")
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

                // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
                if (parent.kind === SyntaxKind.BinaryExpression && node === parent.left) {
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
                assign(result, {
                    type: "ObjectExpression",
                    properties: node.properties.map(convertChild)
                });
                break;

            case SyntaxKind.PropertyAssignment:
                assign(result, {
                    type: "Property",
                    key: convertChild(node.name),
                    value: convertChild(node.initializer),
                    computed: false,
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

            case SyntaxKind.GetAccessor:
            case SyntaxKind.SetAccessor:
            case SyntaxKind.MethodDeclaration:

                // TODO: double-check that these positions are correct
                var methodLoc = ast.getLineAndCharacterOfPosition(node.name.end + 1),
                    method = {
                        type: "FunctionExpression",
                        id: null,
                        params: node.parameters.map(convertChild),
                        generator: false,
                        expression: false,
                        body: convertChild(node.body),
                        range: [ node.name.end, result.range[1]],
                        loc: {
                            start: {
                                line: methodLoc.line + 1,
                                column: methodLoc.character
                            },
                            end: result.loc.end
                        }
                    };

                if (parent.kind === SyntaxKind.ObjectLiteralExpression) {
                    assign(result, {
                        type: "Property",
                        key: convertChild(node.name),
                        value: method,
                        computed: false,
                        method: false,
                        shorthand: false,
                        kind: "init"
                    });

                } else { // class
                    var methodNameIsComputed = (node.name.kind === SyntaxKind.ComputedPropertyName);
                    assign(result, {
                        type: "MethodDefinition",
                        key: convertChild(node.name),
                        value: method,
                        computed: methodNameIsComputed,
                        static: Boolean(node.flags & ts.NodeFlags.Static),
                        kind: "method"
                    });
                }

                if (node.kind === SyntaxKind.GetAccessor) {
                    result.kind = "get";
                } else if (node.kind === SyntaxKind.SetAccessor) {
                    result.kind = "set";
                } else if (!result.static && node.name.kind === SyntaxKind.StringLiteral && node.name.text === "constructor") {
                    result.kind = "constructor";
                }
                break;

            // TypeScript uses this even for static methods named "constructor"
            case SyntaxKind.Constructor:

                var constructorIsStatic =  Boolean(node.flags & ts.NodeFlags.Static),
                    firstConstructorToken = constructorIsStatic ? ts.findNextToken(node.getFirstToken(), ast) : node.getFirstToken(),
                    constructorOffset = 11,
                    constructorStartOffset = constructorOffset + firstConstructorToken.getStart() - node.getFirstToken().getStart(),
                    constructorLoc = ast.getLineAndCharacterOfPosition(result.range[0] + constructorStartOffset),
                    constructor = {
                        type: "FunctionExpression",
                        id: null,
                        params: node.parameters.map(convertChild),
                        generator: false,
                        expression: false,
                        body: convertChild(node.body),
                        range: [ result.range[0] + constructorStartOffset, result.range[1]],
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
                    expression: false
                });
                break;

            case SyntaxKind.SuperKeyword:
                assign(result, {
                    type: "Super"
                });
                break;

            case SyntaxKind.SpreadElementExpression:
                assign(result, {
                    type: "SpreadElement",
                    argument: convertChild(node.expression)
                });
                break;

            case SyntaxKind.ArrayBindingPattern:
                assign(result, {
                    type: "ArrayPattern",
                    elements: node.elements.map(convertChild)
                });
                break;

            case SyntaxKind.ArrowFunction:
                assign(result, {
                    type: "ArrowFunctionExpression",
                    generator: false,
                    id: null,
                    params: node.parameters.map(convertChild),
                    body: convertChild(node.body),
                    expression: node.body.kind !== SyntaxKind.Block
                });
                break;

            case SyntaxKind.YieldExpression:
                assign(result, {
                    type: "YieldExpression",
                    delegate: !!node.asteriskToken,
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

            // Note: TypeScript uses this for both spread and rest expressions
            case SyntaxKind.SpreadElementExpression:
                assign(result, {
                    type: "SpreadElement",
                    argument: convertChild(node.expression)
                });
                break;

            case SyntaxKind.Parameter:

                if (node.dotDotDotToken) {
                    assign(result, {
                        type: "RestElement",
                        argument: convertChild(node.name)
                    });
                } else if (node.initializer) {
                    assign(result, {
                        type: "AssignmentPattern",
                        left: convertChild(node.name),
                        right: convertChild(node.initializer)
                    });
                } else {
                    return convert(node.name, parent);
                }

                break;

            // Classes

            case SyntaxKind.ClassDeclaration:
            case SyntaxKind.ClassExpression:
                var lastClassToken = node.heritageClauses ? node.heritageClauses[node.heritageClauses.length - 1] : node.name;
                if (!lastClassToken) { // no name
                    lastClassToken = node.getFirstToken();
                }

                var openBrace = ts.findNextToken(lastClassToken, ast);

                assign(result, {
                    type: SyntaxKind[node.kind],
                    id: convertChild(node.name),
                    body: {
                        type: "ClassBody",
                        body: [],

                        // TODO: Fix location info
                        range: [ openBrace.getStart(), result.range[1] ],
                        loc: getLocFor(openBrace.getStart(), node.end, ast)
                    },
                    superClass: (node.heritageClauses ? convertChild(node.heritageClauses[0].types[0].expression) : null),
                });

                var filteredMembers = node.members.filter(isESTreeClassMember);
                if (filteredMembers.length) {
                    result.body.body = filteredMembers.map(convertChild);
                }

                break;

            // Unary Operations

            case SyntaxKind.PrefixUnaryExpression:
            case SyntaxKind.PostfixUnaryExpression:
                assign(result, {
                    // ESTree uses UpdateExpression for ++/--
                    type: /^(?:\+\+|\-\-)$/.test(TOKEN_TO_TEXT[node.operator.kind]) ? "UpdateExpression" : "UnaryExpression",
                    operator: SyntaxKind[node.operator],
                    prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
                    argument: convertChild(node.operand)
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
                }
                break;

            case SyntaxKind.PropertyAccessExpression:
                assign(result, {
                    type: "MemberExpression",
                    object: convertChild(node.expression),
                    property: convertChild(node.name),
                    computed: false
                });
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
                break;

            case SyntaxKind.NewExpression:
                assign(result, {
                    type: "NewExpression",
                    callee: convertChild(node.expression),
                    arguments: node.arguments.map(convertChild)
                });
                break;



            // Literals

            case SyntaxKind.StringLiteral:
                assign(result, {
                    type: "Literal",
                    value: node.text,
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
                    value: "true"
                });
                break;

            case SyntaxKind.FalseKeyword:
                assign(result, {
                    type: "Literal",
                    value: "false"
                });
                break;

            case SyntaxKind.NullKeyword:
                assign(result, {
                    type: "Literal",
                    value: "null"
                });
                break;

            case SyntaxKind.EmptyStatement:
            case SyntaxKind.DebuggerStatement:
                simplyCopy();
                break;

            // TypeScript specific

            case SyntaxKind.ParenthesizedExpression:
                return convert(node.expression, parent);

            default:
                console.log(node.kind);
                result = null;
        }

        return result;
    }



    var estree = convert(ast);
    estree.tokens = convertTokens(ast);
    return estree;

};
