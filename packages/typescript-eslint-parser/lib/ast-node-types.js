/**
 * @fileoverview The AST node types produced by the parser.
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// None!

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = {
    ArrayExpression: "ArrayExpression",
    ArrayPattern: "ArrayPattern",
    ArrowFunctionExpression: "ArrowFunctionExpression",
    AssignmentExpression: "AssignmentExpression",
    AssignmentPattern: "AssignmentPattern",
    AwaitExpression: "AwaitExpression",
    BinaryExpression: "BinaryExpression",
    BlockStatement: "BlockStatement",
    BreakStatement: "BreakStatement",
    CallExpression: "CallExpression",
    CatchClause: "CatchClause",
    ClassBody: "ClassBody",
    ClassDeclaration: "ClassDeclaration",
    ClassExpression: "ClassExpression",
    ClassImplements: "ClassImplements",
    ClassProperty: "ClassProperty",
    ConditionalExpression: "ConditionalExpression",
    ContinueStatement: "ContinueStatement",
    DebuggerStatement: "DebuggerStatement",
    DeclareFunction: "DeclareFunction",
    DoWhileStatement: "DoWhileStatement",
    EmptyStatement: "EmptyStatement",
    ExperimentalRestProperty: "ExperimentalRestProperty",
    ExperimentalSpreadProperty: "ExperimentalSpreadProperty",
    ExportAllDeclaration: "ExportAllDeclaration",
    ExportDefaultDeclaration: "ExportDefaultDeclaration",
    ExportNamedDeclaration: "ExportNamedDeclaration",
    ExportSpecifier: "ExportSpecifier",
    ExpressionStatement: "ExpressionStatement",
    ForInStatement: "ForInStatement",
    ForOfStatement: "ForOfStatement",
    ForStatement: "ForStatement",
    FunctionDeclaration: "FunctionDeclaration",
    FunctionExpression: "FunctionExpression",
    GenericTypeAnnotation: "GenericTypeAnnotation",
    Identifier: "Identifier",
    IfStatement: "IfStatement",
    ImportDeclaration: "ImportDeclaration",
    ImportDefaultSpecifier: "ImportDefaultSpecifier",
    ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
    ImportSpecifier: "ImportSpecifier",
    JSXAttribute: "JSXAttribute",
    JSXClosingElement: "JSXClosingElement",
    JSXElement: "JSXElement",
    JSXEmptyExpression: "JSXEmptyExpression",
    JSXExpressionContainer: "JSXExpressionContainer",
    JSXIdentifier: "JSXIdentifier",
    JSXMemberExpression: "JSXMemberExpression",
    JSXNamespacedName: "JSXNamespacedName",
    JSXOpeningElement: "JSXOpeningElement",
    JSXSpreadAttribute: "JSXSpreadAttribute",
    JSXText: "JSXText",
    LabeledStatement: "LabeledStatement",
    Literal: "Literal",
    LogicalExpression: "LogicalExpression",
    MemberExpression: "MemberExpression",
    MetaProperty: "MetaProperty",
    MethodDefinition: "MethodDefinition",
    NewExpression: "NewExpression",
    ObjectExpression: "ObjectExpression",
    ObjectPattern: "ObjectPattern",
    Program: "Program",
    Property: "Property",
    RestElement: "RestElement",
    ReturnStatement: "ReturnStatement",
    SequenceExpression: "SequenceExpression",
    SpreadElement: "SpreadElement",
    Super: "Super",
    SwitchCase: "SwitchCase",
    SwitchStatement: "SwitchStatement",
    TaggedTemplateExpression: "TaggedTemplateExpression",
    TemplateElement: "TemplateElement",
    TemplateLiteral: "TemplateLiteral",
    ThisExpression: "ThisExpression",
    ThrowStatement: "ThrowStatement",
    TryStatement: "TryStatement",

    /**
     * TS-prefixed nodes
     */
    TSAbstractClassProperty: "TSAbstractClassProperty",
    TSAbstractMethodDefinition: "TSAbstractMethodDefinition",
    TSAnyKeyword: "TSAnyKeyword",
    TSArrayType: "TSArrayType",
    TSBooleanKeyword: "TSBooleanKeyword",
    TSConstructorType: "TSConstructorType",
    TSConstructSignature: "TSConstructSignature",
    TSDeclareKeyword: "TSDeclareKeyword",
    TSInterfaceBody: "TSInterfaceBody",
    TSInterfaceDeclaration: "TSInterfaceDeclaration",
    TSInterfaceHeritage: "TSInterfaceHeritage",
    TSFunctionType: "TSFunctionType",
    TSMethodSignature: "TSMethodSignature",
    TSModuleBlock: "TSModuleBlock",
    TSModuleDeclaration: "TSModuleDeclaration",
    TSNamespaceFunctionDeclaration: "TSNamespaceFunctionDeclaration",
    TSNonNullExpression: "TSNonNullExpression",
    TSNumberKeyword: "TSNumberKeyword",
    TSParameterProperty: "TSParameterProperty",
    TSPropertySignature: "TSPropertySignature",
    TSQuestionToken: "TSQuestionToken",
    TSStringKeyword: "TSStringKeyword",
    TSTypeLiteral: "TSTypeLiteral",
    TSTypeReference: "TSTypeReference",
    TSUnionType: "TSUnionType",
    TSVoidKeyword: "TSVoidKeyword",

    TypeAnnotation: "TypeAnnotation",
    TypeParameter: "TypeParameter",
    TypeParameterDeclaration: "TypeParameterDeclaration",
    TypeParameterInstantiation: "TypeParameterInstantiation",
    UnaryExpression: "UnaryExpression",
    UpdateExpression: "UpdateExpression",
    VariableDeclaration: "VariableDeclaration",
    VariableDeclarator: "VariableDeclarator",
    WhileStatement: "WhileStatement",
    WithStatement: "WithStatement",
    YieldExpression: "YieldExpression"
};
