/**
 * @fileoverview Warns when a namespace qualifier is unnecessary.
 * @author Benjamin Lichtman
 */
'use strict';

/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 * @typedef {import("estree").Node} ESTreeNode
 * @typedef {import("estree").Expression} Expression
 * @typedef {import("estree").MemberExpression} MemberExpression
 * @typedef {import("estree").Identifier} Identifier
 * @typedef {Identifier | QualifiedName} EntityName
 * @typedef {{ left: EntityName, right: Identifier } & ESTreeNode} QualifiedName
 */

const ts = require('typescript');
const tsutils = require('tsutils');
const utils = require('../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @type {RuleModule}
 */
module.exports = {
  meta: {
    docs: {
      description: 'Warns when a namespace qualifier is unnecessary.',
      category: 'TypeScript',
      recommended: false,
      extraDescription: [utils.tslintRule('no-unnecessary-qualifier')],
      url: utils.metaDocsUrl('no-unnecessary-qualifier')
    },
    fixable: 'code',
    messages: {
      unnecessaryQualifier:
        "Qualifier is unnecessary since '{{ name }}' is in scope."
    },
    schema: [],
    type: 'suggestion'
  },

  create(context) {
    // variables should be defined here
    /**
     * @type {(ts.ModuleDeclaration | ts.EnumDeclaration)[]}
     */
    const namespacesInScope = [];

    /**
     * Track failing namespace expression so nested qualifier errors are not reported
     * @type {ESTreeNode | null}
     */
    let currentFailedNamespaceExpression = null;

    const parserServices = utils.getParserServices(context);

    /**
     * @type {WeakMap<ESTreeNode, ts.Node>}
     */
    const esTreeNodeToTSNodeMap = parserServices.esTreeNodeToTSNodeMap;

    /**
     * @type {ts.Program}
     */
    const program = parserServices.program;
    const checker = program.getTypeChecker();

    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * @param {ts.Symbol} symbol the symbol being inspected
     * @param {ts.TypeChecker} checker The program's type checker
     * @returns {ts.Symbol | null} Returns the aliased symbol of symbol if it exists, or undefined otherwise
     */
    function tryGetAliasedSymbol(symbol, checker) {
      return tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
        ? checker.getAliasedSymbol(symbol)
        : null;
    }

    /**
     * @param {ts.Symbol} symbol The symbol being checked
     * @returns {boolean} True iff the symbol is a namespace that is in scope
     */
    function symbolIsNamespaceInScope(symbol) {
      const symbolDeclarations = symbol.getDeclarations();

      if (typeof symbolDeclarations === 'undefined') {
        return false;
      }
      if (
        symbolDeclarations.some(decl =>
          namespacesInScope.some(ns => ns === decl)
        )
      ) {
        return true;
      }

      const alias = tryGetAliasedSymbol(symbol, checker);

      return alias !== null && symbolIsNamespaceInScope(alias);
    }

    /**
     * @param {ts.Node} node The node whose in-scope symbols are to be searched
     * @param {ts.SymbolFlags} flags The symbol flags being inspected
     * @param {any} name The name of the symbol being searched for
     * @returns {ts.Symbol | undefined} The symbol in the scope of node with the provided name, or null if one does not exist
     */
    function getSymbolInScope(node, flags, name) {
      // TODO:PERF `getSymbolsInScope` gets a long list. Is there a better way?
      const scope = checker.getSymbolsInScope(node, flags);

      return scope.find(scopeSymbol => scopeSymbol.name === name);
    }

    /**
     * @param {ts.Symbol} accessed The symbol of the namespace that's accessed
     * @param {ts.Symbol} inScope The symbol in scope that has the same text as accessed
     * @returns {boolean} Returns true iff the symbols are equal
     */
    function symbolsAreEqual(accessed, inScope) {
      // Available starting in typescript@2.6
      if (typeof checker.getExportSymbolOfSymbol !== 'undefined') {
        return accessed === checker.getExportSymbolOfSymbol(inScope);
      }
      return (
        accessed === inScope ||
        // For compatibility with typescript@2.5: compare declarations because the symbols don't have the same reference
        utils.arraysAreEqual(
          accessed.declarations,
          inScope.declarations,
          (a, b) => a === b
        )
      );
    }

    /**
     * @param {ESTreeNode} qualifier The qualifier being checked
     * @param {Identifier} name The name being accessed from the qualifier
     * @returns {boolean} True iff the qualifier is unnecessary
     */
    function qualifierIsUnnecessary(qualifier, name) {
      const tsQualifier = esTreeNodeToTSNodeMap.get(qualifier);
      const tsName = esTreeNodeToTSNodeMap.get(name);

      if (!(tsQualifier && tsName)) return false; // TODO: throw error?

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
        sourceCode.getText(name)
      );

      return (
        typeof fromScope === 'undefined' ||
        symbolsAreEqual(accessedSymbol, fromScope)
      );
    }

    /**
     * @param {ESTreeNode} node The namespace access node
     * @param {ESTreeNode} qualifier The qualifier of the namespace access
     * @param {Identifier} name The name being accessed in the namespace
     * @returns {void}
     */
    function visitNamespaceAccess(node, qualifier, name) {
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
            name: sourceCode.getText(name)
          },
          fix(fixer) {
            return fixer.removeRange([qualifier.range[0], name.range[0]]);
          }
        });
      }
    }

    /**
     * @param {ESTreeNode} node The TSModuleDeclaration or TSEnumDeclaration being visited
     * @returns {void}
     */
    function enterDeclaration(node) {
      const tsDeclaration = esTreeNodeToTSNodeMap.get(node);
      if (tsDeclaration) {
        namespacesInScope.push(tsDeclaration);
      }
    }

    /**
     * @returns {void}
     */
    function exitDeclaration(node) {
      if (esTreeNodeToTSNodeMap.has(node)) {
        namespacesInScope.pop();
      }
    }

    /**
     * @param {ESTreeNode} node The current node being exited
     * @returns {void}
     */
    function resetCurrentNamespaceExpression(node) {
      if (node === currentFailedNamespaceExpression) {
        currentFailedNamespaceExpression = null;
      }
    }

    /**
     * @param {ESTreeNode} node An ESTree AST node
     * @returns {boolean} Returns true if node is a PropertyAccessExpression
     */
    function isPropertyAccessExpression(node) {
      return node.type === 'MemberExpression' && !node.computed;
    }

    /**
     * @param {ESTreeNode} node An ESTree AST node
     * @returns {boolean} Returns true if node is an EntityNameExpression
     */
    function isEntityNameExpression(node) {
      return (
        node.type === 'Identifier' ||
        (isPropertyAccessExpression(node) &&
          isEntityNameExpression(node.object))
      );
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      TSModuleDeclaration: enterDeclaration,
      TSEnumDeclaration: enterDeclaration,
      'ExportNamedDeclaration[declaration.type="TSModuleDeclaration"]': enterDeclaration,
      'ExportNamedDeclaration[declaration.type="TSEnumDeclaration"]': enterDeclaration,
      'TSModuleDeclaration:exit': exitDeclaration,
      'TSEnumDeclaration:exit': exitDeclaration,
      'ExportNamedDeclaration[declaration.type="TSModuleDeclaration"]:exit': exitDeclaration,
      'ExportNamedDeclaration[declaration.type="TSEnumDeclaration"]:exit': exitDeclaration,
      /**
       * @param {QualifiedName} node The node being inspected
       * @returns {void}
       */
      TSQualifiedName(node) {
        visitNamespaceAccess(node, node.left, node.right);
      },
      /**
       * @param {MemberExpression} node The node being inspected
       * @returns {void}
       */
      MemberExpression(node) {
        if (node.computed) return;
        const property = /** @type {Identifier} */ (node.property);

        if (isEntityNameExpression(node.object)) {
          visitNamespaceAccess(node, node.object, property);
        }
      },
      'TSQualifiedName:exit': resetCurrentNamespaceExpression,
      'MemberExpression:exit': resetCurrentNamespaceExpression
    };
  }
};
