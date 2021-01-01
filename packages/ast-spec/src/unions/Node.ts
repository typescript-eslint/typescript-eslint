import type { ClassDeclaration } from '../declaration/ClassDeclaration/spec';
import type { ExportAllDeclaration } from '../declaration/ExportAllDeclaration/spec';
import type { ExportDefaultDeclaration } from '../declaration/ExportDefaultDeclaration/spec';
import type { ExportNamedDeclaration } from '../declaration/ExportNamedDeclaration/spec';
import type { FunctionDeclaration } from '../declaration/FunctionDeclaration/spec';
import type { TSDeclareFunction } from '../declaration/TSDeclareFunction/spec';
import type { TSEnumDeclaration } from '../declaration/TSEnumDeclaration/spec';
import type { TSImportEqualsDeclaration } from '../declaration/TSImportEqualsDeclaration/spec';
import type { TSInterfaceDeclaration } from '../declaration/TSInterfaceDeclaration/spec';
import type { TSModuleDeclaration } from '../declaration/TSModuleDeclaration/spec';
import type { TSNamespaceExportDeclaration } from '../declaration/TSNamespaceExportDeclaration/spec';
import type { TSTypeAliasDeclaration } from '../declaration/TSTypeAliasDeclaration/spec';
import type { VariableDeclaration } from '../declaration/VariableDeclaration/spec';
import type { ClassProperty } from '../element/ClassProperty/spec';
import type { MethodDefinition } from '../element/MethodDefinition/spec';
import type { Property } from '../element/Property/spec';
import type { SpreadElement } from '../element/SpreadElement/spec';
import type { TSAbstractClassProperty } from '../element/TSAbstractClassProperty/spec';
import type { TSAbstractMethodDefinition } from '../element/TSAbstractMethodDefinition/spec';
import type { TSCallSignatureDeclaration } from '../element/TSCallSignatureDeclaration/spec';
import type { TSConstructSignatureDeclaration } from '../element/TSConstructSignatureDeclaration/spec';
import type { TSEnumMember } from '../element/TSEnumMember/spec';
import type { TSIndexSignature } from '../element/TSIndexSignature/spec';
import type { TSMethodSignature } from '../element/TSMethodSignature/spec';
import type { TSPropertySignature } from '../element/TSPropertySignature/spec';
import type { ArrayExpression } from '../expression/ArrayExpression/spec';
import type { ArrowFunctionExpression } from '../expression/ArrowFunctionExpression/spec';
import type { AssignmentExpression } from '../expression/AssignmentExpression/spec';
import type { AwaitExpression } from '../expression/AwaitExpression/spec';
import type { BinaryExpression } from '../expression/BinaryExpression/spec';
import type { CallExpression } from '../expression/CallExpression/spec';
import type { ChainExpression } from '../expression/ChainExpression/spec';
import type { ClassExpression } from '../expression/ClassExpression/spec';
import type { ConditionalExpression } from '../expression/ConditionalExpression/spec';
import type { FunctionExpression } from '../expression/FunctionExpression/spec';
import type { Identifier } from '../expression/Identifier/spec';
import type { ImportExpression } from '../expression/ImportExpression/spec';
import type { JSXElement } from '../expression/JSXElement/spec';
import type { JSXFragment } from '../expression/JSXFragment/spec';
import type { LogicalExpression } from '../expression/LogicalExpression/spec';
import type { MemberExpression } from '../expression/MemberExpression/spec';
import type { MetaProperty } from '../expression/MetaProperty/spec';
import type { NewExpression } from '../expression/NewExpression/spec';
import type { ObjectExpression } from '../expression/ObjectExpression/spec';
import type { SequenceExpression } from '../expression/SequenceExpression/spec';
import type { Super } from '../expression/Super/spec';
import type { TaggedTemplateExpression } from '../expression/TaggedTemplateExpression/spec';
import type { TemplateLiteral } from '../expression/TemplateLiteral/spec';
import type { ThisExpression } from '../expression/ThisExpression/spec';
import type { TSAsExpression } from '../expression/TSAsExpression/spec';
import type { TSEmptyBodyFunctionExpression } from '../expression/TSEmptyBodyFunctionExpression/spec';
import type { TSNonNullExpression } from '../expression/TSNonNullExpression/spec';
import type { TSTypeAssertion } from '../expression/TSTypeAssertion/spec';
import type { UnaryExpression } from '../expression/UnaryExpression/spec';
import type { UpdateExpression } from '../expression/UpdateExpression/spec';
import type { YieldExpression } from '../expression/YieldExpression/spec';
import type { JSXAttribute } from '../jsx/JSXAttribute/spec';
import type { JSXClosingElement } from '../jsx/JSXClosingElement/spec';
import type { JSXClosingFragment } from '../jsx/JSXClosingFragment/spec';
import type { JSXEmptyExpression } from '../jsx/JSXEmptyExpression/spec';
import type { JSXExpressionContainer } from '../jsx/JSXExpressionContainer/spec';
import type { JSXIdentifier } from '../jsx/JSXIdentifier/spec';
import type { JSXMemberExpression } from '../jsx/JSXMemberExpression/spec';
import type { JSXNamespacedName } from '../jsx/JSXNamespacedName/spec';
import type { JSXOpeningElement } from '../jsx/JSXOpeningElement/spec';
import type { JSXOpeningFragment } from '../jsx/JSXOpeningFragment/spec';
import type { JSXSpreadAttribute } from '../jsx/JSXSpreadAttribute/spec';
import type { JSXSpreadChild } from '../jsx/JSXSpreadChild/spec';
import type { JSXText } from '../jsx/JSXText/spec';
import type { ArrayPattern } from '../parameter/ArrayPattern/spec';
import type { AssignmentPattern } from '../parameter/AssignmentPattern/spec';
import type { ObjectPattern } from '../parameter/ObjectPattern/spec';
import type { RestElement } from '../parameter/RestElement/spec';
import type { TSParameterProperty } from '../parameter/TSParameterProperty/spec';
import type { CatchClause } from '../special/CatchClause/spec';
import type { ClassBody } from '../special/ClassBody/spec';
import type { Decorator } from '../special/Decorator/spec';
import type { EmptyStatement } from '../special/EmptyStatement/spec';
import type { ExportSpecifier } from '../special/ExportSpecifier/spec';
import type { ImportDefaultSpecifier } from '../special/ImportDefaultSpecifier/spec';
import type { ImportNamespaceSpecifier } from '../special/ImportNamespaceSpecifier/spec';
import type { ImportSpecifier } from '../special/ImportSpecifier/spec';
import type { Program } from '../special/Program/spec';
import type { SwitchCase } from '../special/SwitchCase/spec';
import type { TemplateElement } from '../special/TemplateElement/spec';
import type { TSClassImplements } from '../special/TSClassImplements/spec';
import type { TSExternalModuleReference } from '../special/TSExternalModuleReference/spec';
import type { TSInterfaceBody } from '../special/TSInterfaceBody/spec';
import type { TSInterfaceHeritage } from '../special/TSInterfaceHeritage/spec';
import type { TSModuleBlock } from '../special/TSModuleBlock/spec';
import type { TSTypeAnnotation } from '../special/TSTypeAnnotation/spec';
import type { TSTypeParameter } from '../special/TSTypeParameter/spec';
import type { TSTypeParameterDeclaration } from '../special/TSTypeParameterDeclaration/spec';
import type { TSTypeParameterInstantiation } from '../special/TSTypeParameterInstantiation/spec';
import type { VariableDeclarator } from '../special/VariableDeclarator/spec';
import type { BlockStatement } from '../statement/BlockStatement/spec';
import type { BreakStatement } from '../statement/BreakStatement/spec';
import type { ContinueStatement } from '../statement/ContinueStatement/spec';
import type { DebuggerStatement } from '../statement/DebuggerStatement/spec';
import type { DoWhileStatement } from '../statement/DoWhileStatement/spec';
import type { ExpressionStatement } from '../statement/ExpressionStatement/spec';
import type { ForInStatement } from '../statement/ForInStatement/spec';
import type { ForOfStatement } from '../statement/ForOfStatement/spec';
import type { ForStatement } from '../statement/ForStatement/spec';
import type { IfStatement } from '../statement/IfStatement/spec';
import type { ImportDeclaration } from '../statement/ImportDeclaration/spec';
import type { LabeledStatement } from '../statement/LabeledStatement/spec';
import type { ReturnStatement } from '../statement/ReturnStatement/spec';
import type { SwitchStatement } from '../statement/SwitchStatement/spec';
import type { ThrowStatement } from '../statement/ThrowStatement/spec';
import type { TryStatement } from '../statement/TryStatement/spec';
import type { TSExportAssignment } from '../statement/TSExportAssignment/spec';
import type { WhileStatement } from '../statement/WhileStatement/spec';
import type { WithStatement } from '../statement/WithStatement/spec';
import type { TSAbstractKeyword } from '../token/TSAbstractKeyword/spec';
import type { TSAsyncKeyword } from '../token/TSAsyncKeyword/spec';
import type { TSDeclareKeyword } from '../token/TSDeclareKeyword/spec';
import type { TSExportKeyword } from '../token/TSExportKeyword/spec';
import type { TSPrivateKeyword } from '../token/TSPrivateKeyword/spec';
import type { TSProtectedKeyword } from '../token/TSProtectedKeyword/spec';
import type { TSPublicKeyword } from '../token/TSPublicKeyword/spec';
import type { TSReadonlyKeyword } from '../token/TSReadonlyKeyword/spec';
import type { TSStaticKeyword } from '../token/TSStaticKeyword/spec';
import type { TSAnyKeyword } from '../type/TSAnyKeyword/spec';
import type { TSArrayType } from '../type/TSArrayType/spec';
import type { TSBigIntKeyword } from '../type/TSBigIntKeyword/spec';
import type { TSBooleanKeyword } from '../type/TSBooleanKeyword/spec';
import type { TSConditionalType } from '../type/TSConditionalType/spec';
import type { TSConstructorType } from '../type/TSConstructorType/spec';
import type { TSFunctionType } from '../type/TSFunctionType/spec';
import type { TSImportType } from '../type/TSImportType/spec';
import type { TSIndexedAccessType } from '../type/TSIndexedAccessType/spec';
import type { TSInferType } from '../type/TSInferType/spec';
import type { TSIntersectionType } from '../type/TSIntersectionType/spec';
import type { TSIntrinsicKeyword } from '../type/TSIntrinsicType/spec';
import type { TSLiteralType } from '../type/TSLiteralType/spec';
import type { TSMappedType } from '../type/TSMappedType/spec';
import type { TSNamedTupleMember } from '../type/TSNamedTupleMember/spec';
import type { TSNeverKeyword } from '../type/TSNeverKeyword/spec';
import type { TSNullKeyword } from '../type/TSNullKeyword/spec';
import type { TSNumberKeyword } from '../type/TSNumberKeyword/spec';
import type { TSObjectKeyword } from '../type/TSObjectKeyword/spec';
import type { TSOptionalType } from '../type/TSOptionalType/spec';
import type { TSParenthesizedType } from '../type/TSParenthesizedType/spec';
import type { TSQualifiedName } from '../type/TSQualifiedName/spec';
import type { TSRestType } from '../type/TSRestType/spec';
import type { TSStringKeyword } from '../type/TSStringKeyword/spec';
import type { TSSymbolKeyword } from '../type/TSSymbolKeyword/spec';
import type { TSTemplateLiteralType } from '../type/TSTemplateLiteralType/spec';
import type { TSThisType } from '../type/TSThisType/spec';
import type { TSTupleType } from '../type/TSTupleType/spec';
import type { TSTypeLiteral } from '../type/TSTypeLiteral/spec';
import type { TSTypeOperator } from '../type/TSTypeOperator/spec';
import type { TSTypePredicate } from '../type/TSTypePredicate/spec';
import type { TSTypeQuery } from '../type/TSTypeQuery/spec';
import type { TSTypeReference } from '../type/TSTypeReference/spec';
import type { TSUndefinedKeyword } from '../type/TSUndefinedKeyword/spec';
import type { TSUnionType } from '../type/TSUnionType/spec';
import type { TSUnknownKeyword } from '../type/TSUnknownKeyword/spec';
import type { TSVoidKeyword } from '../type/TSVoidKeyword/spec';
import type { Literal } from './Literal';

/*
 * NOTE:
 * Tokens are not included in the `Node` union below on purpose because they are not ever included as part of the standard AST tree.
 */

export type Node =
  | ArrayExpression
  | ArrayPattern
  | ArrowFunctionExpression
  | AssignmentExpression
  | AssignmentPattern
  | AwaitExpression
  | BinaryExpression
  | BlockStatement
  | BreakStatement
  | CallExpression
  | CatchClause
  | ChainExpression
  | ClassBody
  | ClassDeclaration
  | ClassExpression
  | ClassProperty
  | ConditionalExpression
  | ContinueStatement
  | DebuggerStatement
  | Decorator
  | DoWhileStatement
  | EmptyStatement
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ExportSpecifier
  | ExpressionStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | FunctionDeclaration
  | FunctionExpression
  | Identifier
  | IfStatement
  | ImportDeclaration
  | ImportDefaultSpecifier
  | ImportExpression
  | ImportNamespaceSpecifier
  | ImportSpecifier
  | JSXAttribute
  | JSXClosingElement
  | JSXClosingFragment
  | JSXElement
  | JSXEmptyExpression
  | JSXExpressionContainer
  | JSXFragment
  | JSXIdentifier
  | JSXMemberExpression
  | JSXNamespacedName
  | JSXOpeningElement
  | JSXOpeningFragment
  | JSXSpreadAttribute
  | JSXSpreadChild
  | JSXText
  | LabeledStatement
  | Literal
  | LogicalExpression
  | MemberExpression
  | MetaProperty
  | MethodDefinition
  | NewExpression
  | ObjectExpression
  | ObjectPattern
  | Program
  | Property
  | RestElement
  | ReturnStatement
  | SequenceExpression
  | SpreadElement
  | Super
  | SwitchCase
  | SwitchStatement
  | TaggedTemplateExpression
  | TemplateElement
  | TemplateLiteral
  | ThisExpression
  | ThrowStatement
  | TryStatement
  | TSAbstractClassProperty
  | TSAbstractKeyword
  | TSAbstractMethodDefinition
  | TSAnyKeyword
  | TSArrayType
  | TSAsExpression
  | TSAsyncKeyword
  | TSBigIntKeyword
  | TSBooleanKeyword
  | TSCallSignatureDeclaration
  | TSClassImplements
  | TSConditionalType
  | TSConstructorType
  | TSConstructSignatureDeclaration
  | TSDeclareFunction
  | TSDeclareKeyword
  | TSEmptyBodyFunctionExpression
  | TSEnumDeclaration
  | TSEnumMember
  | TSExportAssignment
  | TSExportKeyword
  | TSExternalModuleReference
  | TSFunctionType
  | TSImportEqualsDeclaration
  | TSImportType
  | TSIndexedAccessType
  | TSIndexSignature
  | TSInferType
  | TSInterfaceBody
  | TSInterfaceDeclaration
  | TSInterfaceHeritage
  | TSIntersectionType
  | TSIntrinsicKeyword
  | TSLiteralType
  | TSMappedType
  | TSMethodSignature
  | TSModuleBlock
  | TSModuleDeclaration
  | TSNamedTupleMember
  | TSNamespaceExportDeclaration
  | TSNeverKeyword
  | TSNonNullExpression
  | TSNullKeyword
  | TSNumberKeyword
  | TSObjectKeyword
  | TSOptionalType
  | TSParameterProperty
  | TSParenthesizedType
  | TSPrivateKeyword
  | TSPropertySignature
  | TSProtectedKeyword
  | TSPublicKeyword
  | TSQualifiedName
  | TSReadonlyKeyword
  | TSRestType
  | TSStaticKeyword
  | TSStringKeyword
  | TSSymbolKeyword
  | TSTemplateLiteralType
  | TSThisType
  | TSTupleType
  | TSTypeAliasDeclaration
  | TSTypeAnnotation
  | TSTypeAssertion
  | TSTypeLiteral
  | TSTypeOperator
  | TSTypeParameter
  | TSTypeParameterDeclaration
  | TSTypeParameterInstantiation
  | TSTypePredicate
  | TSTypeQuery
  | TSTypeReference
  | TSUndefinedKeyword
  | TSUnionType
  | TSUnknownKeyword
  | TSVoidKeyword
  | UnaryExpression
  | UpdateExpression
  | VariableDeclaration
  | VariableDeclarator
  | WhileStatement
  | WithStatement
  | YieldExpression;
