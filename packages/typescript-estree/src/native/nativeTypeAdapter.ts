import type { Declaration as NativeDeclaration } from '@typescript/native/unstable/ast';
import type {
  Checker as NativeChecker,
  FreshableType as NativeFreshableType,
  IndexInfo as NativeIndexInfo,
  NodeHandle as NativeNodeHandle,
  ObjectType as NativeObjectType,
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
import {
  CheckFlags,
  ElementFlags,
  ObjectFlags,
  SymbolFlags,
  TypeFlags,
} from '@typescript/native/unstable/sync';
import * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';

import { getModifiers } from '../getModifiers';
import { createFlagTranslations, translateFlags } from './translateFlags';

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

interface NativeTypeAdapterContext {
  checker: NativeChecker;
  nodeAdapter: NativeNodeAdapter;
  project: NativeProject;
}

/**
 * Above `CouldContainTypeVariables` the numbering diverges: classic's
 * `InstantiationExpressionType` is native's `IsGenericObjectType`, so passing
 * flags through reads the wrong one.
 */
const OBJECT_FLAG_TRANSLATIONS = createFlagTranslations(
  ObjectFlags,
  ts.ObjectFlags,
);

const CHECK_FLAG_TRANSLATIONS = createFlagTranslations(
  CheckFlags,
  (ts as unknown as Record<'CheckFlags', Record<string, number | string>>)
    .CheckFlags,
);

function toPseudoBigInt(value: bigint) {
  return {
    base10Value: (value < 0n ? -value : value).toString(),
    negative: value < 0n,
  };
}

type NativeMethod = (this: unknown, ...args: unknown[]) => unknown;

// Views on a prototype per native class, rather than proxies, because rules
// read type flags and symbols millions of times. Properties that callers test
// with `in` are defined on a view only when its native object has them.
function createWrapper<Native extends object, Classic extends object>(
  classicProperties: Record<string, (native: Native) => unknown>,
  classicMethods: Record<string, unknown>,
  presenceChecks: Record<string, (native: Native) => boolean>,
) {
  const CACHE = Symbol('cache');
  const NATIVE = Symbol('native');
  const VIEW = Symbol('view');
  const forwarders = new WeakMap<NativeMethod, NativeMethod>();
  const prototypes = new WeakMap<object, object>();

  interface View {
    [CACHE]: Map<string, unknown>;
    [NATIVE]: Native;
  }

  function unwrap(classic: Classic) {
    const native = (classic as Partial<View>)[NATIVE];
    if (!native) {
      throw new Error(
        'The value was not created by this native type adapter. Native and classic type objects cannot be mixed.',
      );
    }
    return native;
  }

  function forward(method: NativeMethod) {
    let forwarder = forwarders.get(method);
    if (!forwarder) {
      forwarder = function (this: unknown, ...args: unknown[]) {
        return method.apply(unwrap(this as Classic), args);
      };
      forwarders.set(method, forwarder);
    }
    return forwarder;
  }

  function createPrototype(native: Native) {
    const prototype: Record<string, unknown> = {};
    for (
      let current: object | null = native;
      current && current !== Object.prototype;
      current = Object.getPrototypeOf(current) as object | null
    ) {
      for (const name of Object.getOwnPropertyNames(current)) {
        if (
          name !== 'constructor' &&
          !Object.hasOwn(prototype, name) &&
          !Object.hasOwn(classicProperties, name) &&
          !Object.hasOwn(classicMethods, name)
        ) {
          Object.defineProperty(prototype, name, {
            get(this: View) {
              const value: unknown = (this[NATIVE] as Record<string, unknown>)[
                name
              ];
              return typeof value === 'function'
                ? forward(value as NativeMethod)
                : value;
            },
          });
        }
      }
    }
    for (const name of Object.keys(classicProperties)) {
      if (!Object.hasOwn(presenceChecks, name)) {
        Object.defineProperty(prototype, name, readClassicProperty(name));
      }
    }
    return Object.assign(prototype, classicMethods);
  }

  function readClassicProperty(name: string) {
    const read = classicProperties[name];
    return {
      enumerable: true,
      get(this: View) {
        const cache = this[CACHE];
        const cached = cache.get(name);
        if (cached != null || cache.has(name)) {
          return cached;
        }
        const value = read(this[NATIVE]);
        cache.set(name, value);
        return value;
      },
    };
  }

  function wrap(native: Native): Classic;
  function wrap(native: Native | undefined): Classic | undefined;
  function wrap(native: Native | undefined): Classic | undefined {
    if (!native) {
      return undefined;
    }
    const cached = (native as Partial<Record<typeof VIEW, Classic>>)[VIEW];
    if (cached) {
      return cached;
    }
    const nativePrototype = Object.getPrototypeOf(native) as object;
    let prototype = prototypes.get(nativePrototype);
    if (!prototype) {
      prototype = createPrototype(native);
      prototypes.set(nativePrototype, prototype);
    }
    const view = Object.create(prototype) as View;
    view[CACHE] = new Map();
    view[NATIVE] = native;
    const classic = view as unknown as Classic;
    (native as Partial<Record<typeof VIEW, Classic>>)[VIEW] = classic;
    for (const [name, isPresent] of Object.entries(presenceChecks)) {
      if (isPresent(native)) {
        Object.defineProperty(view, name, readClassicProperty(name));
      }
    }
    return classic;
  }

  return { unwrap, wrap };
}

export function createNativeTypeAdapter({
  checker,
  nodeAdapter,
  project,
}: NativeTypeAdapterContext): NativeTypeAdapter {
  const toSignature = (signature: NativeSignature) => wrapSignature(signature);
  const toSymbol = (symbol: NativeSymbol) => wrapSymbol(symbol);
  const toType = (type: NativeType) => wrapType(type);

  function resolveDeclaration(
    handle: NativeNodeHandle<NativeDeclaration> | undefined,
  ) {
    const resolved = handle?.resolve(project);
    return resolved && (nodeAdapter.wrapNode(resolved) as ts.Declaration);
  }

  function wrapTypeList(types: readonly NativeType[]) {
    return types.length ? types.map(toType) : undefined;
  }

  function toJSDocTagInfo(name: string, text: string | undefined) {
    return { name, text: text ? [{ kind: 'text', text }] : undefined };
  }

  const propertiesByName = new WeakMap<
    ts.Type,
    Map<string, ts.Symbol | undefined>
  >();
  const listedPropertiesByName = new WeakMap<ts.Type, Map<string, ts.Symbol>>();

  function listPropertiesByName(type: ts.Type) {
    const listed = new Map(
      unwrapType(type)
        .getProperties()
        .map(property => [property.name, wrapSymbol(property)] as const),
    );
    listedPropertiesByName.set(type, listed);
    return listed;
  }

  const typeMethods = {
    getApparentProperties(this: ts.Type) {
      return unwrapType(this).getApparentProperties().map(toSymbol);
    },
    getBaseTypes(this: ts.Type) {
      return unwrapType(this).getBaseTypes()?.map(toType);
    },
    getCallSignatures(this: ts.Type) {
      return unwrapType(this).getCallSignatures().map(toSignature);
    },
    getConstraint(this: ts.Type) {
      return wrapType(checker.getBaseConstraintOfType(unwrapType(this)));
    },
    getConstructSignatures(this: ts.Type) {
      return unwrapType(this).getConstructSignatures().map(toSignature);
    },
    getDefault(this: ts.Type) {
      return (this as { default?: ts.Type }).default;
    },
    getFlags(this: ts.Type) {
      return this.flags;
    },
    getNonNullableType(this: ts.Type) {
      return wrapType(unwrapType(this).getNonNullableType());
    },
    getNumberIndexType(this: ts.Type) {
      return wrapType(unwrapType(this).getNumberIndexType());
    },
    getProperties(this: ts.Type) {
      return unwrapType(this).getProperties().map(toSymbol);
    },
    getProperty(this: ts.Type, name: string) {
      let properties = propertiesByName.get(this);
      if (!properties) {
        properties = new Map();
        propertiesByName.set(this, properties);
      }
      if (properties.has(name)) {
        return properties.get(name);
      }
      const listed =
        listedPropertiesByName.get(this) ??
        (properties.size >= 2 ? listPropertiesByName(this) : undefined);
      const property =
        listed?.get(name) ?? wrapSymbol(unwrapType(this).getProperty(name));
      properties.set(name, property);
      return property;
    },
    getStringIndexType(this: ts.Type) {
      return wrapType(unwrapType(this).getStringIndexType());
    },
    getSymbol(this: ts.Type) {
      return (this as { symbol?: ts.Symbol }).symbol;
    },
    isClass(this: ts.Type) {
      const type = unwrapType(this);
      return (
        type.isObjectType() && (type.objectFlags & ObjectFlags.Class) !== 0
      );
    },
    isIntersection(this: ts.Type) {
      return unwrapType(this).isIntersectionType();
    },
    // Native `isLiteralType()` also covers boolean literals.
    isLiteral(this: ts.Type) {
      const type = unwrapType(this);
      return type.isLiteralType() && !type.isBooleanLiteralType();
    },
    isNumberLiteral(this: ts.Type) {
      return unwrapType(this).isNumberLiteralType();
    },
    isStringLiteral(this: ts.Type) {
      return unwrapType(this).isStringLiteralType();
    },
    isUnion(this: ts.Type) {
      return unwrapType(this).isUnionType();
    },
    isUnionOrIntersection(this: ts.Type) {
      const type = unwrapType(this);
      return type.isUnionType() || type.isIntersectionType();
    },
  };

  // Like classic, the same member of the first base type that has it, if declared once.
  function getInheritedJsDocTags(declaration: ts.Declaration) {
    const container = ts.isConstructorDeclaration(declaration.parent)
      ? declaration.parent.parent
      : declaration.parent;
    const name = ts.getNameOfDeclaration(declaration);
    if (
      !name ||
      !('text' in name) ||
      !(ts.isClassLike(container) || ts.isInterfaceDeclaration(container))
    ) {
      return undefined;
    }
    const isStatic = getModifiers(declaration)?.some(
      modifier => modifier.kind === ts.SyntaxKind.StaticKeyword,
    );
    for (const clause of container.heritageClauses ?? []) {
      for (const superTypeNode of clause.types) {
        const baseType = checker.getTypeAtLocation(
          nodeAdapter.unwrapNode(superTypeNode),
        );
        const baseSymbol = baseType.getSymbol();
        const symbol = checker.getPropertyOfType(
          isStatic && baseSymbol
            ? checker.getTypeOfSymbol(baseSymbol)
            : baseType,
          name.text,
        );
        if (symbol?.declarations.length === 1) {
          return wrapSymbol(symbol).getJsDocTags();
        }
      }
    }
    return undefined;
  }

  const jsDocTagsBySymbol = new WeakMap<ts.Symbol, ts.JSDocTagInfo[]>();

  const symbolMethods = {
    getDeclarations(this: ts.Symbol) {
      return (this as { declarations?: ts.Declaration[] }).declarations;
    },
    getDocumentationComment(this: ts.Symbol) {
      const comment = unwrapSymbol(this).getDocumentationComment(checker);
      return comment ? [{ kind: 'text', text: comment }] : [];
    },
    getEscapedName(this: ts.Symbol) {
      return this.escapedName;
    },
    getFlags(this: ts.Symbol) {
      return this.flags;
    },
    getJsDocTags(this: ts.Symbol) {
      let tags = jsDocTagsBySymbol.get(this);
      if (!tags) {
        tags = unwrapSymbol(this)
          .getJsDocTags(checker)
          .map(tag => toJSDocTagInfo(tag.name, tag.text));
        jsDocTagsBySymbol.set(this, tags);
      }
      return tags;
    },
    getName(this: ts.Symbol) {
      return this.name;
    },
  };

  const signatureMethods = {
    getDeclaration(this: ts.Signature) {
      return this.declaration;
    },
    // Native has no signature documentation to read.
    getDocumentationComment(): ts.SymbolDisplayPart[] {
      return [];
    },
    // A signature carries no symbol, and a symbol lookup would merge overloads.
    getJsDocTags(this: ts.Signature) {
      const declaration = unwrapSignature(this).declaration?.resolve(project);
      if (!declaration) {
        return [];
      }
      const tags = getJSDocTags(declaration).map(tag =>
        toJSDocTagInfo(tag.tagName.text, getTextOfJSDocComment(tag.comment)),
      );
      return tags.length &&
        !tags.some(
          tag => tag.name === 'inheritDoc' || tag.name === 'inheritdoc',
        )
        ? tags
        : [
            ...(getInheritedJsDocTags(
              nodeAdapter.wrapNode(declaration) as ts.Declaration,
            ) ?? []),
            ...tags,
          ];
    },
    getParameters(this: ts.Signature) {
      return this.parameters;
    },
    getReturnType(this: ts.Signature) {
      return (this as { resolvedReturnType?: ts.Type }).resolvedReturnType;
    },
    getTypeParameterAtPosition(this: ts.Signature, position: number) {
      return wrapType(
        unwrapSignature(this).getTypeParameterAtPosition(position),
      );
    },
    getTypeParameters(this: ts.Signature) {
      return this.typeParameters;
    },
  };

  const classicTypeProperties: Record<string, (type: NativeType) => unknown> = {
    aliasSymbol: type => wrapSymbol(type.getAliasSymbol()),
    aliasTypeArguments: type => wrapTypeList(type.getAliasTypeArguments()),
    baseType: type =>
      type.isSubstitutionType() ? wrapType(type.getBaseType()) : undefined,
    checkType: type =>
      type.isConditionalType() ? wrapType(type.getCheckType()) : undefined,
    combinedFlags: type =>
      type.isTupleTypeTarget()
        ? type.elementFlags.reduce((combined, flags) => combined | flags, 0)
        : undefined,
    constraint: type =>
      type.isTypeParameter() || type.isSubstitutionType()
        ? wrapType(type.getConstraint())
        : undefined,
    constraintType: type =>
      type.isMappedType() ? wrapType(type.getConstraintType()) : undefined,
    default: type =>
      type.isTypeParameter() ? wrapType(type.getDefault()) : undefined,
    // `UniqueESSymbolType` spells its name the way the checker does for the
    // symbol's own property, which native only exposes piecewise.
    type: type =>
      type.isIndexType() || type.isStringMappingType()
        ? wrapType(type.getTarget())
        : undefined,
    escapedName: type => {
      const symbol =
        type.flags & TypeFlags.UniqueESSymbol ? type.getSymbol() : undefined;
      return symbol && `__@${symbol.name}@${symbol.id}`;
    },
    extendsType: type =>
      type.isConditionalType() ? wrapType(type.getExtendsType()) : undefined,
    freshType: type =>
      type.flags & TypeFlags.Freshable
        ? wrapType((type as NativeFreshableType).getFreshType())
        : undefined,
    indexType: type =>
      type.isIndexedAccessType() ? wrapType(type.getIndexType()) : undefined,
    intrinsicName: type =>
      type.isBooleanLiteralType()
        ? String(type.value)
        : type.isIntrinsicType()
          ? type.intrinsicName
          : undefined,
    localTypeParameters: type =>
      type.isClassOrInterface()
        ? wrapTypeList(type.getLocalTypeParameters())
        : undefined,
    minLength: type =>
      type.isTupleTypeTarget()
        ? type.elementFlags.filter(
            flags => flags & (ElementFlags.Required | ElementFlags.Variadic),
          ).length
        : undefined,
    nameType: type =>
      type.isMappedType() ? wrapType(type.getNameType()) : undefined,
    objectFlags: type =>
      translateFlags(
        OBJECT_FLAG_TRANSLATIONS,
        (type as Partial<NativeObjectType>).objectFlags ?? 0,
      ),
    objectType: type =>
      type.isIndexedAccessType() ? wrapType(type.getObjectType()) : undefined,
    outerTypeParameters: type =>
      type.isClassOrInterface()
        ? wrapTypeList(type.getOuterTypeParameters())
        : undefined,
    regularType: type =>
      type.flags & TypeFlags.Freshable
        ? wrapType((type as NativeFreshableType).getRegularType())
        : undefined,
    resolvedFalseType: type =>
      type.isConditionalType() ? wrapType(type.getFalseType()) : undefined,
    resolvedTrueType: type =>
      type.isConditionalType() ? wrapType(type.getTrueType()) : undefined,
    symbol: type => wrapSymbol(type.getSymbol()),
    target: type =>
      type.isTypeReference() ? wrapType(type.getTarget()) : undefined,
    templateType: type =>
      type.isMappedType() ? wrapType(type.getTemplateType()) : undefined,
    thisType: type =>
      type.isClassOrInterface() ? wrapType(type.getThisType()) : undefined,
    typeArguments: type =>
      type.isTypeReference()
        ? checker.getTypeArguments(type).map(toType)
        : undefined,
    typeParameter: type =>
      type.isMappedType() ? wrapType(type.getTypeParameter()) : undefined,
    typeParameters: type =>
      type.isClassOrInterface()
        ? wrapTypeList(type.getTypeParameters())
        : undefined,
    types: type =>
      type.isUnionType() ||
      type.isIntersectionType() ||
      type.isTemplateLiteralType()
        ? type.getTypes().map(toType)
        : undefined,
    value: type =>
      type.isBigIntLiteralType()
        ? toPseudoBigInt(type.value)
        : type.isLiteralType()
          ? type.value
          : undefined,
  };

  const classicSymbolProperties: Record<
    string,
    (symbol: NativeSymbol) => unknown
  > = {
    // Classic leaves a synthesized alias, such as a CommonJS module's
    // `default`, without declarations.
    declarations: symbol => {
      const { declarations } = symbol;
      return declarations.length === 0 && symbol.flags & SymbolFlags.Alias
        ? undefined
        : declarations
            .map(resolveDeclaration)
            .filter(declaration => declaration != null);
    },
    exports: symbol => wrapSymbolTable(symbol.getExports()),
    // Classic keeps a transient symbol's check flags and type in its links.
    links: symbol => {
      if (!(symbol.flags & SymbolFlags.Transient)) {
        return undefined;
      }
      let type: ts.Type | undefined;
      return {
        get type() {
          return (type ??= wrapType(checker.getTypeOfSymbol(symbol)));
        },
        checkFlags: translateFlags(CHECK_FLAG_TRANSLATIONS, symbol.checkFlags),
      };
    },
    members: symbol => wrapSymbolTable(symbol.getMembers()),
    parent: symbol => wrapSymbol(symbol.getParent()),
    valueDeclaration: symbol => resolveDeclaration(symbol.valueDeclaration),
  };

  const classicSignatureProperties: Record<
    string,
    (signature: NativeSignature) => unknown
  > = {
    declaration: signature => resolveDeclaration(signature.declaration),
    parameters: signature => signature.getParameters().map(toSymbol),
    resolvedReturnType: signature => wrapType(signature.getReturnType()),
    target: signature => wrapSignature(signature.getTarget()),
    thisParameter: signature => wrapSymbol(signature.getThisParameter()),
    typeParameters: signature => wrapTypeList(signature.getTypeParameters()),
  };

  const { unwrap: unwrapType, wrap: wrapType } = createWrapper<
    NativeType,
    ts.Type
  >(classicTypeProperties, typeMethods, {
    type: type => type.isIndexType() || type.isStringMappingType(),
    typeParameter: type => type.isMappedType(),
    value: type => type.isLiteralType(),
  });
  const { unwrap: unwrapSymbol, wrap: wrapSymbol } = createWrapper<
    NativeSymbol,
    ts.Symbol
  >(classicSymbolProperties, symbolMethods, {
    links: symbol => (symbol.flags & SymbolFlags.Transient) !== 0,
  });
  const { unwrap: unwrapSignature, wrap: wrapSignature } = createWrapper<
    NativeSignature,
    ts.Signature
  >(classicSignatureProperties, signatureMethods, {});

  function wrapSymbolTable(table: ReadonlyMap<string, NativeSymbol>) {
    const wrappedTable = new Map<string, ts.Symbol>();
    for (const [name, member] of table) {
      wrappedTable.set(name, wrapSymbol(member));
    }
    return wrappedTable as unknown as ts.SymbolTable;
  }

  function wrapIndexInfo(info: NativeIndexInfo) {
    return {
      type: wrapType(info.valueType),
      declaration: resolveDeclaration(
        info.declaration,
      ) as ts.IndexSignatureDeclaration,
      isReadonly: info.isReadonly,
      keyType: wrapType(info.keyType),
    };
  }

  function wrapTypePredicate(predicate: NativeTypePredicate | undefined) {
    return (
      predicate &&
      ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
        ...predicate,
        type: wrapType(predicate.type),
      } as ts.TypePredicate)
    );
  }

  return {
    toSignature,
    toSymbol,
    toType,
    unwrapSignature,
    unwrapSymbol,
    unwrapType,
    wrapIndexInfo,
    wrapSignature,
    wrapSymbol,
    wrapType,
    wrapTypePredicate,
  };
}
