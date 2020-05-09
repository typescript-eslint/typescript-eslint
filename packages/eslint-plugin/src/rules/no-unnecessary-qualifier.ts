import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';
import * as util from '../util';

export default util.createRule({
  name: 'no-unnecessary-qualifier',
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Warns when a namespace qualifier is unnecessary',
      recommended: false,
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      unnecessaryQualifier:
        "Qualifier is unnecessary since '{{ name }}' is in scope.",
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const namespacesInScope: ts.Node[] = [];
    let currentFailedNamespaceExpression: TSESTree.Node | null = null;
    const parserServices = util.getParserServices(context);
    const esTreeNodeToTSNodeMap = parserServices.esTreeNodeToTSNodeMap;
    const program = parserServices.program;
    const checker = program.getTypeChecker();
    const sourceCode = context.getSourceCode();

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

      return alias !== null && symbolIsNamespaceInScope(alias);
    }

    function getSymbolInScope(
      node: ts.Node,
      flags: ts.SymbolFlags,
      name: string,
    ): ts.Symbol | undefined {
      // TODO:PERF `getSymbolsInScope` gets a long list. Is there a better way?
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
      const tsQualifier = esTreeNodeToTSNodeMap.get(qualifier);
      const tsName = esTreeNodeToTSNodeMap.get(name);

      const namespaceSymbol = checker.getSymbolAtLocation(tsQualifier);

      if (
        typeof namespaceSymbol === 'undefined' ||
        !symbolIsNamespaceInScope(namespaceSymbol)
      ) {
        return false;
      }

      const accessedSymbol = checker.getSymbolAtLocation(tsName);

      if (typeof accessedSymbol === 'undefined') {
        return false;
      }

      // If the symbol in scope is different, the qualifier is necessary.
      const fromScope = getSymbolInScope(
        tsQualifier,
        accessedSymbol.flags,
        sourceCode.getText(name),
      );

      return (
        typeof fromScope === 'undefined' ||
        symbolsAreEqual(accessedSymbol, fromScope)
      );
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
            name: sourceCode.getText(name),
          },
          fix(fixer) {
            return fixer.removeRange([qualifier.range[0], name.range[0]]);
          },
        });
      }
    }

    function enterDeclaration(
      node:
        | TSESTree.TSModuleDeclaration
        | TSESTree.TSEnumDeclaration
        | TSESTree.ExportNamedDeclaration,
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
      TSModuleDeclaration: enterDeclaration,
      TSEnumDeclaration: enterDeclaration,
      'ExportNamedDeclaration[declaration.type="TSModuleDeclaration"]': enterDeclaration,
      'ExportNamedDeclaration[declaration.type="TSEnumDeclaration"]': enterDeclaration,
      'TSModuleDeclaration:exit': exitDeclaration,
      'TSEnumDeclaration:exit': exitDeclaration,
      'ExportNamedDeclaration[declaration.type="TSModuleDeclaration"]:exit': exitDeclaration,
      'ExportNamedDeclaration[declaration.type="TSEnumDeclaration"]:exit': exitDeclaration,
      TSQualifiedName(node: TSESTree.TSQualifiedName): void {
        visitNamespaceAccess(node, node.left, node.right);
      },
      'MemberExpression[computed=false]': function (
        node: TSESTree.MemberExpression,
      ): void {
        const property = node.property as TSESTree.Identifier;
        if (isEntityNameExpression(node.object)) {
          visitNamespaceAccess(node, node.object, property);
        }
      },
      'TSQualifiedName:exit': resetCurrentNamespaceExpression,
      'MemberExpression:exit': resetCurrentNamespaceExpression,
    };
  },
});
