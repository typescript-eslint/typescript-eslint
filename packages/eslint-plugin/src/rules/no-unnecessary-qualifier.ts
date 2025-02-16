import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

export default createRule({
  name: 'no-unnecessary-qualifier',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unnecessary namespace qualifiers',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      unnecessaryQualifier:
        "Qualifier is unnecessary since '{{ name }}' is in scope.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const namespacesInScope: ts.Node[] = [];
    let currentFailedNamespaceExpression: TSESTree.Node | null = null;
    const services = getParserServices(context);
    const esTreeNodeToTSNodeMap = services.esTreeNodeToTSNodeMap;
    const checker = services.program.getTypeChecker();

    function tryGetAliasedSymbol(
      symbol: ts.Symbol,
      checker: ts.TypeChecker,
    ): ts.Symbol | null {
      return tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
        ? checker.getAliasedSymbol(symbol)
        : null;
    }

    function symbolIsNamespaceInScope(symbol: ts.Symbol): boolean {
      const symbolDeclarations = symbol.getDeclarations() ?? [];

      if (
        symbolDeclarations.some(decl =>
          namespacesInScope.some(ns => ns === decl),
        )
      ) {
        return true;
      }

      const alias = tryGetAliasedSymbol(symbol, checker);

      return alias != null && symbolIsNamespaceInScope(alias);
    }

    function getSymbolInScope(
      node: ts.Node,
      flags: ts.SymbolFlags,
      name: string,
    ): ts.Symbol | undefined {
      const scope = checker.getSymbolsInScope(node, flags);

      return scope.find(scopeSymbol => scopeSymbol.name === name);
    }

    function symbolsAreEqual(accessed: ts.Symbol, inScope: ts.Symbol): boolean {
      return accessed === checker.getExportSymbolOfSymbol(inScope);
    }

    function qualifierIsUnnecessary(
      qualifier: TSESTree.EntityName | TSESTree.MemberExpression,
      name: TSESTree.Identifier,
    ): boolean {
      const namespaceSymbol = services.getSymbolAtLocation(qualifier);

      if (
        namespaceSymbol == null ||
        !symbolIsNamespaceInScope(namespaceSymbol)
      ) {
        return false;
      }

      const accessedSymbol = services.getSymbolAtLocation(name);

      if (accessedSymbol == null) {
        return false;
      }

      // If the symbol in scope is different, the qualifier is necessary.
      const tsQualifier = esTreeNodeToTSNodeMap.get(qualifier);
      const fromScope = getSymbolInScope(
        tsQualifier,
        accessedSymbol.flags,
        context.sourceCode.getText(name),
      );

      return !!fromScope && symbolsAreEqual(accessedSymbol, fromScope);
    }

    function visitNamespaceAccess(
      node: TSESTree.Node,
      qualifier: TSESTree.EntityName | TSESTree.MemberExpression,
      name: TSESTree.Identifier,
    ): void {
      // Only look for nested qualifier errors if we didn't already fail on the outer qualifier.
      if (
        !currentFailedNamespaceExpression &&
        qualifierIsUnnecessary(qualifier, name)
      ) {
        currentFailedNamespaceExpression = node;
        context.report({
          node: qualifier,
          messageId: 'unnecessaryQualifier',
          data: {
            name: context.sourceCode.getText(name),
          },
          fix(fixer) {
            return fixer.removeRange([qualifier.range[0], name.range[0]]);
          },
        });
      }
    }

    function enterDeclaration(
      node:
        | TSESTree.ExportNamedDeclaration
        | TSESTree.TSEnumDeclaration
        | TSESTree.TSModuleDeclaration,
    ): void {
      namespacesInScope.push(esTreeNodeToTSNodeMap.get(node));
    }

    function exitDeclaration(): void {
      namespacesInScope.pop();
    }

    function resetCurrentNamespaceExpression(node: TSESTree.Node): void {
      if (node === currentFailedNamespaceExpression) {
        currentFailedNamespaceExpression = null;
      }
    }

    function isPropertyAccessExpression(
      node: TSESTree.Node,
    ): node is TSESTree.MemberExpression {
      return node.type === AST_NODE_TYPES.MemberExpression && !node.computed;
    }

    function isEntityNameExpression(
      node: TSESTree.Node,
    ): node is TSESTree.Identifier | TSESTree.MemberExpression {
      return (
        node.type === AST_NODE_TYPES.Identifier ||
        (isPropertyAccessExpression(node) &&
          isEntityNameExpression(node.object))
      );
    }

    return {
      'ExportNamedDeclaration[declaration.type="TSEnumDeclaration"]':
        enterDeclaration,
      'ExportNamedDeclaration[declaration.type="TSEnumDeclaration"]:exit':
        exitDeclaration,
      'ExportNamedDeclaration[declaration.type="TSModuleDeclaration"]':
        enterDeclaration,
      'ExportNamedDeclaration[declaration.type="TSModuleDeclaration"]:exit':
        exitDeclaration,
      'MemberExpression:exit': resetCurrentNamespaceExpression,
      'MemberExpression[computed=false]'(
        node: TSESTree.MemberExpression,
      ): void {
        const property = node.property as TSESTree.Identifier;
        if (isEntityNameExpression(node.object)) {
          visitNamespaceAccess(node, node.object, property);
        }
      },
      TSEnumDeclaration: enterDeclaration,
      'TSEnumDeclaration:exit': exitDeclaration,
      'TSModuleDeclaration:exit': exitDeclaration,
      'TSModuleDeclaration > TSModuleBlock'(
        node: TSESTree.TSModuleBlock,
      ): void {
        enterDeclaration(node.parent);
      },
      TSQualifiedName(node: TSESTree.TSQualifiedName): void {
        visitNamespaceAccess(node, node.left, node.right);
      },
      'TSQualifiedName:exit': resetCurrentNamespaceExpression,
    };
  },
});
