import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
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

    function isInsideImport(node: TSESTree.Node): boolean {
      return context.sourceCode
        .getAncestors(node)
        .some(ancestor =>
          [
            AST_NODE_TYPES.ImportDeclaration,
            AST_NODE_TYPES.ImportExpression,
          ].includes(ancestor.type),
        );
    }

    const classLikeSymbolKinds = new Set<ts.SyntaxKind | undefined>([
      ts.SyntaxKind.ClassDeclaration,
      ts.SyntaxKind.ClassExpression,
    ]);

    function isClassLikeSymbol(symbol: ts.Symbol): boolean {
      return !!symbol
        .getDeclarations()
        ?.some(symbol => classLikeSymbolKinds.has(symbol.kind));
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
      const signature = checker.getResolvedSignature(
        tsNode as ts.CallLikeExpression,
      );

      if (signature) {
        const signatureDeprecation = getJsDocDeprecation(signature);
        if (signatureDeprecation !== undefined) {
          return signatureDeprecation;
        }
      }

      const symbol = services.getSymbolAtLocation(node);
      return symbol && isClassLikeSymbol(symbol)
        ? getJsDocDeprecation(symbol)
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
