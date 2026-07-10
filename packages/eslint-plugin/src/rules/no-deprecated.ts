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
    const { jsDocParsingMode } = context.languageOptions.parserOptions;
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

          if (parent.value === node) {
            // const { foo: bar } = baz; -- bar IS a declaration.
            // const baz = { foo: bar }; -- bar IS NOT a declaration.
            return parent.parent.type === AST_NODE_TYPES.ObjectPattern;
          }
          // const { foo: bar } = baz; -- foo IS NOT a declaration.
          // const baz = { foo: bar }; -- foo IS a declaration.
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

        // treat `export import Bar = Foo;` (and `import Foo = require('...')`) as declarations
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

    // the callee of a call-like expression: `foo` in `foo()`, `a.b.c` in
    // `a.b.c()`, `Tag` in `` Tag`...` `` and `<Tag />`, `super` in `super()`
    type CallLikeCallee = IdentifierLike | TSESTree.MemberExpression;

    function isNodeCalleeOfParent(node: CallLikeCallee): boolean {
      switch (node.parent.type) {
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

    function getCallLikeNode(node: IdentifierLike): CallLikeCallee | undefined {
      let callee: CallLikeCallee = node;

      while (
        callee.parent.type === AST_NODE_TYPES.MemberExpression &&
        callee.parent.property === callee
      ) {
        callee = callee.parent;
      }

      return isNodeCalleeOfParent(callee) ? callee : undefined;
    }

    function getSignatureDeprecation(node: CallLikeCallee): string | undefined {
      // Intrinsic JSX elements (e.g. `<div />`) get synthesized signatures
      // without declarations, which can never be deprecated — deprecations of
      // the elements themselves live on the `JSX.IntrinsicElements` property
      // symbols, which are handled by the symbol-based checks.
      if (
        node.type === AST_NODE_TYPES.JSXIdentifier &&
        node.name.charAt(0).toLowerCase() === node.name.charAt(0)
      ) {
        return undefined;
      }

      // Resolving the signature of a call-like expression is expensive: it
      // forces the checker to fully check the call, including every argument.
      // The resolved signature can only be deprecated if one of the callee
      // type's call or construct signatures is deprecated, so we scan those
      // candidates first — that only requires typing the callee — and resolve
      // the actual signature only when a deprecated candidate exists, to find
      // out whether it is the one being used.
      const calleeType = services.getTypeAtLocation(node);
      const mayHaveDeprecatedSignature = tsutils
        .unionConstituents(calleeType)
        .some(type =>
          [...type.getCallSignatures(), ...type.getConstructSignatures()].some(
            signature => getJsDocDeprecation(signature) != null,
          ),
        );

      if (!mayHaveDeprecatedSignature) {
        return undefined;
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(node.parent);
      const signature = nullThrows(
        checker.getResolvedSignature(tsNode as ts.CallLikeExpression),
        'Expected call like node to have signature',
      );
      return getJsDocDeprecation(signature);
    }

    function getCallLikeDeprecation(node: CallLikeCallee): string | undefined {
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
          getSignatureDeprecation(node) ??
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
          // aliased symbol, but rely on the getSignatureDeprecation(node) call below.
          false,
        ) ?? getSignatureDeprecation(node)
      );
    }

    // Getting the contextual type of a JSX element's tag name forces the
    // checker to resolve the element, type-checking all of its attributes.
    // For function components we can usually prove an attribute is not
    // deprecated by looking it up on the props parameter of the component's
    // declared signatures instead, which only requires typing the tag name.
    function isJSXAttributeProvenNotDeprecated(
      tagName: TSESTree.JSXTagNameExpression,
      propertyName: string,
    ): boolean {
      if (
        tagName.type !== AST_NODE_TYPES.JSXMemberExpression &&
        (tagName.type !== AST_NODE_TYPES.JSXIdentifier ||
          tagName.name.charAt(0).toLowerCase() === tagName.name.charAt(0))
      ) {
        return false;
      }

      return tsutils
        .unionConstituents(services.getTypeAtLocation(tagName))
        .every(constituent => {
          if (constituent.getConstructSignatures().length > 0) {
            // Class components get their props type from the instance type,
            // not from a signature parameter.
            return false;
          }
          const callSignatures = constituent.getCallSignatures();
          if (callSignatures.length === 0) {
            return false;
          }
          return callSignatures.every(signature => {
            const propsParam = signature.getParameters().at(0);
            if (!propsParam) {
              // A component without a props parameter cannot have deprecated
              // attributes, unless generics could still produce one.
              return signature.typeParameters == null;
            }
            const property = checker
              .getTypeOfSymbol(propsParam)
              .getProperty(propertyName);
            if (!property) {
              // The property's absence is only provable when the signature is
              // not generic — instantiation cannot add properties then.
              return signature.typeParameters == null;
            }
            return getJsDocDeprecation(property) == null;
          });
        });
    }

    const jsxContextualTypeCache = new WeakMap<
      TSESTree.JSXOpeningElement,
      ts.Type
    >();

    function getJSXAttributeDeprecation(
      openingElement: TSESTree.JSXOpeningElement,
      propertyName: string,
    ): string | undefined {
      if (
        isJSXAttributeProvenNotDeprecated(openingElement.name, propertyName)
      ) {
        return undefined;
      }

      let contextualType = jsxContextualTypeCache.get(openingElement);
      if (contextualType == null) {
        contextualType = nullThrows(
          services.getContextualType(
            openingElement.name as unknown as TSESTree.Expression,
          ),
          'Expected JSX opening element name to have contextualType',
        );
        jsxContextualTypeCache.set(openingElement, contextualType);
      }

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
          searchForDeprecationInAliasesChain(propertySymbol, true) ??
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
      if (isDeclaration(node) || isInsideImport(node)) {
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

    function checkMemberExpression(node: TSESTree.MemberExpression): void {
      if (!node.computed) {
        return;
      }

      const propertyType = services.getTypeAtLocation(node.property);

      if (propertyType.isLiteral()) {
        const objectType = services.getTypeAtLocation(node.object);

        const propertyName = propertyType.isStringLiteral()
          ? propertyType.value
          : // eslint-disable-next-line @typescript-eslint/no-base-to-string
            String(propertyType.value);

        const property = objectType.getProperty(propertyName);

        const reason = getJsDocDeprecation(property);
        if (reason == null) {
          return;
        }

        if (typeMatchesSomeSpecifier(objectType, allow, services.program)) {
          return;
        }

        context.report({
          ...(reason
            ? {
                messageId: 'deprecatedWithReason',
                data: { name: propertyName, reason },
              }
            : {
                messageId: 'deprecated',
                data: { name: propertyName },
              }),
          node: node.property,
        });
      }
    }

    return {
      Identifier(node): void {
        const { parent } = node;

        if (
          parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
          parent.type === AST_NODE_TYPES.ExportAllDeclaration
        ) {
          return;
        }

        // Computed identifier expressions are handled by checkMemberExpression
        if (
          parent.type === AST_NODE_TYPES.MemberExpression &&
          parent.computed &&
          parent.property === node
        ) {
          return;
        }

        if (parent.type === AST_NODE_TYPES.ExportSpecifier) {
          // only deal with the alias (exported) side, not the local binding
          if (parent.exported !== node) {
            return;
          }

          const symbol = services.getSymbolAtLocation(node);
          const aliasDeprecation = getJsDocDeprecation(symbol);

          if (aliasDeprecation != null) {
            return;
          }
        }

        // whether it's a plain identifier or the exported alias
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
