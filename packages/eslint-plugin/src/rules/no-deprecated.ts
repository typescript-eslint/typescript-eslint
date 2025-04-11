import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { TypeOrValueSpecifier } from '../util';

import {
  createRule,
  getParserServices,
  nullThrows,
  typeOrValueSpecifiersSchema,
  typeMatchesSomeSpecifier,
  valueMatchesSomeSpecifier,
} from '../util';

type IdentifierLike =
  | TSESTree.Identifier
  | TSESTree.JSXIdentifier
  | TSESTree.PrivateIdentifier
  | TSESTree.Super;

type MessageIds = 'deprecated' | 'deprecatedWithReason';

type Options = [
  {
    allow?: TypeOrValueSpecifier[];
  },
];

export default createRule<Options, MessageIds>({
  name: 'no-deprecated',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow using code marked as `@deprecated`',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      deprecated: `\`{{name}}\` is deprecated.`,
      deprecatedWithReason: `\`{{name}}\` is deprecated. {{reason}}`,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allow: {
            ...typeOrValueSpecifiersSchema,
            description: 'Type specifiers that can be allowed.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allow: [],
    },
  ],
  create(context, [options]) {
    const { jsDocParsingMode } = context.parserOptions;
    const allow = options.allow;
    if (jsDocParsingMode === 'none' || jsDocParsingMode === 'type-info') {
      throw new Error(
        `Cannot be used with jsDocParsingMode: '${jsDocParsingMode}'.`,
      );
    }

    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    // Deprecated jsdoc tags can be added on some symbol alias, e.g.
    //
    // export { /** @deprecated */ foo }
    //
    // When we import foo, its symbol is an alias of the exported foo (the one
    // with the deprecated tag), which is itself an alias of the original foo.
    // Therefore, we carefully go through the chain of aliases and check each
    // immediate alias for deprecated tags
    function searchForDeprecationInAliasesChain(
      symbol: ts.Symbol | undefined,
      checkDeprecationsOfAliasedSymbol: boolean,
    ): string | undefined {
      if (!symbol || !tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
        return checkDeprecationsOfAliasedSymbol
          ? getJsDocDeprecation(symbol)
          : undefined;
      }
      const targetSymbol = checker.getAliasedSymbol(symbol);
      while (tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
        const reason = getJsDocDeprecation(symbol);
        if (reason != null) {
          return reason;
        }
        const immediateAliasedSymbol: ts.Symbol | undefined =
          symbol.getDeclarations() && checker.getImmediateAliasedSymbol(symbol);
        if (!immediateAliasedSymbol) {
          break;
        }
        symbol = immediateAliasedSymbol;
        if (checkDeprecationsOfAliasedSymbol && symbol === targetSymbol) {
          return getJsDocDeprecation(symbol);
        }
      }
      return undefined;
    }

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
          // foo in "const { foo } = bar" will be processed twice, as parent.key
          // and parent.value. The second is treated as a declaration.
          if (parent.shorthand && parent.value === node) {
            return parent.parent.type === AST_NODE_TYPES.ObjectPattern;
          }
          if (parent.value === node) {
            return false;
          }
          return parent.parent.type === AST_NODE_TYPES.ObjectExpression;

        case AST_NODE_TYPES.AssignmentPattern:
          // foo in "const { foo = "" } = bar" will be processed twice, as parent.parent.key
          // and parent.left. The second is treated as a declaration.
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

        default:
          return false;
      }
    }

    function isInsideExportOrImport(node: TSESTree.Node): boolean {
      let current = node;

      while (true) {
        switch (current.type) {
          case AST_NODE_TYPES.ExportAllDeclaration:
          case AST_NODE_TYPES.ExportNamedDeclaration:
          case AST_NODE_TYPES.ImportDeclaration:
            return true;

          case AST_NODE_TYPES.ArrowFunctionExpression:
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

    function getJsDocDeprecation(
      symbol: ts.Signature | ts.Symbol | undefined,
    ): string | undefined {
      let jsDocTags: ts.JSDocTagInfo[] | undefined;
      try {
        jsDocTags = symbol?.getJsDocTags(checker);
      } catch {
        // workaround for https://github.com/microsoft/TypeScript/issues/60024
        return;
      }
      const tag = jsDocTags?.find(tag => tag.name === 'deprecated');

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
      const signature = nullThrows(
        checker.getResolvedSignature(tsNode as ts.CallLikeExpression),
        'Expected call like node to have signature',
      );

      const symbol = services.getSymbolAtLocation(node);
      const aliasedSymbol =
        symbol != null && tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      const symbolDeclarationKind = aliasedSymbol?.declarations?.[0].kind;
      // Properties with function-like types have "deprecated" jsdoc
      // on their symbols, not on their signatures:
      //
      // interface Props {
      //   /** @deprecated */
      //   property: () => 'foo'
      //   ^symbol^  ^signature^
      // }
      if (
        symbolDeclarationKind !== ts.SyntaxKind.MethodDeclaration &&
        symbolDeclarationKind !== ts.SyntaxKind.FunctionDeclaration &&
        symbolDeclarationKind !== ts.SyntaxKind.MethodSignature
      ) {
        return (
          searchForDeprecationInAliasesChain(symbol, true) ??
          getJsDocDeprecation(signature) ??
          getJsDocDeprecation(aliasedSymbol)
        );
      }
      return (
        searchForDeprecationInAliasesChain(
          symbol,
          // Here we're working with a function declaration or method.
          // Both can have 1 or more overloads, each overload creates one
          // ts.Declaration which is placed in symbol.declarations.
          //
          // Imagine the following code:
          //
          // function foo(): void
          // /** @deprecated Some Reason */
          // function foo(arg: string): void
          // function foo(arg?: string): void {}
          //
          // foo()    // <- foo is our symbol
          //
          // If we call getJsDocDeprecation(checker.getAliasedSymbol(symbol)),
          // we get 'Some Reason', but after all, we are calling foo with
          // a signature that is not deprecated!
          // It works this way because symbol.getJsDocTags returns tags from
          // all symbol declarations combined into one array. And AFAIK there is
          // no publicly exported TS function that can tell us if a particular
          // declaration is deprecated or not.
          //
          // So, in case of function and method declarations, we don't check original
          // aliased symbol, but rely on the getJsDocDeprecation(signature) call below.
          false,
        ) ?? getJsDocDeprecation(signature)
      );
    }

    function getJSXAttributeDeprecation(
      openingElement: TSESTree.JSXOpeningElement,
      propertyName: string,
    ): string | undefined {
      const tsNode = services.esTreeNodeToTSNodeMap.get(openingElement.name);

      const contextualType = nullThrows(
        checker.getContextualType(tsNode as ts.Expression),
        'Expected JSX opening element name to have contextualType',
      );

      const symbol = contextualType.getProperty(propertyName);

      return getJsDocDeprecation(symbol);
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
        return getJSXAttributeDeprecation(node.parent.parent, node.name);
      }

      if (
        node.parent.type === AST_NODE_TYPES.Property &&
        node.type !== AST_NODE_TYPES.Super
      ) {
        const property = services
          .getTypeAtLocation(node.parent.parent)
          .getProperty(node.name);
        const propertySymbol = services.getSymbolAtLocation(node);
        const valueSymbol = checker.getShorthandAssignmentValueSymbol(
          propertySymbol?.valueDeclaration,
        );
        return (
          getJsDocDeprecation(property) ??
          getJsDocDeprecation(propertySymbol) ??
          getJsDocDeprecation(valueSymbol)
        );
      }

      return searchForDeprecationInAliasesChain(
        services.getSymbolAtLocation(node),
        true,
      );
    }

    function checkIdentifier(node: IdentifierLike): void {
      if (isDeclaration(node) || isInsideExportOrImport(node)) {
        return;
      }

      const reason = getDeprecationReason(node);
      if (reason == null) {
        return;
      }

      const type = services.getTypeAtLocation(node);
      if (
        typeMatchesSomeSpecifier(type, allow, services.program) ||
        valueMatchesSomeSpecifier(node, allow, services.program, type)
      ) {
        return;
      }

      const name = getReportedNodeName(node);

      context.report({
        ...(reason
          ? {
              messageId: 'deprecatedWithReason',
              data: { name, reason },
            }
          : {
              messageId: 'deprecated',
              data: { name },
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
      PrivateIdentifier: checkIdentifier,
      Super: checkIdentifier,
    };
  },
});

function getReportedNodeName(node: IdentifierLike): string {
  if (node.type === AST_NODE_TYPES.Super) {
    return 'super';
  }

  if (node.type === AST_NODE_TYPES.PrivateIdentifier) {
    return `#${node.name}`;
  }

  return node.name;
}
