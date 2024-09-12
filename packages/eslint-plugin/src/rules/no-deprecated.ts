import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

type IdentifierLike = TSESTree.Identifier | TSESTree.JSXIdentifier;

export default createRule({
  name: 'no-deprecated',
  meta: {
    docs: {
      description: 'Disallow using code marked as `@deprecated`',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      deprecated: `\`{{name}}\` is deprecated.`,
      deprecatedWithReason: `\`{{name}}\` is deprecated. {{reason}}`,
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    const { jsDocParsingMode } = context.parserOptions;
    if (jsDocParsingMode === 'none' || jsDocParsingMode === 'type-info') {
      throw new Error(
        `Cannot be used with jsDocParsingMode: '${jsDocParsingMode}'.`,
      );
    }

    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isDeclaration(node: IdentifierLike): boolean {
      const { parent } = node;

      switch (parent.type) {
        case AST_NODE_TYPES.ArrayPattern:
          return parent.elements.includes(node as TSESTree.Identifier);

        case AST_NODE_TYPES.ClassExpression:
        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.VariableDeclarator:
        case AST_NODE_TYPES.TSEnumMember:
          return parent.id === node;

        case AST_NODE_TYPES.MethodDefinition:
        case AST_NODE_TYPES.PropertyDefinition:
          return parent.key === node;

        case AST_NODE_TYPES.Property:
          return (
            (parent.shorthand && parent.value === node) ||
            parent.parent.type === AST_NODE_TYPES.ObjectExpression
          );

        case AST_NODE_TYPES.AssignmentPattern:
          return (
            parent.left === node &&
            !(
              parent.parent.type === AST_NODE_TYPES.Property &&
              parent.parent.shorthand
            )
          );

        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionDeclaration:
        case AST_NODE_TYPES.FunctionExpression:
        case AST_NODE_TYPES.TSDeclareFunction:
        case AST_NODE_TYPES.TSEmptyBodyFunctionExpression:
        case AST_NODE_TYPES.TSEnumDeclaration:
        case AST_NODE_TYPES.TSInterfaceDeclaration:
        case AST_NODE_TYPES.TSMethodSignature:
        case AST_NODE_TYPES.TSModuleDeclaration:
        case AST_NODE_TYPES.TSParameterProperty:
        case AST_NODE_TYPES.TSPropertySignature:
        case AST_NODE_TYPES.TSTypeAliasDeclaration:
        case AST_NODE_TYPES.TSTypeParameter:
          return true;

        default:
          return false;
      }
    }

    function isInsideExportOrImport(node: TSESTree.Node): boolean {
      let current = node;

      while (true) {
        switch (current.type) {
          case AST_NODE_TYPES.ExportAllDeclaration:
          case AST_NODE_TYPES.ExportDefaultDeclaration:
          case AST_NODE_TYPES.ExportNamedDeclaration:
          case AST_NODE_TYPES.ImportDeclaration:
          case AST_NODE_TYPES.ImportExpression:
            return true;

          case AST_NODE_TYPES.ArrowFunctionExpression:
          case AST_NODE_TYPES.BlockStatement:
          case AST_NODE_TYPES.ClassBody:
          case AST_NODE_TYPES.TSInterfaceDeclaration:
          case AST_NODE_TYPES.FunctionDeclaration:
          case AST_NODE_TYPES.FunctionExpression:
          case AST_NODE_TYPES.Program:
          case AST_NODE_TYPES.TSUnionType:
          case AST_NODE_TYPES.VariableDeclarator:
            return false;

          default:
            current = current.parent;
        }
      }
    }

    function getJsDocDeprecation(
      symbol: ts.Signature | ts.Symbol | undefined,
    ): string | undefined {
      const tag = symbol
        ?.getJsDocTags(checker)
        .find(tag => tag.name === 'deprecated');

      if (!tag) {
        return undefined;
      }

      const displayParts = tag.text;

      return displayParts ? ts.displayPartsToString(displayParts) : '';
    }

    type CallLikeNode =
      | TSESTree.CallExpression
      | TSESTree.JSXOpeningElement
      | TSESTree.NewExpression
      | TSESTree.TaggedTemplateExpression;

    function isNodeCalleeOfParent(node: TSESTree.Node): node is CallLikeNode {
      switch (node.parent?.type) {
        case AST_NODE_TYPES.NewExpression:
        case AST_NODE_TYPES.CallExpression:
          return node.parent.callee === node;

        case AST_NODE_TYPES.TaggedTemplateExpression:
          return node.parent.tag === node;

        case AST_NODE_TYPES.JSXOpeningElement:
          return node.parent.name === node;

        default:
          return false;
      }
    }

    function getCallLikeNode(node: TSESTree.Node): CallLikeNode | undefined {
      let callee = node;

      while (
        callee.parent?.type === AST_NODE_TYPES.MemberExpression &&
        callee.parent.property === callee
      ) {
        callee = callee.parent;
      }

      return isNodeCalleeOfParent(callee) ? callee : undefined;
    }

    function getCallLikeDeprecation(node: CallLikeNode): string | undefined {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node.parent);

      // If the node is a direct function call, we look for its signature.
      const signature = checker.getResolvedSignature(
        tsNode as ts.CallLikeExpression,
      );
      const symbol = services.getSymbolAtLocation(node);
      if (signature) {
        const signatureDeprecation = getJsDocDeprecation(signature);
        if (signatureDeprecation !== undefined) {
          return signatureDeprecation;
        }

        // Properties with function-like types have "deprecated" jsdoc
        // on their symbols, not on their signatures:
        //
        // interface Props {
        //   /** @deprecated */
        //   property: () => 'foo'
        //   ^symbol^  ^signature^
        // }
        const symbolDeclarationKind = symbol?.declarations?.[0].kind;
        if (
          symbolDeclarationKind !== ts.SyntaxKind.MethodDeclaration &&
          symbolDeclarationKind !== ts.SyntaxKind.FunctionDeclaration &&
          symbolDeclarationKind !== ts.SyntaxKind.MethodSignature
        ) {
          return getJsDocDeprecation(symbol);
        }
      }

      // Or it could be a ClassDeclaration or a variable set to a ClassExpression.
      const symbolAtLocation =
        symbol && checker.getTypeOfSymbolAtLocation(symbol, tsNode).getSymbol();

      return symbolAtLocation &&
        tsutils.isSymbolFlagSet(symbolAtLocation, ts.SymbolFlags.Class)
        ? getJsDocDeprecation(symbolAtLocation)
        : undefined;
    }

    function getSymbol(
      node: IdentifierLike,
    ): ts.Signature | ts.Symbol | undefined {
      if (
        node.parent.type === AST_NODE_TYPES.AssignmentPattern ||
        node.parent.type === AST_NODE_TYPES.Property
      ) {
        return services
          .getTypeAtLocation(node.parent.parent)
          .getProperty(node.name);
      }

      return services.getSymbolAtLocation(node);
    }

    function getDeprecationReason(node: IdentifierLike): string | undefined {
      const callLikeNode = getCallLikeNode(node);
      return callLikeNode
        ? getCallLikeDeprecation(callLikeNode)
        : getJsDocDeprecation(getSymbol(node));
    }

    function checkIdentifier(node: IdentifierLike): void {
      if (isDeclaration(node) || isInsideExportOrImport(node)) {
        return;
      }

      const reason = getDeprecationReason(node);
      if (reason === undefined) {
        return;
      }

      context.report({
        ...(reason
          ? {
              data: { name: node.name, reason },
              messageId: 'deprecatedWithReason',
            }
          : {
              data: { name: node.name },
              messageId: 'deprecated',
            }),
        node,
      });
    }

    return {
      Identifier: checkIdentifier,
      JSXIdentifier(node): void {
        if (node.parent.type !== AST_NODE_TYPES.JSXClosingElement) {
          checkIdentifier(node);
        }
      },
    };
  },
});
