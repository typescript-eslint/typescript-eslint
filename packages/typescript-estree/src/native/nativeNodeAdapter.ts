import type {
  Node as NativeNode,
  NodeArray as NativeNodeArray,
  SourceFile as NativeSourceFile,
} from '@typescript/native/unstable/ast';

import { SyntaxKind as NativeSyntaxKind } from '@typescript/native/unstable/ast';
import * as ts from 'typescript';

export interface NativeNodeAdapter {
  adaptSourceFile(sourceFile: NativeSourceFile): ts.SourceFile;
  getWrappedNode(node: unknown): ts.Node | undefined;
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
  getSyntacticDiagnostics?: () => readonly NativeSyntacticDiagnostic[],
): NativeNodeAdapter {
  const nativeToAdapter = new WeakMap<NativeNode, ts.Node>();
  const adapterToNative = new WeakMap<ts.Node, NativeNode>();
  const nativeArrayToAdapter = new WeakMap<
    NativeNodeArray<NativeNode>,
    ts.NodeArray<ts.Node>
  >();

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

  function getChildren(node: NativeNode, parent: ts.Node): readonly ts.Node[] {
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
    // The classic scanner's deprecated position API is the only API capable of
    // resuming after a structural native child.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    scanner.setTextPos(Math.max(0, node.pos));
    const result: ts.Node[] = [];
    let childIndex = 0;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    while (scanner.getTextPos() < node.end) {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const fullStart = scanner.getTextPos();
      const kind = scanner.scan();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const tokenStart = scanner.getTokenPos();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
    while (childIndex < children.length) {
      result.push(wrapNode(children[childIndex++]));
    }
    return result;
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
          return (getSyntacticDiagnostics?.() ?? []).map(diagnostic => ({
            category: diagnostic.category,
            code: diagnostic.code,
            file: proxy,
            length: diagnostic.end - diagnostic.pos,
            messageText: diagnostic.text,
            start: diagnostic.pos,
          }));
        }
        if (property === 'getChildren') {
          return () => getChildren(target, proxy);
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
        // Native nodes expose their fields through accessors not represented by
        // the base Node interface, so proxying necessarily starts from unknown.
        const value: unknown = Reflect.get(target, property, target);
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
    getWrappedNode: node => nativeToAdapter.get(node as NativeNode),
    unwrapNode(node) {
      const native = adapterToNative.get(node);
      if (!native) {
        throw new Error(
          'The node was not created by this native node adapter.',
        );
      }
      return native;
    },
    wrapNode,
  };
}
