import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

type IdentifierLike = TSESTree.Identifier | TSESTree.JSXIdentifier;

const functionLikeSymbolKinds = new Set<ts.SyntaxKind | undefined>([
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.MethodSignature,
]);

const importNodeTypes = new Set([
  AST_NODE_TYPES.ImportDeclaration,
  AST_NODE_TYPES.ImportExpression,
]);

const parentDeclarationNodeTypes = new Set([
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.FunctionDeclaration,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.MethodDefinition,
  AST_NODE_TYPES.TSDeclareFunction,
  AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
  AST_NODE_TYPES.TSEnumDeclaration,
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSMethodSignature,
  AST_NODE_TYPES.TSModuleDeclaration,
  AST_NODE_TYPES.TSParameterProperty,
  AST_NODE_TYPES.TSPropertySignature,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
  AST_NODE_TYPES.TSTypeParameter,
]);

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

        default:
          return parentDeclarationNodeTypes.has(parent.type);
      }
    }

    function isInsideImport(node: TSESTree.Node): boolean {
      return context.sourceCode
        .getAncestors(node)
        .some(ancestor => importNodeTypes.has(ancestor.type));
    }

    function isFunctionLikeSymbol(symbol: ts.Symbol): boolean {
      return functionLikeSymbolKinds.has(symbol.getDeclarations()?.at(0)?.kind);
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

    function isCallLike(node: TSESTree.Node): boolean {
      const [callee, parent] =
        node.parent?.type === AST_NODE_TYPES.MemberExpression &&
        node.parent.property === node
          ? [node.parent, node.parent.parent]
          : [node, node.parent];

      switch (parent?.type) {
        case AST_NODE_TYPES.NewExpression:
        case AST_NODE_TYPES.CallExpression:
          return parent.callee === callee;

        case AST_NODE_TYPES.TaggedTemplateExpression:
          return parent.tag === callee;

        case AST_NODE_TYPES.JSXOpeningElement:
          return parent.name === callee;

        default:
          return false;
      }
    }

    function getCallExpressionDeprecation(
      node: IdentifierLike,
    ): string | undefined {
      const symbol = services.getSymbolAtLocation(node);
      if (!symbol || !isFunctionLikeSymbol(symbol)) {
        return undefined;
      }

      return getJsDocDeprecation(symbol);
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

      // Identifier CallExpression
      if (
        node.parent.type === AST_NODE_TYPES.CallExpression &&
        node === node.parent.callee
      ) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node.parent);
        const signature = checker.getResolvedSignature(tsNode);
        if (signature) {
          return signature;
        }
      }

      return services.getSymbolAtLocation(node);
    }

    function getDeprecationReason(node: IdentifierLike): string | undefined {
      return isCallLike(node.parent)
        ? getCallExpressionDeprecation(node)
        : getJsDocDeprecation(getSymbol(node));
    }

    function checkIdentifier(node: IdentifierLike): void {
      if (isDeclaration(node) || isInsideImport(node)) {
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
