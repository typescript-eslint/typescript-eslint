import type {
  Node as NativeNode,
  NodeArray as NativeNodeArray,
  SourceFile as NativeSourceFile,
} from '@typescript/native/unstable/ast';

import {
  NodeFlags as NativeNodeFlags,
  SyntaxKind as NativeSyntaxKind,
} from '@typescript/native/unstable/ast';
import * as ts from 'typescript';

import { createFlagTranslations, translateFlags } from './translateFlags';

export interface NativeNodeAdapter {
  adaptSourceFile(sourceFile: NativeSourceFile): ts.SourceFile;
  unwrapNode(node: ts.Node): NativeNode;
  wrapNode(node: NativeNode): ts.Node;
}

interface NativeSyntacticDiagnostic {
  category: number;
  code: number;
  end: number;
  pos: number;
  text: string;
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

const CLASSIC_TO_NATIVE_PROPERTY = new Map<string, string>([
  ['default', 'defaultType'],
]);

/**
 * A fallback rather than a rename: nodes that do have a native property of the
 * classic name — a parameter's `?`, a mapped type's `?` — keep using it.
 */
const POSTFIX_TOKEN_KINDS = new Map<string, NativeSyntaxKind>([
  ['exclamationToken', NativeSyntaxKind.ExclamationToken],
  ['questionToken', NativeSyntaxKind.QuestionToken],
]);

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
  getSyntacticDiagnostics: () => readonly NativeSyntacticDiagnostic[],
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

  function getChildren(node: NativeNode): readonly ts.Node[] {
    const cached = nativeToChildren.get(node);
    if (cached) {
      return cached;
    }

    const parent = wrapNode(node);
    const children: NativeNode[] = [];
    node.forEachChild(
      child => {
        children.push(child);
      },
      childArray => {
        children.push(...childArray);
      },
    );
    children.sort(
      (left, right) => left.pos - right.pos || right.end - left.end,
    );

    const sourceFile = node.getSourceFile();
    const childStarts = children.map(child => child.getStart(sourceFile));
    const scanner = ts.createScanner(
      ts.ScriptTarget.Latest,
      true,
      sourceFile.languageVariant,
      sourceFile.text,
    );
    // Only the deprecated position API can resume after a structural child.
    /* eslint-disable @typescript-eslint/no-deprecated */
    scanner.setTextPos(Math.max(0, node.pos));
    const result: ts.Node[] = [];
    let childIndex = 0;
    while (scanner.getTextPos() < node.end) {
      const fullStart = scanner.getTextPos();
      const kind = scanner.scan();
      const tokenStart = scanner.getTokenPos();
      const tokenEnd = scanner.getTextPos();
      while (
        childIndex < children.length &&
        children[childIndex].end <= tokenStart
      ) {
        result.push(wrapNode(children[childIndex++]));
      }
      const child = children[childIndex];
      if (
        childIndex < children.length &&
        tokenStart >= childStarts[childIndex] &&
        tokenStart < child.end
      ) {
        scanner.setTextPos(child.end);
        result.push(wrapNode(child));
        childIndex += 1;
      } else if (kind === ts.SyntaxKind.EndOfFileToken || tokenEnd > node.end) {
        break;
      } else if (kind === ts.SyntaxKind.LessThanSlashToken) {
        result.push(
          createToken(
            ts.SyntaxKind.LessThanToken,
            fullStart,
            tokenStart + 1,
            parent,
          ),
          createToken(
            ts.SyntaxKind.SlashToken,
            tokenStart + 1,
            tokenEnd,
            parent,
          ),
        );
      } else if (
        kind !== ts.SyntaxKind.WhitespaceTrivia &&
        kind !== ts.SyntaxKind.NewLineTrivia
      ) {
        result.push(createToken(kind, fullStart, tokenEnd, parent));
      }
    }
    /* eslint-enable @typescript-eslint/no-deprecated */
    while (childIndex < children.length) {
      result.push(wrapNode(children[childIndex++]));
    }
    nativeToChildren.set(node, result);
    return result;
  }

  function getEdgeToken(node: NativeNode, first: boolean): ts.Node | undefined {
    const children = getChildren(node);
    const child = first ? children[0] : children.at(-1);
    if (!child) {
      return undefined;
    }
    return child.kind < ts.SyntaxKind.FirstNode
      ? child
      : getEdgeToken(unwrap(child), first);
  }

  function unwrap(node: ts.Node): NativeNode {
    const native = adapterToNative.get(node);
    if (!native) {
      throw new Error('The node was not created by this native node adapter.');
    }
    return native;
  }

  function wrapNode(node: NativeNode): ts.Node {
    const cached = nativeToAdapter.get(node);
    if (cached) {
      return cached;
    }

    const proxy = new Proxy(node, {
      get(target, property) {
        if (property === 'kind') {
          return translateKind(target.kind);
        }
        if (property === 'flags') {
          return translateNodeFlags(target);
        }
        if (property === 'transformFlags') {
          return 0;
        }
        if (property === 'modifierFlagsCache') {
          return (
            ((target as NativeNode & { modifierFlags?: number })
              .modifierFlags ?? ts.ModifierFlags.None) |
            ts.ModifierFlags.HasComputedFlags
          );
        }
        if (
          property === 'parseDiagnostics' &&
          target.kind === NativeSyntaxKind.SourceFile
        ) {
          return getSyntacticDiagnostics().map(diagnostic => ({
            category: diagnostic.category,
            code: diagnostic.code,
            file: proxy,
            length: diagnostic.end - diagnostic.pos,
            messageText: diagnostic.text,
            start: diagnostic.pos,
          }));
        }
        if (property === 'getChildren') {
          return () => getChildren(target);
        }
        if (property === 'getChildCount') {
          return () => getChildren(target).length;
        }
        if (property === 'getChildAt') {
          return (index: number) => getChildren(target)[index];
        }
        if (property === 'getFirstToken' || property === 'getLastToken') {
          return () => getEdgeToken(target, property === 'getFirstToken');
        }
        if (property === 'getEnd') {
          return () => target.end;
        }
        if (property === 'getFullStart') {
          return () => target.pos;
        }
        if (property === 'getLeadingTriviaWidth') {
          return () => target.getStart() - target.pos;
        }
        if (property === 'forEachChild') {
          return <T>(
            visitor: (child: ts.Node) => T,
            visitArray?: (children: ts.NodeArray<ts.Node>) => T,
          ): T | undefined =>
            target.forEachChild(
              child => visitor(wrapNode(child)),
              visitArray && (children => visitArray(adaptArray(children))),
            );
        }
        if (property === 'getSourceFile') {
          return () => wrapNode(target.getSourceFile());
        }
        if (
          property === 'getStart' ||
          property === 'getWidth' ||
          property === 'getText' ||
          property === 'getFullText'
        ) {
          return (
            sourceFile?: ts.SourceFile,
            includeJsDocComment?: boolean,
          ) => {
            const nativeSourceFile = sourceFile
              ? (adapterToNative.get(sourceFile) as NativeSourceFile)
              : undefined;
            return property === 'getStart'
              ? target.getStart(nativeSourceFile, includeJsDocComment)
              : target[property](nativeSourceFile);
          };
        }
        let value: unknown = Reflect.get(
          target,
          (typeof property === 'string' &&
            CLASSIC_TO_NATIVE_PROPERTY.get(property)) ||
            property,
          target,
        );
        if (value == null && typeof property === 'string') {
          const postfixKind = POSTFIX_TOKEN_KINDS.get(property);
          if (postfixKind != null) {
            const postfix: unknown = Reflect.get(
              target,
              'postfixToken',
              target,
            );
            value =
              isNativeNode(postfix) && postfix.kind === postfixKind
                ? postfix
                : undefined;
          }
        }
        if (
          typeof value === 'number' &&
          (property === 'operator' ||
            property === 'token' ||
            property === 'keywordToken')
        ) {
          return translateKind(value);
        }
        if (isNativeNode(value)) {
          return wrapNode(value);
        }
        if (isNativeNodeArray(value)) {
          return adaptArray(value);
        }
        if (typeof value === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return value.bind(target);
        }
        return value;
      },
    }) as unknown as ts.Node;
    nativeToAdapter.set(node, proxy);
    adapterToNative.set(proxy, node);
    return proxy;
  }

  return {
    adaptSourceFile: sourceFile => wrapNode(sourceFile) as ts.SourceFile,
    unwrapNode: unwrap,
    wrapNode,
  };
}
