import type { Reference } from '@typescript-eslint/scope-manager';
import { DefinitionType } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

type MessageIds = 'requireTypeExport';

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.TSDeclareFunction
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

type TypeReference = Reference & {
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
    const typeReferences = new Set<TypeReference>();
    const externalizedTypes = new Set<string>();
    const reportedTypes = new Set<string>();

    function collectTypeReferences(node: TSESTree.Program): void {
      const scope = context.sourceCode.getScope(node);

      scope.references.forEach(r => {
        if (
          r.resolved?.isTypeVariable &&
          r.identifier.parent.type === AST_NODE_TYPES.TSTypeReference
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

      scope.through
        .map(ref => ref.identifier.parent)
        .filter(
          (node): node is TSESTree.TSTypeReference =>
            node.type === AST_NODE_TYPES.TSTypeReference,
        )
        .forEach(checkTypeNode);
    }

    function checkVariableTypes(
      node: TSESTree.LetOrConstOrVarDeclarator,
    ): void {
      typeReferences.forEach(r => {
        // TODO: Probably not the best way to do it...
        if (isLocationOverlapping(r.identifier.loc, node.loc)) {
          checkTypeNode(r.identifier.parent);
        }
      });
    }

    function checkTypeNode(node: TSESTree.TSTypeReference): void {
      const name = getTypeName(node);

      if (!name) {
        // TODO: Report the whole function? Is this case even possible?
        return;
      }

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

    function getTypeName(typeReference: TSESTree.TSTypeReference): string {
      if (typeReference.typeName.type === AST_NODE_TYPES.Identifier) {
        return typeReference.typeName.name;
      }

      return '';
    }

    function isLocationOverlapping(
      location: TSESTree.Node['loc'],
      container: TSESTree.Node['loc'],
    ): boolean {
      if (
        location.start.line < container.start.line ||
        location.end.line > container.end.line
      ) {
        return false;
      }

      if (
        location.start.line === container.start.line &&
        location.start.column < container.start.column
      ) {
        return false;
      }

      if (
        location.end.line === container.end.line &&
        location.end.column > container.end.column
      ) {
        return false;
      }

      return true;
    }

    return {
      Program: collectTypeReferences,

      'ImportDeclaration ImportSpecifier, ImportSpecifier':
        collectImportedTypes,

      'ExportNamedDeclaration TSTypeAliasDeclaration, ExportNamedDeclaration TSInterfaceDeclaration, ExportNamedDeclaration TSEnumDeclaration':
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
