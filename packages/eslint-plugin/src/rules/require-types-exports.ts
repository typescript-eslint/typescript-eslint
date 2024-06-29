import {
  DefinitionType,
  ImplicitLibVariable,
} from '@typescript-eslint/scope-manager';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

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
      const variable = getVariable(node.declaration.name, scope);

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

  function collect(node: TSESTree.Node): void {
    if (visited.has(node)) {
      return;
    }

    visited.add(node);

    switch (node.type) {
      case AST_NODE_TYPES.VariableDeclarator:
        collect(node.id);

        if (node.init) {
          collect(node.init);
        }
        break;

      case AST_NODE_TYPES.Identifier: {
        const typeAnnotation = node.typeAnnotation?.typeAnnotation;

        if (typeAnnotation) {
          collect(typeAnnotation);
        }

        // Resolve the variable to its declaration (in cases where the variable is referenced)
        const scope = sourceCode.getScope(node);
        const variableNode = getVariable(node.name, scope);

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
          if (!element) {
            return;
          }

          const nodeToCheck =
            element.type === AST_NODE_TYPES.SpreadElement
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

      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.FunctionDeclaration:
      case AST_NODE_TYPES.FunctionExpression:
      case AST_NODE_TYPES.TSDeclareFunction: {
        const scope = sourceCode.getScope(node);

        scope.through.forEach(ref => {
          const isSelfReference = ref.identifier.parent === node;

          const nodeToCheck = isSelfReference
            ? ref.identifier
            : ref.identifier.parent;

          collect(nodeToCheck);
        });

        break;
      }

      case AST_NODE_TYPES.ReturnStatement:
        if (node.argument) {
          collect(node.argument);
        }
        break;

      case AST_NODE_TYPES.TSTypeReference: {
        const scope = sourceCode.getScope(node);
        const variable = getVariable(getTypeName(node.typeName), scope);

        const isBuiltinType = variable instanceof ImplicitLibVariable;

        if (!isBuiltinType) {
          typeReferences.add(node);
        }

        node.typeArguments?.params.forEach(param => collect(param));
        break;
      }

      case AST_NODE_TYPES.TSArrayType:
        collect(node.elementType);
        break;

      case AST_NODE_TYPES.TSTupleType:
        node.elementTypes.forEach(element => collect(element));
        break;

      case AST_NODE_TYPES.TSUnionType:
      case AST_NODE_TYPES.TSIntersectionType:
        node.types.forEach(type => collect(type));
        break;

      case AST_NODE_TYPES.TSTypeLiteral:
        node.members.forEach(member => collect(member));
        break;

      case AST_NODE_TYPES.TSPropertySignature:
        if (node.typeAnnotation?.typeAnnotation) {
          collect(node.typeAnnotation.typeAnnotation);
        }

        break;

      case AST_NODE_TYPES.TSQualifiedName:
        collect(node.parent);
        break;

      case AST_NODE_TYPES.TSAsExpression:
        collect(node.expression);
        collect(node.typeAnnotation);
        break;

      default:
        break;
    }
  }

  return typeReferences;
}

function getVariable(
  name: string,
  initialScope: TSESLint.Scope.Scope | null,
): TSESLint.Scope.Variable | null {
  let variable: TSESLint.Scope.Variable | null = null;
  let scope: TSESLint.Scope.Scope | null = initialScope;

  while (scope) {
    variable = scope.set.get(name) ?? null;

    if (variable) {
      break;
    }

    scope = scope.upper;
  }

  return variable;
}
