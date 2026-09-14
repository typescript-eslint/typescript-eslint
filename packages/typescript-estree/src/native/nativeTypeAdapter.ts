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

import { createFlagTranslations, translateFlags } from './translateFlags';

/**
 * Native exposes relationships as lazy methods over handle ids where classic
 * exposes plain properties. A zero handle means "no such relationship", and
 * several native getters throw rather than return `undefined` for one, so every
 * wrapper checks the raw handle — or the flags implying it — before reading.
 */
export interface NativeTypeAdapter {
  toSignature: (signature: NativeSignature) => ts.Signature;
  toSymbol: (symbol: NativeSymbol) => ts.Symbol;
  toType: (type: NativeType) => ts.Type;
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
 * Above `Mapped` the numbering diverges: classic's `InstantiationExpressionType`
 * is native's `IsGenericObjectType`, so passing flags through reads the wrong one.
 */
const OBJECT_FLAG_TRANSLATIONS = createFlagTranslations(
  ObjectFlags,
  ts.ObjectFlags,
);

const TYPE_GETTER_PROPERTIES = new Map<string, string>([
  ['getAliasSymbol', 'aliasSymbol'],
  ['getBaseType', 'baseType'],
  ['getCheckType', 'checkType'],
  ['getConstraint', 'constraint'],
  ['getDefault', 'default'],
  ['getExtendsType', 'extendsType'],
  ['getFalseType', 'resolvedFalseType'],
  ['getFlags', 'flags'],
  ['getFreshType', 'freshType'],
  ['getIndexType', 'indexType'],
  ['getLocalTypeParameters', 'localTypeParameters'],
  ['getObjectType', 'objectType'],
  ['getOuterTypeParameters', 'outerTypeParameters'],
  ['getRegularType', 'regularType'],
  ['getSymbol', 'symbol'],
  ['getTarget', 'target'],
  ['getTrueType', 'resolvedTrueType'],
  ['getTypeParameters', 'typeParameters'],
  ['getTypes', 'types'],
]);

/** `type` is `IndexType`'s spelling of the `target` handle. */
const TYPE_HANDLE_PROPERTIES = new Map<
  string,
  readonly [
    handle: keyof NativeTypeInternals,
    get: (native: NativeTypeInternals) => NativeType,
  ]
>([
  ['baseType', ['baseType', native => native.getBaseType()]],
  ['checkType', ['checkType', native => native.getCheckType()]],
  ['extendsType', ['extendsType', native => native.getExtendsType()]],
  ['indexType', ['indexType', native => native.getIndexType()]],
  ['objectType', ['objectType', native => native.getObjectType()]],
  ['target', ['target', native => native.getTarget()]],
  ['type', ['target', native => native.getTarget()]],
]);

const SYMBOL_GETTER_PROPERTIES = new Map<string, string>([
  ['getDeclarations', 'declarations'],
  ['getEscapedName', 'escapedName'],
  ['getExports', 'exports'],
  ['getFlags', 'flags'],
  ['getMembers', 'members'],
  ['getName', 'name'],
  ['getParent', 'parent'],
]);

const SIGNATURE_GETTER_PROPERTIES = new Map<string, string>([
  ['getDeclaration', 'declaration'],
  ['getParameters', 'parameters'],
  ['getReturnType', 'resolvedReturnType'],
  ['getTarget', 'target'],
  ['getThisParameter', 'thisParameter'],
  ['getTypeParameters', 'typeParameters'],
]);

/** Remembers the first value, `undefined` included, to avoid a round trip. */
function createMemo(): (property: string, compute: () => unknown) => unknown {
  const values = new Map<string, unknown>();
  return (property, compute) => {
    if (!values.has(property)) {
      values.set(property, compute());
    }
    return values.get(property);
  };
}

function getterFor(
  wrapped: object,
  getters: ReadonlyMap<string, string>,
  property: string | symbol,
): (() => unknown) | undefined {
  const source = typeof property === 'string' && getters.get(property);
  return source
    ? () => (wrapped as Record<string, unknown>)[source]
    : undefined;
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

  /** A signature carries no symbol, and a symbol lookup would merge overloads. */
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
        const getter = getterFor(wrapped, TYPE_GETTER_PROPERTIES, property);
        if (getter) {
          return getter;
        }
        const handleProperty =
          typeof property === 'string' && TYPE_HANDLE_PROPERTIES.get(property);
        if (handleProperty) {
          const [handle, get] = handleProperty;
          return native[handle] ? wrapType(get(native)) : undefined;
        }
        switch (property) {
          case 'symbol':
            return native.symbol ? wrapSymbol(target.getSymbol()) : undefined;
          case 'aliasSymbol':
            return native.aliasSymbol
              ? wrapSymbol(target.getAliasSymbol())
              : undefined;
          case 'aliasTypeArguments':
            return wrapTypeList(target.getAliasTypeArguments());
          case 'objectFlags':
            return translateFlags(OBJECT_FLAG_TRANSLATIONS, native.objectFlags);
          // An implementation detail of `typescript`, with no native equivalent.
          case 'checker':
            return undefined;

          case 'types':
            return (
              target as { getTypes?: () => readonly NativeType[] | undefined }
            )
              .getTypes?.()
              ?.map(toType);

          case 'typeArguments':
            return target.isTypeReference()
              ? checker.getTypeArguments(target).map(toType)
              : undefined;

          case 'thisType':
            throw new Error(
              'Type#thisType is not available on the TypeScript native preview API.',
            );

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

          case 'resolvedTrueType':
            return target.isConditionalType()
              ? wrapType(native.getTrueType())
              : undefined;
          case 'resolvedFalseType':
            return target.isConditionalType()
              ? wrapType(native.getFalseType())
              : undefined;

          case 'constraint':
            return getConstraint(target);
          case 'default':
            return target.isTypeParameter()
              ? wrapType(native.getDefault())
              : undefined;

          case 'freshType':
            return target.flags & TypeFlags.Freshable
              ? wrapType(native.getFreshType())
              : undefined;
          case 'regularType':
            return target.flags & TypeFlags.Freshable
              ? wrapType(native.getRegularType())
              : undefined;

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
          case 'getAliasTypeArguments':
            return () => target.getAliasTypeArguments().map(toType);
          case 'getBaseTypes':
            return () => target.getBaseTypes()?.map(toType);

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

    const memo = createMemo();

    const wrapped = new Proxy(symbol, {
      get(target, property) {
        const getter = getterFor(wrapped, SYMBOL_GETTER_PROPERTIES, property);
        if (getter) {
          return getter;
        }
        switch (property) {
          case 'declarations':
            return memo(property, () =>
              // eslint-disable-next-line @typescript-eslint/internal/no-poorly-typed-ts-props -- reading the native symbol, to implement the classic property
              target.declarations
                .map(resolveDeclaration)
                .filter(declaration => declaration != null),
            );
          case 'valueDeclaration':
            return memo(property, () =>
              resolveDeclaration(target.valueDeclaration),
            );
          case 'parent':
            return memo(property, () => wrapSymbol(target.getParent()));
          case 'members':
            return memo(property, () => wrapSymbolTable(target.getMembers()));
          case 'exports':
            return memo(property, () => wrapSymbolTable(target.getExports()));

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
        const getter = getterFor(
          wrapped,
          SIGNATURE_GETTER_PROPERTIES,
          property,
        );
        if (getter) {
          return getter;
        }
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

  function bindNativeMethod(value: unknown, target: object): unknown {
    return typeof value === 'function' ? value.bind(target) : value;
  }

  return {
    toSignature,
    toSymbol,
    toType,
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
