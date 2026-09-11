import type {
  Declaration as NativeDeclaration,
  Node as NativeNode,
} from '@typescript/native/unstable/ast';
import type {
  Checker as NativeChecker,
  IndexInfo as NativeIndexInfo,
  JSDocTagInfo as NativeJSDocTagInfo,
  NodeHandle as NativeNodeHandle,
  Project as NativeProject,
  Signature as NativeSignature,
  Symbol as NativeSymbol,
  Type as NativeType,
  TypePredicate as NativeTypePredicate,
} from '@typescript/native/unstable/sync';

import {
  getJSDocTags,
  getTextOfJSDocComment,
} from '@typescript/native/unstable/ast';
import { ObjectFlags, TypeFlags } from '@typescript/native/unstable/sync';
import * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';

/**
 * Translates the native preview API's type model into the classic `typescript`
 * type model.
 *
 * The two models agree on values but not on access. `TypeFlags`, `SymbolFlags`,
 * and `ObjectFlags` are numerically identical between the two compilers, so
 * flags pass through untouched. What differs is that the native API is a remote
 * object protocol: relationships between objects are lazy methods over handle
 * ids (`type.getSymbol()`) where the classic API exposes plain properties
 * (`type.symbol`). Each wrapper here is a proxy presenting the classic property
 * surface, fetching through the native method on read.
 *
 * A zero handle means "no such relationship". Several native getters throw
 * rather than return `undefined` in that case, so every wrapper reading one
 * checks the raw handle, or the flags that imply it, first.
 */
export interface NativeTypeAdapter {
  unwrapSignature: (signature: ts.Signature) => NativeSignature;
  unwrapSymbol: (symbol: ts.Symbol) => NativeSymbol;
  unwrapType: (type: ts.Type) => NativeType;
  wrapIndexInfo: (info: NativeIndexInfo) => ts.IndexInfo;
  wrapSignature: {
    (signature: NativeSignature): ts.Signature;
    (signature: NativeSignature | undefined): ts.Signature | undefined;
  };
  wrapSymbol: {
    (symbol: NativeSymbol): ts.Symbol;
    (symbol: NativeSymbol | undefined): ts.Symbol | undefined;
  };
  wrapType: {
    (type: NativeType): ts.Type;
    (type: NativeType | undefined): ts.Type | undefined;
  };
  wrapTypePredicate: (
    predicate: NativeTypePredicate | undefined,
  ) => ts.TypePredicate | undefined;
}

export interface NativeTypeAdapterContext {
  checker: NativeChecker;
  nodeAdapter: NativeNodeAdapter;
  project: NativeProject;
}

/**
 * The native shapes behind the public interfaces, as this module reads them:
 * raw relationship handles alongside the kind-specific getters that the public
 * `Type` interface only declares on its subtypes.
 */
interface NativeTypeInternals {
  aliasSymbol: number;
  baseType: number;
  checkType: number;
  extendsType: number;
  getBaseType: () => NativeType;
  getCheckType: () => NativeType;
  getConstraint: () => NativeType | undefined;
  getDefault: () => NativeType | undefined;
  getExtendsType: () => NativeType;
  getFalseType: () => NativeType;
  getFreshType: () => NativeType | undefined;
  getIndexType: () => NativeType;
  getLocalTypeParameters: () => readonly NativeType[];
  getObjectType: () => NativeType;
  getOuterTypeParameters: () => readonly NativeType[];
  getRegularType: () => NativeType | undefined;
  getTarget: () => NativeType;
  getTrueType: () => NativeType;
  getTypeParameters: () => readonly NativeType[];
  indexType: number;
  objectFlags: ObjectFlags;
  objectType: number;
  substConstraint: number;
  symbol: number;
  target: number;
}

/**
 * `ObjectFlags` bits above `ObjectFlags.Mapped` are numbered differently by the
 * two compilers, so — as with `NodeFlags` on nodes — they are paired up by
 * member name rather than copied through. Copying them through would silently
 * read a different flag: classic's `InstantiationExpressionType` is native's
 * `IsGenericObjectType`, which is set on a great many generic object types.
 *
 * Only single-bit members are translated; the composite masks are built from
 * those bits anyway.
 */
const OBJECT_FLAG_TRANSLATIONS: readonly (readonly [number, number])[] =
  Object.entries(ObjectFlags).flatMap(([name, value]) => {
    const classic: unknown =
      ts.ObjectFlags[name as keyof typeof ts.ObjectFlags];
    const native: number = typeof value === 'number' ? value : 0;
    const isSingleBit = native > 0 && (native & (native - 1)) === 0;
    return isSingleBit && typeof classic === 'number'
      ? [[native, classic] as const]
      : [];
  });

function translateObjectFlags(nativeFlags: number): ts.ObjectFlags {
  let flags = 0;
  for (const [nativeFlag, classicFlag] of OBJECT_FLAG_TRANSLATIONS) {
    if (nativeFlags & nativeFlag) {
      flags |= classicFlag;
    }
  }
  return flags;
}

const UNWRAP_ERROR =
  'The value was not created by this native type adapter. Native and classic type objects cannot be mixed.';

export function createNativeTypeAdapter({
  checker,
  nodeAdapter,
  project,
}: NativeTypeAdapterContext): NativeTypeAdapter {
  const nativeToWrappedType = new WeakMap<NativeType, ts.Type>();
  const wrappedToNativeType = new WeakMap<ts.Type, NativeType>();
  const nativeToWrappedSymbol = new WeakMap<NativeSymbol, ts.Symbol>();
  const wrappedToNativeSymbol = new WeakMap<ts.Symbol, NativeSymbol>();
  const nativeToWrappedSignature = new WeakMap<NativeSignature, ts.Signature>();
  const wrappedToNativeSignature = new WeakMap<ts.Signature, NativeSignature>();

  // `Array#map` would otherwise resolve each wrapper to its widest overload.
  const toSignature = (signature: NativeSignature): ts.Signature =>
    wrapSignature(signature);
  const toSymbol = (symbol: NativeSymbol): ts.Symbol => wrapSymbol(symbol);
  const toType = (type: NativeType): ts.Type => wrapType(type);

  function resolveDeclaration(
    handle: NativeNodeHandle<NativeDeclaration> | undefined,
  ): ts.Declaration | undefined {
    const resolved = resolveNativeDeclaration(handle);
    return resolved && (nodeAdapter.wrapNode(resolved) as ts.Declaration);
  }

  function resolveNativeDeclaration(
    handle: NativeNodeHandle<NativeDeclaration> | undefined,
  ): NativeNode | undefined {
    return handle?.resolve(project);
  }

  /**
   * Signature-level JSDoc has no native counterpart — `Checker` only exposes
   * `getJsDocTagsOfSymbol`, and a signature carries no symbol. Reading the tags
   * off the signature's own declaration is the same source classic reads, and
   * keeps per-overload tags distinct where a symbol lookup would merge them.
   */
  function jsDocTagsOfDeclaration(
    handle: NativeNodeHandle<NativeDeclaration> | undefined,
  ): ts.JSDocTagInfo[] {
    const declaration = resolveNativeDeclaration(handle);
    if (!declaration) {
      return [];
    }
    return getJSDocTags(declaration).map(tag => {
      const text = getTextOfJSDocComment(tag.comment);
      return {
        name: tag.tagName.text,
        text: text ? [{ kind: 'text', text }] : undefined,
      };
    });
  }

  /**
   * Classic models "no type arguments" and "no type parameters" as `undefined`
   * where the native API returns an empty array, and rules branch on
   * truthiness.
   */
  function wrapTypeList(types: readonly NativeType[]): ts.Type[] | undefined {
    return types.length ? types.map(toType) : undefined;
  }

  function wrapType(type: NativeType): ts.Type;
  function wrapType(type: NativeType | undefined): ts.Type | undefined;
  function wrapType(type: NativeType | undefined): ts.Type | undefined {
    if (!type) {
      return undefined;
    }

    const cached = nativeToWrappedType.get(type);
    if (cached) {
      return cached;
    }

    const wrapped = new Proxy(type, {
      get(target, property) {
        const native = target as NativeType & NativeTypeInternals;
        switch (property) {
          // `Type`
          case 'symbol':
            return native.symbol ? wrapSymbol(target.getSymbol()) : undefined;
          case 'aliasSymbol':
            return native.aliasSymbol
              ? wrapSymbol(target.getAliasSymbol())
              : undefined;
          case 'aliasTypeArguments':
            return wrapTypeList(target.getAliasTypeArguments());
          case 'objectFlags':
            return translateObjectFlags(native.objectFlags);
          case 'checker':
            // `typescript`'s back-reference from a type to its checker is an
            // implementation detail with no native equivalent.
            return undefined;

          // `UnionOrIntersectionType` and `TemplateLiteralType`
          case 'types':
            return (
              target as { getTypes?: () => readonly NativeType[] | undefined }
            )
              .getTypes?.()
              ?.map(toType);

          // `TypeReference.typeArguments`, which the native API exposes only
          // through the checker.
          case 'typeArguments':
            return target.isTypeReference()
              ? checker.getTypeArguments(target).map(toType)
              : undefined;

          // `InterfaceType.thisType` has no native equivalent: the native
          // `getTypeParameters` deliberately excludes it, and nothing else
          // surfaces it. Failing loudly keeps the gap visible instead of
          // silently making every `thisType` comparison false.
          case 'thisType':
            throw new Error(
              'Type#thisType is not available on the TypeScript native preview API.',
            );

          // `TypeReference.target`, plus `IndexType.type` and
          // `StringMappingType.type`, which classic spells differently but the
          // native API exposes through the same `target` handle.
          case 'target':
          case 'type':
            return native.target ? wrapType(native.getTarget()) : undefined;

          // `InterfaceType`
          case 'typeParameters':
            return target.isClassOrInterface()
              ? wrapTypeList(native.getTypeParameters())
              : undefined;
          case 'outerTypeParameters':
            return target.isClassOrInterface()
              ? wrapTypeList(native.getOuterTypeParameters())
              : undefined;
          case 'localTypeParameters':
            return target.isClassOrInterface()
              ? wrapTypeList(native.getLocalTypeParameters())
              : undefined;

          // `IndexedAccessType`
          case 'objectType':
            return native.objectType
              ? wrapType(native.getObjectType())
              : undefined;
          case 'indexType':
            return native.indexType
              ? wrapType(native.getIndexType())
              : undefined;

          // `ConditionalType`
          case 'checkType':
            return native.checkType
              ? wrapType(native.getCheckType())
              : undefined;
          case 'extendsType':
            return native.extendsType
              ? wrapType(native.getExtendsType())
              : undefined;
          case 'resolvedTrueType':
            return target.isConditionalType()
              ? wrapType(native.getTrueType())
              : undefined;
          case 'resolvedFalseType':
            return target.isConditionalType()
              ? wrapType(native.getFalseType())
              : undefined;

          // `SubstitutionType`
          case 'baseType':
            return native.baseType ? wrapType(native.getBaseType()) : undefined;

          // `TypeParameter.constraint` and `SubstitutionType.constraint`
          case 'constraint':
            return getConstraint(target);
          case 'default':
            return target.isTypeParameter()
              ? wrapType(native.getDefault())
              : undefined;

          // `FreshableType`
          case 'freshType':
            return target.flags & TypeFlags.Freshable
              ? wrapType(native.getFreshType())
              : undefined;
          case 'regularType':
            return target.flags & TypeFlags.Freshable
              ? wrapType(native.getRegularType())
              : undefined;

          // Every native method that yields native objects has to wrap its
          // result; anything reaching a rule unwrapped would fail the first
          // time it was passed back to the checker.
          case 'getSymbol':
            // eslint-disable-next-line @typescript-eslint/internal/no-poorly-typed-ts-props -- this is the implementation of that property
            return () => wrapped.symbol;
          case 'getProperties':
            return () => target.getProperties().map(toSymbol);
          case 'getProperty':
            return (name: string) => wrapSymbol(target.getProperty(name));
          case 'getApparentProperties':
            return () => target.getApparentProperties().map(toSymbol);
          case 'getApparentType':
            return () => wrapType(target.getApparentType());
          case 'getReducedType':
            return () => wrapType(target.getReducedType());
          case 'getCallSignatures':
            return () => target.getCallSignatures().map(toSignature);
          case 'getConstructSignatures':
            return () => target.getConstructSignatures().map(toSignature);
          case 'getNonNullableType':
            return () => wrapType(target.getNonNullableType());
          case 'getStringIndexType':
            return () => wrapType(target.getStringIndexType());
          case 'getNumberIndexType':
            return () => wrapType(target.getNumberIndexType());
          case 'getIndexInfos':
            return () => target.getIndexInfos().map(wrapIndexInfo);
          case 'getAliasSymbol':
            return () => wrapped.aliasSymbol;
          case 'getAliasTypeArguments':
            return () => target.getAliasTypeArguments().map(toType);
          case 'getBaseTypes':
            return () => target.getBaseTypes()?.map(toType);
          case 'getTypes':
            return () => (wrapped as ts.UnionOrIntersectionType).types;
          case 'getTarget':
            return () => (wrapped as ts.TypeReference).target;
          case 'getFreshType':
            return () => (wrapped as ts.FreshableType).freshType;
          case 'getRegularType':
            return () => (wrapped as ts.FreshableType).regularType;
          case 'getTypeParameters':
            return () => (wrapped as ts.InterfaceType).typeParameters;
          case 'getOuterTypeParameters':
            return () => (wrapped as ts.InterfaceType).outerTypeParameters;
          case 'getLocalTypeParameters':
            return () => (wrapped as ts.InterfaceType).localTypeParameters;
          case 'getObjectType':
            return () => (wrapped as ts.IndexedAccessType).objectType;
          case 'getIndexType':
            return () => (wrapped as ts.IndexedAccessType).indexType;
          case 'getCheckType':
            return () => (wrapped as ts.ConditionalType).checkType;
          case 'getExtendsType':
            return () => (wrapped as ts.ConditionalType).extendsType;
          case 'getTrueType':
            return () => (wrapped as ts.ConditionalType).resolvedTrueType;
          case 'getFalseType':
            return () => (wrapped as ts.ConditionalType).resolvedFalseType;
          case 'getBaseType':
            return () => (wrapped as ts.SubstitutionType).baseType;

          // Classic method names with no native counterpart, or with different
          // spellings or semantics.
          case 'getFlags':
            return () => target.flags;
          case 'getConstraint':
            return () => getConstraint(target);
          case 'getDefault':
            return () =>
              target.isTypeParameter()
                ? wrapType(native.getDefault())
                : undefined;
          case 'isUnion':
            return () => target.isUnionType();
          case 'isIntersection':
            return () => target.isIntersectionType();
          case 'isUnionOrIntersection':
            return () => (target.flags & TypeFlags.UnionOrIntersection) !== 0;
          case 'isLiteral':
            // Classic `isLiteral()` covers only string and number literals;
            // native `isLiteralType()` also covers bigint and boolean.
            return () =>
              (target.flags &
                (TypeFlags.StringLiteral | TypeFlags.NumberLiteral)) !==
              0;
          case 'isStringLiteral':
            return () => target.isStringLiteralType();
          case 'isNumberLiteral':
            return () => target.isNumberLiteralType();
          case 'isClass':
            return () => (native.objectFlags & ObjectFlags.Class) !== 0;
          case 'isIndexType':
            return () => (target.flags & TypeFlags.Index) !== 0;

          default:
            return bindNativeMethod(
              Reflect.get(target, property, target),
              target,
            );
        }
      },
    }) as unknown as ts.Type;

    nativeToWrappedType.set(type, wrapped);
    wrappedToNativeType.set(wrapped, type);
    return wrapped;
  }

  function getConstraint(type: NativeType): ts.Type | undefined {
    const native = type as NativeType & NativeTypeInternals;
    if (type.isTypeParameter()) {
      return wrapType(native.getConstraint());
    }
    if (type.flags & TypeFlags.Substitution) {
      return native.substConstraint
        ? wrapType(native.getConstraint())
        : undefined;
    }
    return undefined;
  }

  function wrapSymbol(symbol: NativeSymbol): ts.Symbol;
  function wrapSymbol(symbol: NativeSymbol | undefined): ts.Symbol | undefined;
  function wrapSymbol(symbol: NativeSymbol | undefined): ts.Symbol | undefined {
    if (!symbol) {
      return undefined;
    }

    const cached = nativeToWrappedSymbol.get(symbol);
    if (cached) {
      return cached;
    }

    let declarations: ts.Declaration[] | undefined;
    let members: ts.SymbolTable | undefined;
    let exports: ts.SymbolTable | undefined;

    const wrapped = new Proxy(symbol, {
      get(target, property) {
        switch (property) {
          case 'declarations':
            // eslint-disable-next-line @typescript-eslint/internal/no-poorly-typed-ts-props -- reading the native symbol, to implement the classic property
            return (declarations ??= target.declarations
              .map(resolveDeclaration)
              .filter(declaration => declaration != null));
          case 'valueDeclaration':
            return resolveDeclaration(target.valueDeclaration);
          case 'parent':
            return wrapSymbol(target.getParent());
          case 'members':
            return (members ??= wrapSymbolTable(target.getMembers()));
          case 'exports':
            return (exports ??= wrapSymbolTable(target.getExports()));

          case 'getName':
            return () => target.name;
          case 'getEscapedName':
            return () => target.escapedName;
          case 'getFlags':
            return () => target.flags;
          case 'getDeclarations':
            // eslint-disable-next-line @typescript-eslint/internal/no-poorly-typed-ts-props -- this is the implementation of that method
            return () => wrapped.declarations;
          case 'getParent':
            return () => wrapSymbol(target.getParent());
          case 'getMembers':
            return () => wrapped.members;
          case 'getExports':
            return () => wrapped.exports;
          case 'getExportSymbol':
            return () => wrapSymbol(target.getExportSymbol());
          case 'getJsDocTags':
            return (): ts.JSDocTagInfo[] =>
              wrapJSDocTags(target.getJsDocTags(checker));
          case 'getDocumentationComment':
            return (): ts.SymbolDisplayPart[] => {
              const comment = target.getDocumentationComment(checker);
              return comment ? [{ kind: 'text', text: comment }] : [];
            };

          default:
            return bindNativeMethod(
              Reflect.get(target, property, target),
              target,
            );
        }
      },
    }) as unknown as ts.Symbol;

    nativeToWrappedSymbol.set(symbol, wrapped);
    wrappedToNativeSymbol.set(wrapped, symbol);
    return wrapped;
  }

  function wrapSymbolTable(
    table: ReadonlyMap<string, NativeSymbol>,
  ): ts.SymbolTable {
    const wrappedTable = new Map<string, ts.Symbol>();
    for (const [name, member] of table) {
      wrappedTable.set(name, wrapSymbol(member));
    }
    return wrappedTable as unknown as ts.SymbolTable;
  }

  function wrapSignature(signature: NativeSignature): ts.Signature;
  function wrapSignature(
    signature: NativeSignature | undefined,
  ): ts.Signature | undefined;
  function wrapSignature(
    signature: NativeSignature | undefined,
  ): ts.Signature | undefined {
    if (!signature) {
      return undefined;
    }

    const cached = nativeToWrappedSignature.get(signature);
    if (cached) {
      return cached;
    }

    const wrapped = new Proxy(signature, {
      get(target, property) {
        switch (property) {
          case 'declaration':
            return resolveDeclaration(target.declaration);
          case 'parameters':
            return target.getParameters().map(toSymbol);
          case 'typeParameters':
            return wrapTypeList(target.getTypeParameters());
          case 'thisParameter':
            return wrapSymbol(target.getThisParameter());
          case 'target':
            return wrapSignature(target.getTarget());
          case 'resolvedReturnType':
            return wrapType(target.getReturnType());

          case 'getDeclaration':
            return () => wrapped.declaration;
          case 'getParameters':
            return () => wrapped.parameters;
          case 'getTypeParameters':
            return () => wrapped.typeParameters;
          case 'getReturnType':
            return () => wrapType(target.getReturnType());
          case 'getThisParameter':
            return () => wrapped.thisParameter;
          case 'getTarget':
            return () => wrapSignature(target.getTarget());
          case 'getTypeParameterAtPosition':
            return (position: number) =>
              wrapType(target.getTypeParameterAtPosition(position));
          case 'getDocumentationComment':
            return (): ts.SymbolDisplayPart[] => [];
          case 'getJsDocTags':
            return (): ts.JSDocTagInfo[] =>
              jsDocTagsOfDeclaration(target.declaration);

          default:
            return bindNativeMethod(
              Reflect.get(target, property, target),
              target,
            );
        }
      },
    }) as unknown as ts.Signature;

    nativeToWrappedSignature.set(signature, wrapped);
    wrappedToNativeSignature.set(wrapped, signature);
    return wrapped;
  }

  function wrapIndexInfo(info: NativeIndexInfo): ts.IndexInfo {
    return {
      type: wrapType(info.valueType),
      declaration: resolveDeclaration(
        info.declaration,
      ) as ts.IndexSignatureDeclaration,
      isReadonly: info.isReadonly,
      keyType: wrapType(info.keyType),
    };
  }

  /**
   * Native JSDoc text is already rendered to a string, where classic hands back
   * the display parts it was rendered from.
   */
  function wrapJSDocTags(
    tags: readonly NativeJSDocTagInfo[],
  ): ts.JSDocTagInfo[] {
    return tags.map(tag => ({
      name: tag.name,
      text: tag.text == null ? undefined : [{ kind: 'text', text: tag.text }],
    }));
  }

  function wrapTypePredicate(
    predicate: NativeTypePredicate | undefined,
  ): ts.TypePredicate | undefined {
    return (
      predicate &&
      ({
        ...predicate,
        type: wrapType(predicate.type),
      } as ts.TypePredicate)
    );
  }

  /**
   * Native-only members pass through untouched; methods are bound so that
   * calling them through the proxy still sees the native receiver.
   */
  function bindNativeMethod(value: unknown, target: object): unknown {
    return typeof value === 'function' ? value.bind(target) : value;
  }

  return {
    unwrapSignature: signature =>
      unwrap(wrappedToNativeSignature.get(signature)),
    unwrapSymbol: symbol => unwrap(wrappedToNativeSymbol.get(symbol)),
    unwrapType: type => unwrap(wrappedToNativeType.get(type)),
    wrapIndexInfo,
    wrapSignature,
    wrapSymbol,
    wrapType,
    wrapTypePredicate,
  };
}

function unwrap<T>(native: T | undefined): T {
  if (!native) {
    throw new Error(UNWRAP_ERROR);
  }
  return native;
}
