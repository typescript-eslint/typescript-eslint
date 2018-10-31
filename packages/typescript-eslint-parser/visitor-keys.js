/**
 * @fileoverview The visitor keys for the new and updated node types
 * @author Michał Sajnóg <https://github.com/michalsnik>
 * MIT License
 */

"use strict";

const Evk = require("eslint-visitor-keys");

module.exports = Evk.unionWith({
    ArrayPattern: ["typeAnnotation"],
    ArrowFunctionExpression: ["returnType", "typeParameters"],
    AssignmentPattern: ["typeAnnotation"],
    CallExpression: ["typeParameters"],
    ClassDeclaration: ["superTypeParameters", "typeParameters"],
    ClassExpression: ["superTypeParameters", "typeParameters"],
    ClassImplements: ["typeParameters"],
    ClassProperty: ["typeAnnotation"],
    FunctionDeclaration: ["returnType", "typeParameters"],
    FunctionExpression: ["returnType", "typeParameters"],
    Identifier: ["typeAnnotation"],
    InterfaceDeclaration: ["typeParameters"],
    NewExpression: ["typeParameters"],
    ObjectPattern: ["typeAnnotation"],
    /**
     * According to https://github.com/estree/estree/blob/master/extensions/type-annotations.md
     * RestElement should have "typeAnnotation", but has not. Annotation is added on the "parameter" node
     */
    RestElement: [],
    TaggedTemplateExpression: ["typeParameters"],
    VariableDeclarator: ["typeParameters"],

    TSAbstractClassProperty: ["typeAnnotation", "key", "value"],
    TSAbstractClassDeclaration: ["id", "body", "superClass", "implements"],
    TSAbstractKeyword: [],
    TSAbstractMethodDefinition: ["key", "value"],
    TSAnyKeyword: [],
    TSArrayType: ["elementType"],
    TSAsyncKeyword: [],
    TSBooleanKeyword: [],
    TSConstructorType: ["typeAnnotation", "parameters"],
    TSConstructSignature: ["typeAnnotation", "typeParameters"],
    TSDeclareKeyword: [],
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
    TSUnionType: ["types"],
    TSUndefinedKeyword: [],
    TSVoidKeyword: []
});
