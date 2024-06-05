import type { Reference } from '@typescript-eslint/scope-manager';
import { DefinitionType } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getParserServices,
  isSymbolFromDefaultLibrary,
} from '../util';

type MessageIds = 'requireTypeExport';

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.TSDeclareFunction
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

type TypeReference = Reference & {
  isTypeReference: true;
  identifier: {
    parent: TSESTree.TSTypeReference;
  };
};

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

    const typeReferences = new Set<TypeReference>();
    const externalizedTypes = new Set<string>();
    const reportedTypes = new Set<string>();

    function collectTypeReferences(node: TSESTree.Program): void {
      const scope = context.sourceCode.getScope(node);

      scope.references.forEach(r => {
        if (
          r.resolved?.isTypeVariable &&
          r.identifier.type === AST_NODE_TYPES.Identifier &&
          r.identifier.parent.type === AST_NODE_TYPES.TSTypeReference &&
          r.isTypeReference
        ) {
          typeReferences.add(r as TypeReference);
        }
      });
    }

    function collectImportedTypes(node: TSESTree.ImportSpecifier): void {
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
      ) & {
        declaration: TSESTree.FunctionDeclaration | TSESTree.TSDeclareFunction;
      },
    ): void {
      checkFunctionTypes(node.declaration);
    }

    function visitExportedVariableDeclaration(
      node: TSESTree.ExportNamedDeclaration & {
        declaration: TSESTree.VariableDeclaration;
      },
    ): void {
      for (const declaration of node.declaration.declarations) {
        if (declaration.init?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
          checkFunctionTypes(declaration.init);
        } else {
          checkVariableTypes(declaration);
        }
      }
    }

    function visitDefaultExportedArrowFunction(
      node: TSESTree.ExportDefaultDeclaration & {
        declaration: TSESTree.ArrowFunctionExpression;
      },
    ): void {
      checkFunctionTypes(node.declaration);
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

        if (
          def.node.init.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          def.node.init.type === AST_NODE_TYPES.FunctionExpression
        ) {
          checkFunctionTypes(def.node.init);
        } else {
          checkVariableTypes(def.node);
        }
      }
    }

    function checkFunctionTypes(node: FunctionNode): void {
      const scope = context.sourceCode.getScope(node);

      scope.through.forEach(ref => {
        const typeRef = findClosestTypeReference(ref.identifier, node);

        if (typeRef) {
          checkTypeNode(typeRef);
        }
      });
    }

    function checkVariableTypes(
      node: TSESTree.LetOrConstOrVarDeclarator,
    ): void {
      typeReferences.forEach(r => {
        if (isAncestorNode(node, r.identifier.parent)) {
          checkTypeNode(r.identifier.parent);
        }
      });
    }

    function checkTypeNode(node: TSESTree.TSTypeReference): void {
      let name = getTypeName(node.typeName);

      // Using `this` type is allowed since it's necessarily exported
      // if it's used in an exported entity.
      if (name === 'this') {
        return;
      }

      // Namespaced types are not exported directly, so we check the
      // leftmost part of the name.
      if (Array.isArray(name)) {
        name = name[0];
      }

      const isExternalized = externalizedTypes.has(name);
      const isReported = reportedTypes.has(name);

      if (isExternalized || isReported) {
        return;
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const type = services.program.getTypeChecker().getTypeAtLocation(tsNode);

      if (isSymbolFromDefaultLibrary(services.program, type.getSymbol())) {
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
      Program: collectTypeReferences,

      'ImportDeclaration ImportSpecifier, ImportSpecifier':
        collectImportedTypes,

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

      'ExportNamedDeclaration[declaration.type="VariableDeclaration"]':
        visitExportedVariableDeclaration,

      'ExportDefaultDeclaration[declaration.type="FunctionDeclaration"]':
        visitExportedFunctionDeclaration,

      'ExportDefaultDeclaration[declaration.type="ArrowFunctionExpression"]':
        visitDefaultExportedArrowFunction,

      'ExportDefaultDeclaration[declaration.type="Identifier"]':
        visitDefaultExportedIdentifier,
    };
  },
});

function getTypeName(typeName: TSESTree.EntityName): string | string[] {
  switch (typeName.type) {
    case AST_NODE_TYPES.Identifier:
      return typeName.name;

    case AST_NODE_TYPES.TSQualifiedName:
      return [...(getTypeName(typeName.left) || []), typeName.right.name];

    case AST_NODE_TYPES.ThisExpression:
      return 'this';
  }
}

function findClosestTypeReference(
  startNode: TSESTree.Node,
  endNode: TSESTree.Node,
): TSESTree.TSTypeReference | null {
  let parent = startNode.parent;

  while (parent && parent !== endNode) {
    if (parent.type === AST_NODE_TYPES.TSTypeReference) {
      return parent;
    }

    parent = parent.parent;
  }

  return null;
}

function isAncestorNode(ancestor: TSESTree.Node, node: TSESTree.Node): boolean {
  let parent = node.parent;

  while (parent) {
    if (parent === ancestor) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
}
