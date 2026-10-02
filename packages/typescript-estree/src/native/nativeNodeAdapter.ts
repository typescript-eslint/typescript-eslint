import type {
  Node as NativeNode,
  NodeArray as NativeNodeArray,
  SourceFile as NativeSourceFile,
} from '@typescript/native/unstable/ast';
import type { Diagnostic as NativeDiagnostic } from '@typescript/native/unstable/sync';

import {
  NodeFlags as NativeNodeFlags,
  SyntaxKind as NativeSyntaxKind,
} from '@typescript/native/unstable/ast';
import * as ts from 'typescript';

import { createFlagTranslations, translateFlags } from './translateFlags';

export interface NativeNodeAdapter {
  unwrapNode(node: ts.Node): NativeNode;
  wrapNode(node: NativeNode): ts.Node;
}

interface NativeNodeAdapterOptions {
  getSyntacticDiagnostics: (fileName: string) => readonly NativeDiagnostic[];
}

export function toClassicDiagnostic(
  diagnostic: NativeDiagnostic,
  getFile: (fileName: string | undefined) => ts.SourceFile | undefined,
): ts.Diagnostic {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
    category: diagnostic.category,
    code: diagnostic.code,
    file: getFile(diagnostic.fileName),
    length: diagnostic.end - diagnostic.pos,
    messageText: diagnostic.messageChain?.length
      ? toMessageChain(diagnostic)
      : diagnostic.text,
    relatedInformation: diagnostic.relatedInformation?.map(related =>
      toClassicDiagnostic(related, getFile),
    ),
    reportsDeprecated: diagnostic.reportsDeprecated,
    reportsUnnecessary: diagnostic.reportsUnnecessary,
    source: diagnostic.source,
    start: diagnostic.pos,
  };
}

function toMessageChain(
  diagnostic: NativeDiagnostic,
): ts.DiagnosticMessageChain {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
    category: diagnostic.category,
    code: diagnostic.code,
    messageText: diagnostic.text,
    next: diagnostic.messageChain?.map(toMessageChain),
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

function translateKind(kind: NativeSyntaxKind) {
  const translated = nativeToClassicKind.get(kind);
  if (translated != null) {
    return translated;
  }
  throw new Error(
    `Unsupported native SyntaxKind: ${NativeSyntaxKind[kind]} (${kind})`,
  );
}

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
    declaration.name.text === 'global' &&
    !node
      .getChildren()
      .some(child => child.kind === NativeSyntaxKind.ModuleKeyword)
    ? ts.NodeFlags.GlobalAugmentation
    : ts.NodeFlags.None;
}

const translatedNodeFlags = new Map<number, number>();

function translateNodeFlags(node: NativeNode): ts.NodeFlags {
  let flags = translatedNodeFlags.get(node.flags);
  if (flags == null) {
    flags = translateFlags(NODE_FLAG_TRANSLATIONS, node.flags);
    translatedNodeFlags.set(node.flags, flags);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- translated member by member above
  return node.kind === NativeSyntaxKind.ModuleDeclaration
    ? flags | getModuleDeclarationFlags(node)
    : flags;
}

const KIND_PROPERTIES = new Set(['keywordToken', 'operator', 'token']);

const NATIVE_NODE = Symbol('nativeNode');

const EAGER_KEYS = new Set(['end', 'flags', 'kind', 'pos']);

const CLASSIC_ONLY_KEYS = [
  'default',
  'escapedText',
  'modifierFlagsCache',
  'parent',
  'parseDiagnostics',
];

const FORWARDED_METHODS = [
  'getEnd',
  'getFullStart',
  'getFullWidth',
  'getLineAndCharacterOfPosition',
  'getLineStarts',
  'getPositionOfLineAndCharacter',
];

interface NodeView {
  [NATIVE_NODE]: NativeNode;
  end: number;
  flags: number;
  kind: number;
  pos: number;
}

function getGetterNames(prototype: object) {
  const getters = new Set<string>();
  for (
    let current: object | null = prototype;
    current && current !== Object.prototype;
    current = Object.getPrototypeOf(current) as object | null
  ) {
    for (const [name, descriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(current),
    )) {
      if (descriptor.get && !NATIVE_ONLY_KEYS.has(name)) {
        getters.add(name);
      }
    }
  }
  return getters;
}

/** Native hoists JSDoc types into JS ASTs; classic leaves them in comments. */
function isReparsed(node: NativeNode): boolean {
  return (node.flags & NativeNodeFlags.Reparsed) !== 0;
}

const NATIVE_ONLY_KEYS = new Set([
  'childMask',
  'data',
  'dataType',
  'defaultType',
  'id',
  'keyword',
  'modifierFlags',
  'next',
  'parentIndex',
  'postfixToken',
  'sourceFile',
]);

function isHeritageTypeReference(node: NativeNode): boolean {
  return (
    node.kind === NativeSyntaxKind.TypeReference &&
    node.parent.kind === NativeSyntaxKind.HeritageClause
  );
}

/** Classic spells a heritage element's qualified name as property accesses. */
function isHeritageQualifiedName(node: NativeNode): boolean {
  if (node.kind !== NativeSyntaxKind.QualifiedName) {
    return false;
  }
  let typeName = node;
  while (typeName.parent.kind === NativeSyntaxKind.QualifiedName) {
    typeName = typeName.parent;
  }
  return isHeritageTypeReference(typeName.parent);
}

function translateNodeKind(node: NativeNode) {
  if (isHeritageTypeReference(node)) {
    return ts.SyntaxKind.ExpressionWithTypeArguments;
  }
  return isHeritageQualifiedName(node)
    ? ts.SyntaxKind.PropertyAccessExpression
    : translateKind(node.kind);
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

export function createNativeNodeAdapter({
  getSyntacticDiagnostics,
}: NativeNodeAdapterOptions): NativeNodeAdapter {
  const VIEW = Symbol('view');
  const nativeArrayToAdapter = new WeakMap<
    NativeNodeArray<NativeNode>,
    ts.NodeArray<ts.Node>
  >();
  const nativeToChildren = new WeakMap<NativeNode, readonly ts.Node[]>();

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
    Object.assign(adaptedNodeArray, {
      end: nodes.end,
      hasTrailingComma: nodes.hasTrailingComma,
      pos: nodes.pos,
      transformFlags: nodes.transformFlags,
    });
    for (const node of nodes) {
      if (!isReparsed(node)) {
        adapted.push(wrapNode(node));
      }
    }
    return adaptedNodeArray;
  }

  function createToken(
    native: NativeNode,
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
    (token as unknown as NodeView)[NATIVE_NODE] = native;
    return token;
  }

  /** Classic splits a JSX closing tag's `</` into `<` and `/`; native keeps it whole. */
  function getChildren(node: NativeNode): readonly ts.Node[] {
    const cached = nativeToChildren.get(node);
    if (cached) {
      return cached;
    }

    const parent = wrapNode(node);
    const children = node.getChildren().flatMap(child => {
      if (isReparsed(child)) {
        return [];
      }
      if (child.kind !== NativeSyntaxKind.LessThanSlashToken) {
        return [wrapNode(child)];
      }
      return [
        createToken(
          child,
          ts.SyntaxKind.LessThanToken,
          child.pos,
          child.end - 1,
          parent,
        ),
        createToken(
          child,
          ts.SyntaxKind.SlashToken,
          child.end - 1,
          child.end,
          parent,
        ),
      ];
    });
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

  function readNative(target: NativeNode, property: string): unknown {
    const value: unknown = Reflect.get(target, property);
    if (typeof value === 'number' && KIND_PROPERTIES.has(property)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- a kind read from a native node
      return translateKind(value);
    }
    if (isNativeNode(value)) {
      return isReparsed(value) ? undefined : wrapNode(value);
    }
    if (isNativeNodeArray(value)) {
      const adapted = adaptArray(value);
      return adapted.length === 0 &&
        property !== 'statements' &&
        hasReparsedNode(value)
        ? undefined
        : adapted;
    }
    return value;
  }

  /** Classic has no array at all where native only synthesized nodes, such as a nested namespace's `export`. */
  function hasReparsedNode(nodes: NativeNodeArray<NativeNode>): boolean {
    for (const node of nodes) {
      if (isReparsed(node)) {
        return true;
      }
    }
    return false;
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
    const postfix: unknown = Reflect.get(target, 'postfixToken');
    return isNativeNode(postfix) && postfix.kind === kind
      ? wrapNode(postfix)
      : undefined;
  }

  const nodeMethods = {
    forEachChild<T>(
      this: ts.Node,
      visitor: (child: ts.Node) => T,
      visitArray?: (children: ts.NodeArray<ts.Node>) => T,
    ): T | undefined {
      return unwrap(this).forEachChild(
        child => (isReparsed(child) ? undefined : visitor(wrapNode(child))),
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

  function readClassic(
    target: NativeNode,
    property: string,
    receiver: unknown,
  ): unknown {
    switch (property) {
      case 'default':
        return readNative(target, 'defaultType');
      case 'elements':
        return target.kind === NativeSyntaxKind.ImportAttributes
          ? readNative(target, 'attributes')
          : readNative(target, property);
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
        if (isHeritageTypeReference(target)) {
          return wrapNode(
            (target as unknown as { typeName: NativeNode }).typeName,
          );
        }
        return isHeritageQualifiedName(target)
          ? readNative(target, 'left')
          : readNative(target, property);
      // Classic only counts modifiers where they are allowed to appear.
      case 'modifierFlagsCache':
        return (
          // eslint-disable-next-line @typescript-eslint/no-deprecated -- the native backend runs alongside TypeScript 6
          (ts.canHaveModifiers(receiver as ts.Node)
            ? ((target as NativeNode & { modifierFlags?: number })
                .modifierFlags ?? ts.ModifierFlags.None)
            : ts.ModifierFlags.None) | ts.ModifierFlags.HasComputedFlags
        );
      case 'name':
        return isHeritageQualifiedName(target)
          ? readNative(target, 'right')
          : readNative(target, property);
      case 'parseDiagnostics': {
        if (target.kind !== NativeSyntaxKind.SourceFile) {
          return undefined;
        }
        const { fileName } = target as NativeSourceFile;
        return getSyntacticDiagnostics(fileName).map(diagnostic =>
          toClassicDiagnostic(diagnostic, () => receiver as ts.SourceFile),
        );
      }
      case 'questionToken':
        return readPostfixToken(
          target,
          property,
          NativeSyntaxKind.QuestionToken,
        );
      default:
        return readNative(target, property);
    }
  }

  const viewPrototypes = new WeakMap<object, object>();

  function memoize(view: object, name: string, value: unknown): void {
    Object.defineProperty(view, name, {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
  }

  function createViewPrototype(nativePrototype: object) {
    const prototype: Record<string, unknown> = {};
    for (const name of FORWARDED_METHODS) {
      if (name in nativePrototype) {
        prototype[name] = function (this: NodeView, ...args: unknown[]) {
          return (
            this[NATIVE_NODE] as unknown as Record<
              string,
              (...args: unknown[]) => unknown
            >
          )[name](...args);
        };
      }
    }
    Object.assign(prototype, nodeMethods);
    for (const name of new Set([
      ...getGetterNames(nativePrototype),
      ...CLASSIC_ONLY_KEYS,
    ])) {
      if (EAGER_KEYS.has(name)) {
        continue;
      }
      Object.defineProperty(prototype, name, {
        configurable: true,
        enumerable: false,
        get(this: NodeView) {
          const value = readClassic(this[NATIVE_NODE], name, this);
          memoize(this, name, value);
          return value;
        },
        set(this: NodeView, value: unknown) {
          memoize(this, name, value);
        },
      });
    }
    return prototype;
  }

  function getViewPrototype(node: NativeNode) {
    const nativePrototype = Object.getPrototypeOf(node) as object;
    let prototype = viewPrototypes.get(nativePrototype);
    if (!prototype) {
      prototype = createViewPrototype(nativePrototype);
      viewPrototypes.set(nativePrototype, prototype);
    }
    return prototype;
  }

  function unwrap(node: ts.Node): NativeNode {
    const native = (node as unknown as Partial<NodeView>)[NATIVE_NODE];
    if (!native) {
      throw new Error('The node was not created by a native node adapter.');
    }
    return native;
  }

  function wrapNode(node: NativeNode): ts.Node {
    const cached = (node as NativeNode & { [VIEW]?: ts.Node })[VIEW];
    if (cached) {
      return cached;
    }
    const view = Object.create(getViewPrototype(node)) as NodeView;
    view[NATIVE_NODE] = node;
    view.kind = translateNodeKind(node);
    view.pos = node.pos;
    view.end = node.end;
    view.flags = translateNodeFlags(node);
    const adapted = view as unknown as ts.Node;
    (node as NativeNode & { [VIEW]?: ts.Node })[VIEW] = adapted;
    return adapted;
  }

  return { unwrapNode: unwrap, wrapNode };
}
