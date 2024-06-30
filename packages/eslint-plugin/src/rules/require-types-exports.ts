import {
  DefinitionType,
  ImplicitLibVariable,
  ScopeType,
} from '@typescript-eslint/scope-manager';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, simpleTraverse } from '@typescript-eslint/utils';

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

    function collectExportedTypes(
      node:
        | TSESTree.TSTypeAliasDeclaration
        | TSESTree.TSInterfaceDeclaration
        | TSESTree.TSEnumDeclaration,
    ): void {
      externalizedTypes.add(node.id.name);
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

    function visitDefaultExportedIdentifier(
      node: TSESTree.DefaultExportDeclarations & {
        declaration: TSESTree.Identifier;
      },
    ): void {
      const scope = context.sourceCode.getScope(node);
      const variable = findVariable(scope, node.declaration.name);

      if (!variable) {
        return;
      }

      for (const def of variable.defs) {
        if (def.type !== DefinitionType.Variable || !def.node.init) {
          continue;
        }

        checkNodeTypes(def.node);
      }
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

      'Program > ExportNamedDeclaration > TSTypeAliasDeclaration':
        collectExportedTypes,
      'Program > ExportNamedDeclaration > TSInterfaceDeclaration':
        collectExportedTypes,
      'Program > ExportNamedDeclaration > TSEnumDeclaration':
        collectExportedTypes,
      'Program > ExportNamedDeclaration > TSModuleDeclaration':
        collectExportedTypes,

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

      'ExportDefaultDeclaration[declaration.type="Identifier"]':
        visitDefaultExportedIdentifier,
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
        collectFunctionReturnStatements(node).forEach(collect);
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
  functionNode: TSESTree.Node,
): Set<TSESTree.Node> {
  const isArrowFunctionReturn =
    functionNode.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    functionNode.body.type === AST_NODE_TYPES.Identifier;

  if (isArrowFunctionReturn) {
    return new Set([functionNode.body]);
  }

  const returnStatements = new Set<TSESTree.Node>();

  simpleTraverse(functionNode, {
    visitors: {
      ReturnStatement: (node: TSESTree.Node) => {
        if (getParentFunction(node) === functionNode) {
          returnStatements.add(node);
        }
      },
    },
  });

  return returnStatements;
}

function getParentFunction(node: TSESTree.Node): TSESTree.Node | null {
  let parent: TSESTree.Node | undefined = node.parent;

  const functionTypes = new Set([
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.FunctionDeclaration,
    AST_NODE_TYPES.FunctionExpression,
    AST_NODE_TYPES.TSDeclareFunction,
  ]);

  while (parent && !functionTypes.has(parent.type)) {
    parent = parent.parent;
  }

  return parent ?? null;
}
