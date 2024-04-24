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

export default createRule<[], MessageIds>({
  name: 'require-types-exports',
  meta: {
    type: 'suggestion',
    docs: {
      recommended: 'strict',
      requiresTypeChecking: true,
      description: 'Require exporting types that are used in exported entities',
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

    function collectImportedTypes(node: TSESTree.ImportSpecifier): void {
      externalizedTypes.add(node.local.name);
    }

    function collectExportedTypes(
      node: TSESTree.TSTypeAliasDeclaration | TSESTree.TSInterfaceDeclaration,
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
        if (
          def.type === DefinitionType.Variable &&
          (def.node.init?.type === AST_NODE_TYPES.ArrowFunctionExpression ||
            def.node.init?.type === AST_NODE_TYPES.FunctionExpression)
        ) {
          checkFunctionTypes(def.node.init);
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

    return {
      'ImportDeclaration ImportSpecifier, ImportSpecifier':
        collectImportedTypes,

      'ExportNamedDeclaration TSTypeAliasDeclaration, ExportNamedDeclaration TSInterfaceDeclaration':
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
