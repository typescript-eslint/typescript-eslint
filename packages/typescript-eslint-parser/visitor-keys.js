/**
 * @fileoverview The visitor keys for the new and updated node types
 * @author Michał Sajnóg <https://github.com/michalsnik>
 * MIT License
 */

"use strict";

const Evk = require("eslint-visitor-keys");

module.exports = Evk.unionWith({
    // Additional Properties.
    ArrayPattern: ["elements", "typeAnnotation"],
    ArrowFunctionExpression: ["typeParameters", "params", "returnType", "body"],
    ClassDeclaration: ["decorators", "id", "typeParameters", "superClass", "body"],
    ClassExpression: ["decorators", "id", "typeParameters", "superClass", "body"],
    FunctionDeclaration: ["id", "typeParameters", "params", "returnType", "body"],
    FunctionExpression: ["id", "typeParameters", "params", "returnType", "body"],
    Identifier: ["typeAnnotation"],
    MethodDefinition: ["decorators", "key", "value"],
    ObjectPattern: ["properties", "typeAnnotation"],

    // Additional Nodes.
    ClassProperty: ["decorators", "key", "typeAnnotation", "value"],
    Decorator: ["expression"],
    TSAbstractClassProperty: ["typeAnnotation", "key", "value"],
    TSAbstractClassDeclaration: ["id", "body", "superClass", "implements"],
    TSAbstractKeyword: [],
    TSAbstractMethodDefinition: ["key", "value"],
    TSAnyKeyword: [],
    TSArrayType: ["elementType"],
    TSAsyncKeyword: [],
    TSBooleanKeyword: [],
    TSCallSignature: ["typeParameters", "parameters", "typeAnnotation"],
    TSConstructSignature: ["typeParameters", "params", "typeAnnotation"],
    TSConstructorType: ["typeAnnotation", "parameters"],
    TSDeclareKeyword: [],
    TSEmptyBodyDeclareFunction: ["id", "typeParameters", "params", "returnType"],
    TSEmptyBodyFunctionDeclaration: ["id", "typeParameters", "params", "returnType"],
    TSEmptyBodyFunctionExpression: ["id", "typeParameters", "params", "returnType"],
    TSEnumDeclaration: ["members"],
    TSEnumMember: ["initializer"],
    TSExportAssignment: ["expression"],
    TSExportKeyword: [],
    TSImportType: ["parameter", "qualifier", "typeParameters"],
    TSLiteralType: ["literal"],
    TSIndexSignature: ["typeAnnotation", "index"],
    TSInterfaceBody: ["body"],
    TSInterfaceDeclaration: ["body", "id", "heritage"],
    TSInterfaceHeritage: ["id", "typeParameters"],
    TSFunctionType: ["typeAnnotation"],
    TSMethodSignature: ["typeAnnotation", "typeParameters", "key", "params"],
    TSModuleBlock: ["body"],
    TSModuleDeclaration: ["id", "body"],
    TSNamespaceFunctionDeclaration: [],
    TSNonNullExpression: ["expression"],
    TSNeverKeyword: [],
    TSNullKeyword: [],
    TSNumberKeyword: [],
    TSObjectKeyword: [],
    TSParameterProperty: ["parameter"],
    TSPrivateKeyword: [],
    TSPropertySignature: ["typeAnnotation", "key", "initializer"],
    TSProtectedKeyword: [],
    TSPublicKeyword: [],
    TSQualifiedName: ["left", "right"],
    TSQuestionToken: [],
    TSReadonlyKeyword: [],
    TSStaticKeyword: [],
    TSStringKeyword: [],
    TSSymbolKeyword: [],
    TSTypeAnnotation: ["typeAnnotation"],
    TSTypeLiteral: ["members"],
    TSTypeOperator: ["typeAnnotation"],
    TSTypeParameter: ["constraint", "default"],
    TSTypeParameterDeclaration: ["params"],
    TSTypeParameterInstantiation: ["params"],
    TSTypePredicate: ["typeAnnotation", "parameterName"],
    TSTypeReference: ["typeName", "typeParameters"],
    TSTypeQuery: ["exprName"],
    TSUnionType: ["types"],
    TSUndefinedKeyword: [],
    TSVoidKeyword: []
});
