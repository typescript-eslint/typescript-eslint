import {
  ImplicitLibVariable,
  ScopeType,
} from '@typescript-eslint/scope-manager';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, findVariable } from '../util';

type MessageIds = 'requireTypeExport';

export default createRule<[], MessageIds>({
  name: 'require-types-exports',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require exporting types that are used in exported entities',
      recommended: 'strict',
    },
    messages: {
      requireTypeExport: 'Expected type "{{ name }}" to be exported',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const externalizedTypes = new Set<string>();
    const reportedTypes = new Set<string>();

    function collectImportedTypes(
      node:
        | TSESTree.ImportSpecifier
        | TSESTree.ImportNamespaceSpecifier
        | TSESTree.ImportDefaultSpecifier,
    ): void {
      externalizedTypes.add(node.local.name);
    }

    function collectExportedTypes(node: TSESTree.Program): void {
      const isCollectableType = (
        node: TSESTree.Node,
      ): node is
        | TSESTree.TSTypeAliasDeclaration
        | TSESTree.TSInterfaceDeclaration
        | TSESTree.TSEnumDeclaration
        | TSESTree.TSModuleDeclaration => {
        return [
          AST_NODE_TYPES.TSTypeAliasDeclaration,
          AST_NODE_TYPES.TSInterfaceDeclaration,
          AST_NODE_TYPES.TSEnumDeclaration,
          AST_NODE_TYPES.TSModuleDeclaration,
        ].includes(node.type);
      };

      node.body.forEach(statement => {
        if (
          statement.type === AST_NODE_TYPES.ExportNamedDeclaration &&
          statement.declaration &&
          isCollectableType(statement.declaration) &&
          statement.declaration.id.type === AST_NODE_TYPES.Identifier
        ) {
          externalizedTypes.add(statement.declaration.id.name);
        }
      });
    }

    function visitExportedFunctionDeclaration(
      node: (
        | TSESTree.ExportNamedDeclaration
        | TSESTree.DefaultExportDeclarations
        | TSESTree.ArrowFunctionExpression
      ) & {
        declaration: TSESTree.FunctionDeclaration | TSESTree.TSDeclareFunction;
      },
    ): void {
      checkNodeTypes(node.declaration);
    }

    function visitExportedVariableDeclaration(
      node: TSESTree.ExportNamedDeclaration & {
        declaration: TSESTree.VariableDeclaration;
      },
    ): void {
      for (const declaration of node.declaration.declarations) {
        checkNodeTypes(declaration);
      }
    }

    function visitExportedTypeAliasDeclaration(
      node: TSESTree.ExportNamedDeclaration & {
        declaration: TSESTree.TSTypeAliasDeclaration;
      },
    ): void {
      checkNodeTypes(node.declaration.typeAnnotation);
    }

    function visitExportedInterfaceDeclaration(
      node: TSESTree.ExportNamedDeclaration & {
        declaration: TSESTree.TSInterfaceDeclaration;
      },
    ): void {
      checkNodeTypes(node.declaration.body);
    }

    function visitExportDefaultDeclaration(
      node: TSESTree.ExportDefaultDeclaration,
    ): void {
      checkNodeTypes(node.declaration);
    }

    function checkNodeTypes(node: TSESTree.Node): void {
      const typeReferences = getTypeReferencesRecursively(
        node,
        context.sourceCode,
      );

      typeReferences.forEach(checkTypeNode);
    }

    function checkTypeNode(node: TSESTree.TSTypeReference): void {
      const name = getTypeName(node.typeName);

      const isExternalized = externalizedTypes.has(name);
      const isReported = reportedTypes.has(name);

      if (isExternalized || isReported) {
        return;
      }

      context.report({
        node: node,
        messageId: 'requireTypeExport',
        data: {
          name,
        },
      });

      reportedTypes.add(name);
    }

    return {
      'ImportDeclaration ImportSpecifier': collectImportedTypes,
      'ImportDeclaration ImportNamespaceSpecifier': collectImportedTypes,
      'ImportDeclaration ImportDefaultSpecifier': collectImportedTypes,

      Program: collectExportedTypes,

      'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]':
        visitExportedFunctionDeclaration,

      'ExportNamedDeclaration[declaration.type="TSDeclareFunction"]':
        visitExportedFunctionDeclaration,

      'ExportDefaultDeclaration[declaration.type="FunctionDeclaration"]':
        visitExportedFunctionDeclaration,

      'ExportDefaultDeclaration[declaration.type="ArrowFunctionExpression"]':
        visitExportedFunctionDeclaration,

      'ExportNamedDeclaration[declaration.type="VariableDeclaration"]':
        visitExportedVariableDeclaration,

      'ExportNamedDeclaration[declaration.type="TSTypeAliasDeclaration"]':
        visitExportedTypeAliasDeclaration,

      'ExportNamedDeclaration[declaration.type="TSTypeAliasDeclaration"] > ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"]':
        visitExportedTypeAliasDeclaration,

      'ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"]':
        visitExportedInterfaceDeclaration,

      'ExportNamedDeclaration[declaration.type="TSModuleDeclaration"] > ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"]':
        visitExportedInterfaceDeclaration,

      ExportDefaultDeclaration: visitExportDefaultDeclaration,
    };
  },
});

function getTypeName(typeName: TSESTree.EntityName): string {
  switch (typeName.type) {
    case AST_NODE_TYPES.Identifier:
      return typeName.name;

    case AST_NODE_TYPES.TSQualifiedName:
      // Namespaced types are not exported directly, so we check the
      // leftmost part of the name.
      return getTypeName(typeName.left);

    case AST_NODE_TYPES.ThisExpression:
      return 'this';
  }
}

function getTypeReferencesRecursively(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): Set<TSESTree.TSTypeReference> {
  const typeReferences = new Set<TSESTree.TSTypeReference>();
  const visited = new Set<TSESTree.Node>();

  collect(node);

  function collect(node: TSESTree.Node | null | undefined): void {
    if (!node || visited.has(node)) {
      return;
    }

    visited.add(node);

    switch (node.type) {
      case AST_NODE_TYPES.VariableDeclarator:
        collect(node.id);
        collect(node.init);
        break;

      case AST_NODE_TYPES.Identifier: {
        collect(node.typeAnnotation?.typeAnnotation);

        // Resolve the variable to its declaration (in cases where the variable is referenced)
        const scope = sourceCode.getScope(node);
        const variableNode = findVariable(scope, node.name);

        variableNode?.defs.forEach(def => {
          collect(def.name);
          collect(def.node);
        });
        break;
      }

      case AST_NODE_TYPES.ObjectExpression:
        node.properties.forEach(property => {
          const nodeToCheck =
            property.type === AST_NODE_TYPES.Property
              ? property.value
              : property.argument;

          collect(nodeToCheck);
        });
        break;

      case AST_NODE_TYPES.ArrayExpression:
        node.elements.forEach(element => {
          const nodeToCheck =
            element?.type === AST_NODE_TYPES.SpreadElement
              ? element.argument
              : element;

          collect(nodeToCheck);
        });
        break;

      case AST_NODE_TYPES.NewExpression:
      case AST_NODE_TYPES.CallExpression:
        collect(node.callee);
        node.arguments.forEach(arg => collect(arg));
        node.typeArguments?.params.forEach(param => collect(param));
        break;

      case AST_NODE_TYPES.BinaryExpression:
      case AST_NODE_TYPES.LogicalExpression:
        collect(node.left);
        collect(node.right);
        break;

      case AST_NODE_TYPES.ConditionalExpression:
        collect(node.consequent);
        collect(node.alternate);
        break;

      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.FunctionDeclaration:
      case AST_NODE_TYPES.FunctionExpression:
      case AST_NODE_TYPES.TSDeclareFunction:
        node.typeParameters?.params.forEach(param => collect(param.constraint));
        node.params.forEach(collect);
        collect(node.returnType?.typeAnnotation);

        if (node.body) {
          collectFunctionReturnStatements(node).forEach(collect);
        }
        break;

      case AST_NODE_TYPES.AssignmentPattern:
        collect(node.left);
        break;

      case AST_NODE_TYPES.RestElement:
        collect(node.argument);
        collect(node.typeAnnotation?.typeAnnotation);
        break;

      case AST_NODE_TYPES.ObjectPattern:
        node.properties.forEach(collect);
        collect(node.typeAnnotation?.typeAnnotation);
        break;

      case AST_NODE_TYPES.ArrayPattern:
        node.elements.forEach(collect);
        collect(node.typeAnnotation?.typeAnnotation);

        break;

      case AST_NODE_TYPES.ReturnStatement:
        collect(node.argument);
        break;

      case AST_NODE_TYPES.TSTypeReference: {
        const scope = sourceCode.getScope(node);
        const variable = findVariable(scope, getTypeName(node.typeName));

        const isBuiltinType = variable instanceof ImplicitLibVariable;

        const isGenericTypeArg =
          variable?.scope.type === ScopeType.function &&
          variable.identifiers.every(
            id => id.parent.type === AST_NODE_TYPES.TSTypeParameter,
          );

        if (!isBuiltinType && !isGenericTypeArg) {
          typeReferences.add(node);
        }

        node.typeArguments?.params.forEach(collect);
        break;
      }

      case AST_NODE_TYPES.TSArrayType:
        collect(node.elementType);
        break;

      case AST_NODE_TYPES.TSTupleType:
        node.elementTypes.forEach(collect);
        break;

      case AST_NODE_TYPES.TSUnionType:
      case AST_NODE_TYPES.TSIntersectionType:
        node.types.forEach(collect);
        break;

      case AST_NODE_TYPES.TSTypeLiteral:
        node.members.forEach(collect);
        break;

      case AST_NODE_TYPES.TSTemplateLiteralType:
        node.types.forEach(collect);
        break;

      case AST_NODE_TYPES.TSInterfaceBody:
        node.body.forEach(collect);
        break;

      case AST_NODE_TYPES.TSPropertySignature:
        collect(node.typeAnnotation?.typeAnnotation);
        break;

      case AST_NODE_TYPES.TSQualifiedName:
        collect(node.parent);
        break;

      case AST_NODE_TYPES.TSAsExpression:
        collect(node.expression);
        collect(node.typeAnnotation);
        break;

      case AST_NODE_TYPES.TSIndexedAccessType:
        collect(node.objectType);
        collect(node.indexType);
        break;

      default:
        break;
    }
  }

  return typeReferences;
}

function collectFunctionReturnStatements(
  functionNode:
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression,
): Set<TSESTree.Node> {
  const isArrowFunctionReturn =
    functionNode.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    functionNode.body.type !== AST_NODE_TYPES.BlockStatement;

  if (isArrowFunctionReturn) {
    return new Set([functionNode.body]);
  }

  const returnStatements = new Set<TSESTree.Node>();

  forEachReturnStatement(functionNode, returnNode =>
    returnStatements.add(returnNode),
  );

  return returnStatements;
}

// Heavily inspired by:
// https://github.com/typescript-eslint/typescript-eslint/blob/103de6eed/packages/eslint-plugin/src/util/astUtils.ts#L47-L80
export function forEachReturnStatement(
  functionNode:
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression,
  visitor: (returnNode: TSESTree.ReturnStatement) => void,
): void {
  return traverse(functionNode.body);

  function traverse(node: TSESTree.Node | null): void {
    switch (node?.type) {
      case AST_NODE_TYPES.ReturnStatement:
        return visitor(node);

      case AST_NODE_TYPES.SwitchStatement:
        return node.cases.forEach(traverse);

      case AST_NODE_TYPES.SwitchCase:
        return node.consequent.forEach(traverse);

      case AST_NODE_TYPES.BlockStatement:
        return node.body.forEach(traverse);

      case AST_NODE_TYPES.DoWhileStatement:
      case AST_NODE_TYPES.ForInStatement:
      case AST_NODE_TYPES.ForOfStatement:
      case AST_NODE_TYPES.WhileStatement:
      case AST_NODE_TYPES.ForStatement:
      case AST_NODE_TYPES.WithStatement:
      case AST_NODE_TYPES.CatchClause:
      case AST_NODE_TYPES.LabeledStatement:
        return traverse(node.body);

      case AST_NODE_TYPES.IfStatement:
        traverse(node.consequent);
        traverse(node.alternate);
        return;

      case AST_NODE_TYPES.TryStatement:
        traverse(node.block);
        traverse(node.handler);
        traverse(node.finalizer);
        return;
    }
  }
}
