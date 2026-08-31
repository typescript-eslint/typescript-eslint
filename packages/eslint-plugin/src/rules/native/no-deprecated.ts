import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type {
  Signature,
  Symbol as NativeSymbol,
} from '@typescript/native/unstable/sync';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  getJSDocTags,
  getTextOfJSDocComment,
  SyntaxKind,
} from '@typescript/native/unstable/ast';
import { SymbolFlags } from '@typescript/native/unstable/sync';

import type { MessageIds, Options } from '../no-deprecated';

import { getNativeParserServices } from '../../util';

type IdentifierLike =
  | TSESTree.Identifier
  | TSESTree.JSXIdentifier
  | TSESTree.PrivateIdentifier
  | TSESTree.Super;

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
    case AST_NODE_TYPES.AccessorProperty:
      return parent.key === node;
    case AST_NODE_TYPES.Property:
      return parent.value === node
        ? parent.parent.type === AST_NODE_TYPES.ObjectPattern
        : parent.parent.type === AST_NODE_TYPES.ObjectExpression &&
            !parent.shorthand;
    case AST_NODE_TYPES.AssignmentPattern:
      return parent.left === node;
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
    case AST_NODE_TYPES.TSImportEqualsDeclaration:
      return parent.id === node;
    default:
      return false;
  }
}

function isInsideImport(node: TSESTree.Node): boolean {
  let current = node;
  while (true) {
    switch (current.type) {
      case AST_NODE_TYPES.ImportDeclaration:
        return true;
      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.ExportAllDeclaration:
      case AST_NODE_TYPES.ExportNamedDeclaration:
      case AST_NODE_TYPES.BlockStatement:
      case AST_NODE_TYPES.ClassDeclaration:
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

function getReportedNodeName(node: IdentifierLike): string {
  if (node.type === AST_NODE_TYPES.Super) {
    return 'super';
  }
  return node.type === AST_NODE_TYPES.PrivateIdentifier
    ? `#${node.name}`
    : node.name;
}

export function create(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): TSESLint.RuleListener {
  const services = getNativeParserServices(context);
  const { checker, project } = services.native;

  const getDeclarationDeprecation = (
    declaration: ReturnType<NativeSymbol['declarations'][number]['resolve']>,
  ): string | undefined => {
    const tag = declaration
      ? getJSDocTags(declaration).find(
          tag => tag.kind === SyntaxKind.JSDocDeprecatedTag,
        )
      : undefined;
    return tag ? (getTextOfJSDocComment(tag.comment) ?? '') : undefined;
  };

  const getSymbolDeprecation = (
    symbol: NativeSymbol | undefined,
  ): string | undefined => {
    const tag = symbol
      ?.getJsDocTags(checker)
      .find(tag => tag.name === 'deprecated');
    return (
      tag?.text ??
      (tag ? '' : undefined) ??
      symbol?.declarations
        .map(declaration =>
          getDeclarationDeprecation(declaration.resolve(project)),
        )
        .find(reason => reason != null)
    );
  };

  const getSignatureDeprecation = (
    signature: Signature | undefined,
  ): string | undefined => {
    return getDeclarationDeprecation(signature?.declaration?.resolve(project));
  };

  function searchForDeprecationInAliasesChain(
    initialSymbol: NativeSymbol | undefined,
    checkDeprecationsOfAliasedSymbol: boolean,
  ): string | undefined {
    if (!initialSymbol || !(initialSymbol.flags & SymbolFlags.Alias)) {
      return checkDeprecationsOfAliasedSymbol
        ? getSymbolDeprecation(initialSymbol)
        : undefined;
    }

    const targetSymbol = checker.getAliasedSymbol(initialSymbol);
    const visited = new Set<number>();
    let symbol: NativeSymbol | undefined = initialSymbol;
    while (
      symbol &&
      symbol.flags & SymbolFlags.Alias &&
      !visited.has(symbol.id)
    ) {
      visited.add(symbol.id);
      const reason = getSymbolDeprecation(symbol);
      if (reason != null) {
        return reason;
      }
      symbol = checker.getImmediateAliasedSymbol(symbol);
      if (checkDeprecationsOfAliasedSymbol && symbol?.id === targetSymbol.id) {
        return getSymbolDeprecation(symbol);
      }
    }
    return undefined;
  }

  function getCallLikeNode(node: TSESTree.Node): TSESTree.Node | undefined {
    let callee = node;
    while (
      callee.parent?.type === AST_NODE_TYPES.MemberExpression &&
      callee.parent.property === callee
    ) {
      callee = callee.parent;
    }
    switch (callee.parent?.type) {
      case AST_NODE_TYPES.NewExpression:
      case AST_NODE_TYPES.CallExpression:
        return callee.parent.callee === callee ? callee : undefined;
      case AST_NODE_TYPES.TaggedTemplateExpression:
        return callee.parent.tag === callee ? callee : undefined;
      case AST_NODE_TYPES.JSXOpeningElement:
        return callee.parent.name === callee ? callee : undefined;
      default:
        return undefined;
    }
  }

  function getCallLikeDeprecation(node: TSESTree.Node): string | undefined {
    if (node.parent == null) {
      return undefined;
    }
    const signature = checker.getResolvedSignature(
      services.esTreeNodeToTSNodeMap.get(node.parent),
    );
    const symbol = services.getSymbolAtLocation(node);
    const aliasedSymbol =
      symbol?.flags && symbol.flags & SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    const declaration = aliasedSymbol?.declarations[0]?.resolve(project);
    if (
      declaration?.kind !== SyntaxKind.MethodDeclaration &&
      declaration?.kind !== SyntaxKind.FunctionDeclaration &&
      declaration?.kind !== SyntaxKind.MethodSignature
    ) {
      return (
        searchForDeprecationInAliasesChain(symbol, true) ??
        getSignatureDeprecation(signature) ??
        getSymbolDeprecation(aliasedSymbol)
      );
    }
    return (
      searchForDeprecationInAliasesChain(symbol, false) ??
      getSignatureDeprecation(signature)
    );
  }

  function getDeprecationReason(node: IdentifierLike): string | undefined {
    const callLikeNode = getCallLikeNode(node);
    if (callLikeNode) {
      return getCallLikeDeprecation(callLikeNode);
    }
    if (
      node.parent.type === AST_NODE_TYPES.JSXAttribute &&
      node.type !== AST_NODE_TYPES.Super
    ) {
      return (
        getSymbolDeprecation(services.getSymbolAtLocation(node)) ??
        getSymbolDeprecation(
          services
            .getContextualType(
              node.parent.parent.name as unknown as TSESTree.Expression,
            )
            ?.getProperty(node.name),
        )
      );
    }
    if (
      node.parent.type === AST_NODE_TYPES.MemberExpression &&
      !node.parent.computed &&
      node.parent.property === node
    ) {
      return (
        searchForDeprecationInAliasesChain(
          services.getSymbolAtLocation(node),
          true,
        ) ??
        getSymbolDeprecation(
          services.getTypeAtLocation(node.parent.object).getProperty(node.name),
        )
      );
    }
    if (
      node.parent.type === AST_NODE_TYPES.Property &&
      node.type !== AST_NODE_TYPES.Super
    ) {
      const propertySymbol = services.getSymbolAtLocation(node);
      return (
        searchForDeprecationInAliasesChain(propertySymbol, true) ??
        getSymbolDeprecation(
          services.getTypeAtLocation(node.parent.parent).getProperty(node.name),
        ) ??
        getSymbolDeprecation(propertySymbol) ??
        getSymbolDeprecation(
          checker.getShorthandAssignmentValueSymbol(
            services.esTreeNodeToTSNodeMap.get(node.parent),
          ),
        ) ??
        searchForDeprecationInAliasesChain(
          services.getSymbolAtLocation(node.parent.value),
          true,
        )
      );
    }
    return searchForDeprecationInAliasesChain(
      services.getSymbolAtLocation(node),
      true,
    );
  }

  function checkIdentifier(node: IdentifierLike): void {
    if (isDeclaration(node) || isInsideImport(node)) {
      return;
    }
    const reason = getDeprecationReason(node);
    if (reason == null) {
      return;
    }
    const name = getReportedNodeName(node);
    const rangeKey = `${node.range[0]}:${node.range[1]}`;
    if (reportedRanges.has(rangeKey)) {
      return;
    }
    reportedRanges.add(rangeKey);
    context.report({
      ...(reason
        ? { data: { name, reason }, messageId: 'deprecatedWithReason' }
        : { data: { name }, messageId: 'deprecated' }),
      node,
    });
  }

  const reportedRanges = new Set<string>();

  function checkMemberExpression(node: TSESTree.MemberExpression): void {
    const propertyName = node.computed
      ? (() => {
          const propertyType = services.getTypeAtLocation(node.property);
          if (
            !propertyType.isStringLiteralType() &&
            !propertyType.isNumberLiteralType()
          ) {
            return undefined;
          }
          return propertyType.isStringLiteralType()
            ? propertyType.value
            : String(propertyType.value);
        })()
      : node.property.type === AST_NODE_TYPES.Identifier
        ? node.property.name
        : undefined;
    if (propertyName == null) {
      return;
    }
    const callLikeNode = getCallLikeNode(node);
    const reason = callLikeNode
      ? getCallLikeDeprecation(callLikeNode)
      : (getSymbolDeprecation(services.getSymbolAtLocation(node)) ??
        getSymbolDeprecation(
          services.getTypeAtLocation(node.object).getProperty(propertyName),
        ));
    if (reason == null) {
      return;
    }
    context.report({
      ...(reason
        ? {
            data: { name: propertyName, reason },
            messageId: 'deprecatedWithReason',
          }
        : { data: { name: propertyName }, messageId: 'deprecated' }),
      node: node.property,
    });
  }

  return {
    Identifier(node): void {
      const { parent } = node;
      if (
        parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
        parent.type === AST_NODE_TYPES.ExportAllDeclaration ||
        (parent.type === AST_NODE_TYPES.MemberExpression &&
          parent.property === node)
      ) {
        return;
      }
      if (
        parent.type === AST_NODE_TYPES.ExportSpecifier &&
        (parent.exported !== node ||
          getSymbolDeprecation(services.getSymbolAtLocation(node)) != null)
      ) {
        return;
      }
      checkIdentifier(node);
    },
    JSXIdentifier(node): void {
      if (node.parent.type !== AST_NODE_TYPES.JSXClosingElement) {
        checkIdentifier(node);
      }
    },
    MemberExpression: checkMemberExpression,
    PrivateIdentifier: checkIdentifier,
    Super: checkIdentifier,
  };
}
