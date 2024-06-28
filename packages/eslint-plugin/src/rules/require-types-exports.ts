import { DefinitionType } from '@typescript-eslint/scope-manager';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getParserServices,
  isSymbolFromDefaultLibrary,
} from '../util';

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
    const services = getParserServices(context);

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
      const variable = scope.set.get(node.declaration.name);

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

      // Using `this` type is allowed since it's necessarily exported
      // if it's used in an exported entity.
      if (name === 'this') {
        return;
      }

      const isExternalized = externalizedTypes.has(name);
      const isReported = reportedTypes.has(name);

      if (isExternalized || isReported) {
        return;
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const type = services.program.getTypeChecker().getTypeAtLocation(tsNode);
      const symbol = type.aliasSymbol ?? type.getSymbol();

      if (isSymbolFromDefaultLibrary(services.program, symbol)) {
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

  collect(node);

  function collect(node: TSESTree.Node): void {
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

        // If it's a reference to a variable inside an object, we need to get the declared variable.
        if (
          node.parent.type === AST_NODE_TYPES.Property ||
          node.parent.type === AST_NODE_TYPES.ArrayExpression
        ) {
          const variableNode = sourceCode.getScope(node).set.get(node.name);

          variableNode?.defs.forEach(def => {
            collect(def.name);
            collect(def.node);
          });
        }

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

      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.FunctionDeclaration:
      case AST_NODE_TYPES.FunctionExpression:
      case AST_NODE_TYPES.TSDeclareFunction: {
        const scope = sourceCode.getScope(node);

        scope.through.forEach(ref => {
          collect(ref.identifier.parent);
        });
        break;
      }

      case AST_NODE_TYPES.TSTypeReference:
        typeReferences.add(node);

        node.typeArguments?.params.forEach(param => collect(param));
        break;

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

      case AST_NODE_TYPES.TSAsExpression: {
        collect(node.expression);

        const isAsConstAnnotation =
          node.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
          node.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
          node.typeAnnotation.typeName.name === 'const';

        if (!isAsConstAnnotation) {
          collect(node.typeAnnotation);
        }

        break;
      }

      default:
        break;
    }
  }

  return typeReferences;
}
