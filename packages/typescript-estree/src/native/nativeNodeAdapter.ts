import type {
  Node as NativeNode,
  NodeArray as NativeNodeArray,
} from '@typescript/native/unstable/ast';
import type { Diagnostic as NativeDiagnostic } from '@typescript/native/unstable/sync';

import {
  NodeFlags as NativeNodeFlags,
  SyntaxKind as NativeSyntaxKind,
} from '@typescript/native/unstable/ast';
import * as ts from 'typescript';

import type { NativeMethod } from './createMethodForwarder';

import { createMethodForwarder } from './createMethodForwarder';
import { createFlagTranslations, translateFlags } from './translateFlags';

export interface NativeNodeAdapter {
  unwrapNode(node: ts.Node): NativeNode;
  wrapNode(node: NativeNode): ts.Node;
}

/** Classic's `file` is the adapted source file, which native only names. */
export function toClassicDiagnostic(
  diagnostic: NativeDiagnostic,
  file: ts.SourceFile | undefined,
): ts.Diagnostic {
  return {
    category: diagnostic.category,
    code: diagnostic.code,
    file,
    length: diagnostic.end - diagnostic.pos,
    messageText: diagnostic.text,
    start: diagnostic.pos,
  };
}

const nativeToClassicKind = new Map<NativeSyntaxKind, ts.SyntaxKind>();
for (const [name, value] of Object.entries(NativeSyntaxKind)) {
  if (typeof value === 'number') {
    const classic = ts.SyntaxKind[name as keyof typeof ts.SyntaxKind];
    if (typeof classic === 'number') {
      nativeToClassicKind.set(value, classic);
    }
  }
}
nativeToClassicKind.set(
  NativeSyntaxKind.EndOfFile,
  ts.SyntaxKind.EndOfFileToken,
);

const NODE_FLAG_TRANSLATIONS = createFlagTranslations(
  NativeNodeFlags,
  ts.NodeFlags,
);

/** TypeScript 7 has no such `NodeFlags`; it models both structurally. */
function getModuleDeclarationFlags(node: NativeNode): ts.NodeFlags {
  const declaration = node as NativeNode & {
    keyword?: NativeSyntaxKind;
    name?: { kind: NativeSyntaxKind; text?: string };
  };

  if (declaration.keyword === NativeSyntaxKind.NamespaceKeyword) {
    return ts.NodeFlags.Namespace;
  }

  return declaration.name?.kind === NativeSyntaxKind.Identifier &&
    declaration.name.text === 'global'
    ? ts.NodeFlags.GlobalAugmentation
    : ts.NodeFlags.None;
}

function translateNodeFlags(node: NativeNode): ts.NodeFlags {
  const flags = translateFlags(NODE_FLAG_TRANSLATIONS, node.flags);
  return node.kind === NativeSyntaxKind.ModuleDeclaration
    ? flags | getModuleDeclarationFlags(node)
    : flags;
}

/** Native stores these as bare kinds, which need translating like any other. */
const KIND_PROPERTIES = new Set(['keywordToken', 'operator', 'token']);

function isHeritageTypeReference(node: NativeNode): boolean {
  return (
    node.kind === NativeSyntaxKind.TypeReference &&
    node.parent.kind === NativeSyntaxKind.HeritageClause
  );
}

function isNativeNode(value: unknown): value is NativeNode {
  return (
    typeof value === 'object' &&
    value != null &&
    typeof (value as NativeNode).kind === 'number' &&
    typeof (value as NativeNode).forEachChild === 'function'
  );
}

function isNativeNodeArray(
  value: unknown,
): value is NativeNodeArray<NativeNode> {
  return (
    typeof value === 'object' &&
    value != null &&
    Symbol.iterator in value &&
    typeof (value as NativeNodeArray<NativeNode>).pos === 'number' &&
    typeof (value as NativeNodeArray<NativeNode>).end === 'number'
  );
}

export function createNativeNodeAdapter(
  getSyntacticDiagnostics: () => readonly NativeDiagnostic[],
): NativeNodeAdapter {
  const nativeToAdapter = new WeakMap<NativeNode, ts.Node>();
  const adapterToNative = new WeakMap<ts.Node, NativeNode>();
  const nativeArrayToAdapter = new WeakMap<
    NativeNodeArray<NativeNode>,
    ts.NodeArray<ts.Node>
  >();
  const nativeToChildren = new WeakMap<NativeNode, readonly ts.Node[]>();

  function translateKind(kind: NativeSyntaxKind): ts.SyntaxKind {
    const translated = nativeToClassicKind.get(kind);
    if (translated != null) {
      return translated;
    }
    throw new Error(
      `Unsupported native SyntaxKind: ${NativeSyntaxKind[kind]} (${kind})`,
    );
  }

  function adaptArray(
    nodes: NativeNodeArray<NativeNode>,
  ): ts.NodeArray<ts.Node> {
    const cached = nativeArrayToAdapter.get(nodes);
    if (cached) {
      return cached;
    }

    const adapted: ts.Node[] = [];
    const adaptedNodeArray = adapted as unknown as ts.NodeArray<ts.Node>;
    nativeArrayToAdapter.set(nodes, adaptedNodeArray);
    Object.defineProperties(adaptedNodeArray, {
      end: { value: nodes.end },
      hasTrailingComma: { value: nodes.hasTrailingComma },
      pos: { value: nodes.pos },
      transformFlags: { value: nodes.transformFlags },
    });
    adapted.push(...nodes.map(wrapNode));
    return adaptedNodeArray;
  }

  function createToken(
    kind: ts.SyntaxKind,
    pos: number,
    end: number,
    parent: ts.Node,
  ): ts.Node {
    const token = ts.factory.createIdentifier('');
    Object.defineProperties(token, {
      end: { value: end },
      kind: { value: kind },
      parent: { value: parent },
      pos: { value: pos },
    });
    return token;
  }

  /** Classic splits a JSX closing tag's `</` into `<` and `/`; native keeps it whole. */
  function getChildren(node: NativeNode): readonly ts.Node[] {
    const cached = nativeToChildren.get(node);
    if (cached) {
      return cached;
    }

    const parent = wrapNode(node);
    const children = node
      .getChildren()
      .flatMap(child =>
        child.kind === NativeSyntaxKind.LessThanSlashToken
          ? [
              createToken(
                ts.SyntaxKind.LessThanToken,
                child.pos,
                child.end - 1,
                parent,
              ),
              createToken(
                ts.SyntaxKind.SlashToken,
                child.end - 1,
                child.end,
                parent,
              ),
            ]
          : [wrapNode(child)],
      );
    nativeToChildren.set(node, children);
    return children;
  }

  /** A `</` is only ever a first token, where classic answers its `<`. */
  function wrapToken(token: NativeNode | undefined): ts.Node | undefined {
    if (token?.kind !== NativeSyntaxKind.LessThanSlashToken) {
      return token && wrapNode(token);
    }
    return getChildren(token.parent).find(child => child.pos === token.pos);
  }

  function readNative(target: NativeNode, property: string | symbol): unknown {
    const value: unknown = Reflect.get(target, property, target);
    if (typeof value === 'number' && KIND_PROPERTIES.has(property as string)) {
      return translateKind(value);
    }
    if (isNativeNode(value)) {
      return wrapNode(value);
    }
    if (isNativeNodeArray(value)) {
      return adaptArray(value);
    }
    return typeof value === 'function' ? forward(value as NativeMethod) : value;
  }

  /**
   * A fallback rather than a rename: nodes that do have a native property of
   * the classic name — a parameter's `?`, a mapped type's `?` — keep using it.
   */
  function readPostfixToken(
    target: NativeNode,
    property: string,
    kind: NativeSyntaxKind,
  ): unknown {
    const own = readNative(target, property);
    if (own != null) {
      return own;
    }
    const postfix: unknown = Reflect.get(target, 'postfixToken', target);
    return isNativeNode(postfix) && postfix.kind === kind
      ? wrapNode(postfix)
      : undefined;
  }

  /**
   * Classic methods, shared by every node; each reads its node off `this`.
   * Native's source file is always the node's own, so that argument is dropped.
   */
  const nodeMethods = {
    forEachChild<T>(
      this: ts.Node,
      visitor: (child: ts.Node) => T,
      visitArray?: (children: ts.NodeArray<ts.Node>) => T,
    ): T | undefined {
      return unwrap(this).forEachChild(
        child => visitor(wrapNode(child)),
        visitArray && (children => visitArray(adaptArray(children))),
      );
    },
    getChildAt(this: ts.Node, index: number) {
      return getChildren(unwrap(this))[index];
    },
    getChildCount(this: ts.Node) {
      return getChildren(unwrap(this)).length;
    },
    getChildren(this: ts.Node) {
      return getChildren(unwrap(this));
    },
    getFirstToken(this: ts.Node) {
      return wrapToken(unwrap(this).getFirstToken());
    },
    getFullText(this: ts.Node) {
      return unwrap(this).getFullText();
    },
    getLastToken(this: ts.Node) {
      return wrapToken(unwrap(this).getLastToken());
    },
    getLeadingTriviaWidth(this: ts.Node) {
      return unwrap(this).getLeadingTriviaWidth();
    },
    getSourceFile(this: ts.Node) {
      return wrapNode(unwrap(this).getSourceFile());
    },
    getStart(
      this: ts.Node,
      _sourceFile?: ts.SourceFile,
      includeJsDocComment?: boolean,
    ) {
      return unwrap(this).getStart(undefined, includeJsDocComment);
    },
    getText(this: ts.Node) {
      return unwrap(this).getText();
    },
    getWidth(this: ts.Node) {
      return unwrap(this).getWidth();
    },
  };

  const handler: ProxyHandler<NativeNode> = {
    get(target, property, receiver) {
      switch (property) {
        case 'default':
          return readNative(target, 'defaultType');
        // Native keeps only the unescaped `text` of an identifier.
        case 'escapedText':
          return target.kind === NativeSyntaxKind.Identifier ||
            target.kind === NativeSyntaxKind.PrivateIdentifier
            ? ts.escapeLeadingUnderscores(
                (target as NativeNode & { text: string }).text,
              )
            : readNative(target, property);
        case 'exclamationToken':
          return readPostfixToken(
            target,
            property,
            NativeSyntaxKind.ExclamationToken,
          );
        // Classic always spells a heritage element as an expression.
        case 'expression':
          return isHeritageTypeReference(target)
            ? wrapNode((target as unknown as { typeName: NativeNode }).typeName)
            : readNative(target, property);
        case 'flags':
          return translateNodeFlags(target);
        case 'kind':
          return isHeritageTypeReference(target)
            ? ts.SyntaxKind.ExpressionWithTypeArguments
            : translateKind(target.kind);
        case 'modifierFlagsCache':
          return (
            ((target as NativeNode & { modifierFlags?: number })
              .modifierFlags ?? ts.ModifierFlags.None) |
            ts.ModifierFlags.HasComputedFlags
          );
        case 'parseDiagnostics':
          return target.kind === NativeSyntaxKind.SourceFile
            ? getSyntacticDiagnostics().map(diagnostic =>
                toClassicDiagnostic(diagnostic, receiver as ts.SourceFile),
              )
            : undefined;
        case 'questionToken':
          return readPostfixToken(
            target,
            property,
            NativeSyntaxKind.QuestionToken,
          );
        case 'forEachChild':
        case 'getChildAt':
        case 'getChildCount':
        case 'getChildren':
        case 'getFirstToken':
        case 'getFullText':
        case 'getLastToken':
        case 'getLeadingTriviaWidth':
        case 'getSourceFile':
        case 'getStart':
        case 'getText':
        case 'getWidth':
          return nodeMethods[property];
        default:
          return readNative(target, property);
      }
    },
  };

  function unwrap(node: ts.Node): NativeNode {
    const native = adapterToNative.get(node);
    if (!native) {
      throw new Error('The node was not created by this native node adapter.');
    }
    return native;
  }

  const forward = createMethodForwarder(unwrap);

  function wrapNode(node: NativeNode): ts.Node {
    const cached = nativeToAdapter.get(node);
    if (cached) {
      return cached;
    }
    const proxy = new Proxy(node, handler) as unknown as ts.Node;
    nativeToAdapter.set(node, proxy);
    adapterToNative.set(proxy, node);
    return proxy;
  }

  return { unwrapNode: unwrap, wrapNode };
}
