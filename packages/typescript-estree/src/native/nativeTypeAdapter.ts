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
  ElementFlags,
  ObjectFlags,
  TypeFlags,
} from '@typescript/native/unstable/sync';
import * as ts from 'typescript';

import type { NativeMethod } from './createMethodForwarder';
import type { NativeNodeAdapter } from './nativeNodeAdapter';

import { createMethodForwarder } from './createMethodForwarder';
import { createFlagTranslations, translateFlags } from './translateFlags';

/**
 * Native exposes relationships as lazy methods where classic exposes plain
 * properties, and a getter only answers for its own kind of type — so every
 * wrapper checks the kind before reading.
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

interface NativeTypeAdapterContext {
  checker: NativeChecker;
  nodeAdapter: NativeNodeAdapter;
  project: NativeProject;
}

/**
 * Above `Mapped` the numbering diverges: classic's `InstantiationExpressionType`
 * is native's `IsGenericObjectType`, so passing flags through reads the wrong one.
 */
const OBJECT_FLAG_TRANSLATIONS = createFlagTranslations(
  ObjectFlags,
  ts.ObjectFlags,
);

function toPseudoBigInt(value: bigint): ts.PseudoBigInt {
  return {
    base10Value: (value < 0n ? -value : value).toString(),
    negative: value < 0n,
  };
}

/** Marks a property classic doesn't define, which the native object answers. */
const NATIVE = Symbol('native');

interface Wrapper<Native, Classic> {
  unwrap: (classic: Classic) => Native;
  wrap: {
    (native: Native): Classic;
    (native: Native | undefined): Classic | undefined;
  };
}

/**
 * Presents a native object through its classic members, falling back to the
 * native object itself. Members are computed once, so identity holds and each
 * relationship costs at most one round trip; `in` agrees with `get`, since
 * classic code probes for some properties rather than reading them. Methods on
 * either side find their object through `this`, so none is created per access.
 */
function createWrapper<Native extends object, Classic extends object>(
  readClassic: (native: Native, property: string) => unknown,
): Wrapper<Native, Classic> {
  const nativeToClassic = new WeakMap<Native, Classic>();
  const classicToNative = new WeakMap<Classic, Native>();
  const values = new WeakMap<Native, Map<string, unknown>>();

  function unwrap(classic: Classic): Native {
    const native = classicToNative.get(classic);
    if (!native) {
      throw new Error(UNWRAP_ERROR);
    }
    return native;
  }

  const forward = createMethodForwarder(unwrap);

  function read(native: Native, property: string | symbol): unknown {
    if (typeof property !== 'string') {
      return NATIVE;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- every proxied object has its values
    const known = values.get(native)!;
    const cached = known.get(property);
    if (cached != null || known.has(property)) {
      return cached;
    }
    const value = readClassic(native, property);
    known.set(property, value);
    return value;
  }

  const handler: ProxyHandler<Native> = {
    get(target, property) {
      const value = read(target, property);
      if (value !== NATIVE) {
        return value;
      }
      const nativeValue: unknown = Reflect.get(target, property, target);
      return typeof nativeValue === 'function'
        ? forward(nativeValue as NativeMethod)
        : nativeValue;
    },
    has(target, property) {
      const value = read(target, property);
      return value === NATIVE ? Reflect.has(target, property) : value != null;
    },
  };

  function wrap(native: Native): Classic;
  function wrap(native: Native | undefined): Classic | undefined;
  function wrap(native: Native | undefined): Classic | undefined {
    if (!native) {
      return undefined;
    }
    const cached = nativeToClassic.get(native);
    if (cached) {
      return cached;
    }
    const classic = new Proxy(native, handler) as unknown as Classic;
    nativeToClassic.set(native, classic);
    classicToNative.set(classic, native);
    values.set(native, new Map());
    return classic;
  }

  return { unwrap, wrap };
}

const UNWRAP_ERROR =
  'The value was not created by this native type adapter. Native and classic type objects cannot be mixed.';

export function createNativeTypeAdapter({
  checker,
  nodeAdapter,
  project,
}: NativeTypeAdapterContext): NativeTypeAdapter {
  const toSignature = (signature: NativeSignature): ts.Signature =>
    wrapSignature(signature);
  const toSymbol = (symbol: NativeSymbol): ts.Symbol => wrapSymbol(symbol);
  const toType = (type: NativeType): ts.Type => wrapType(type);

  function resolveDeclaration(
    handle: NativeNodeHandle<NativeDeclaration> | undefined,
  ): ts.Declaration | undefined {
    const resolved = handle?.resolve(project);
    return resolved && (nodeAdapter.wrapNode(resolved) as ts.Declaration);
  }

  function wrapTypeList(types: readonly NativeType[]): ts.Type[] | undefined {
    return types.length ? types.map(toType) : undefined;
  }

  function toJSDocTagInfo(name: string, text: string | undefined) {
    return { name, text: text ? [{ kind: 'text', text }] : undefined };
  }

  /** Classic methods, shared by every wrapper; each reads its object off `this`. */
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
      return (this as { constraint?: ts.Type }).constraint;
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
      return wrapSymbol(unwrapType(this).getProperty(name));
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

  const symbolMethods = {
    getDeclarations(this: ts.Symbol) {
      return (this as { declarations?: ts.Declaration[] }).declarations;
    },
    getDocumentationComment(this: ts.Symbol): ts.SymbolDisplayPart[] {
      const comment = unwrapSymbol(this).getDocumentationComment(checker);
      return comment ? [{ kind: 'text', text: comment }] : [];
    },
    getEscapedName(this: ts.Symbol) {
      return this.escapedName;
    },
    getFlags(this: ts.Symbol) {
      return this.flags;
    },
    getJsDocTags(this: ts.Symbol): ts.JSDocTagInfo[] {
      return unwrapSymbol(this)
        .getJsDocTags(checker)
        .map(tag => toJSDocTagInfo(tag.name, tag.text));
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
    getJsDocTags(this: ts.Signature): ts.JSDocTagInfo[] {
      const declaration = unwrapSignature(this).declaration?.resolve(project);
      return declaration
        ? getJSDocTags(declaration).map(tag =>
            toJSDocTagInfo(
              tag.tagName.text,
              getTextOfJSDocComment(tag.comment),
            ),
          )
        : [];
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

  function readClassicType(type: NativeType, property: string): unknown {
    switch (property) {
      case 'aliasSymbol':
        return wrapSymbol(type.getAliasSymbol());
      case 'aliasTypeArguments':
        return wrapTypeList(type.getAliasTypeArguments());
      case 'baseType':
        return type.isSubstitutionType()
          ? wrapType(type.getBaseType())
          : undefined;
      // An implementation detail of `typescript`, with no native equivalent.
      case 'checker':
        return undefined;
      case 'checkType':
        return type.isConditionalType()
          ? wrapType(type.getCheckType())
          : undefined;
      case 'combinedFlags':
        return type.isTupleTypeTarget()
          ? type.elementFlags.reduce((combined, flags) => combined | flags, 0)
          : undefined;
      case 'constraint':
        return type.isTypeParameter() || type.isSubstitutionType()
          ? wrapType(type.getConstraint())
          : undefined;
      case 'constraintType':
        return type.isMappedType()
          ? wrapType(type.getConstraintType())
          : undefined;
      case 'default':
        return type.isTypeParameter() ? wrapType(type.getDefault()) : undefined;
      // `UniqueESSymbolType` spells its name the way the checker does for the
      // symbol's own property, which native only exposes piecewise.
      case 'escapedName': {
        const symbol =
          type.flags & TypeFlags.UniqueESSymbol ? type.getSymbol() : undefined;
        return symbol && `__@${symbol.name}@${symbol.id}`;
      }
      case 'extendsType':
        return type.isConditionalType()
          ? wrapType(type.getExtendsType())
          : undefined;
      case 'freshType':
        return type.flags & TypeFlags.Freshable
          ? wrapType((type as NativeFreshableType).getFreshType())
          : undefined;
      case 'indexType':
        return type.isIndexedAccessType()
          ? wrapType(type.getIndexType())
          : undefined;
      // Native spells a boolean literal's name as a `value` instead.
      case 'intrinsicName':
        return type.isBooleanLiteralType()
          ? String(type.value)
          : type.isIntrinsicType()
            ? type.intrinsicName
            : undefined;
      case 'localTypeParameters':
        return type.isClassOrInterface()
          ? wrapTypeList(type.getLocalTypeParameters())
          : undefined;
      // Classic counts the elements a tuple needs, which native leaves out.
      case 'minLength':
        return type.isTupleTypeTarget()
          ? type.elementFlags.filter(
              flags => flags & (ElementFlags.Required | ElementFlags.Variadic),
            ).length
          : undefined;
      case 'nameType':
        return type.isMappedType() ? wrapType(type.getNameType()) : undefined;
      case 'objectFlags':
        return translateFlags(
          OBJECT_FLAG_TRANSLATIONS,
          (type as Partial<NativeObjectType>).objectFlags ?? 0,
        );
      case 'objectType':
        return type.isIndexedAccessType()
          ? wrapType(type.getObjectType())
          : undefined;
      case 'outerTypeParameters':
        return type.isClassOrInterface()
          ? wrapTypeList(type.getOuterTypeParameters())
          : undefined;
      case 'regularType':
        return type.flags & TypeFlags.Freshable
          ? wrapType((type as NativeFreshableType).getRegularType())
          : undefined;
      case 'resolvedFalseType':
        return type.isConditionalType()
          ? wrapType(type.getFalseType())
          : undefined;
      case 'resolvedTrueType':
        return type.isConditionalType()
          ? wrapType(type.getTrueType())
          : undefined;
      case 'symbol':
        return wrapSymbol(type.getSymbol());
      case 'target':
        return type.isTypeReference() ? wrapType(type.getTarget()) : undefined;
      case 'templateType':
        return type.isMappedType()
          ? wrapType(type.getTemplateType())
          : undefined;
      case 'thisType':
        return type.isClassOrInterface()
          ? wrapType(type.getThisType())
          : undefined;
      // `IndexType` and `StringMappingType` both spell their operand `type`.
      case 'type':
        return type.isIndexType() || type.isStringMappingType()
          ? wrapType(type.getTarget())
          : undefined;
      case 'typeArguments':
        return type.isTypeReference()
          ? checker.getTypeArguments(type).map(toType)
          : undefined;
      case 'typeParameter':
        return type.isMappedType()
          ? wrapType(type.getTypeParameter())
          : undefined;
      case 'typeParameters':
        return type.isClassOrInterface()
          ? wrapTypeList(type.getTypeParameters())
          : undefined;
      case 'types':
        return type.isUnionType() ||
          type.isIntersectionType() ||
          type.isTemplateLiteralType()
          ? type.getTypes().map(toType)
          : undefined;
      // Classic carries a bigint literal as a `PseudoBigInt`.
      case 'value':
        return type.isBigIntLiteralType()
          ? toPseudoBigInt(type.value)
          : type.isLiteralType()
            ? type.value
            : undefined;
      case 'getApparentProperties':
      case 'getBaseTypes':
      case 'getCallSignatures':
      case 'getConstraint':
      case 'getConstructSignatures':
      case 'getDefault':
      case 'getFlags':
      case 'getNonNullableType':
      case 'getNumberIndexType':
      case 'getProperties':
      case 'getProperty':
      case 'getStringIndexType':
      case 'getSymbol':
      case 'isClass':
      case 'isIntersection':
      case 'isLiteral':
      case 'isNumberLiteral':
      case 'isStringLiteral':
      case 'isUnion':
      case 'isUnionOrIntersection':
        return typeMethods[property];
      default:
        return NATIVE;
    }
  }

  function readClassicSymbol(symbol: NativeSymbol, property: string): unknown {
    switch (property) {
      case 'declarations':
        // eslint-disable-next-line @typescript-eslint/internal/no-poorly-typed-ts-props -- reading the native symbol, to implement the classic property
        return symbol.declarations
          .map(resolveDeclaration)
          .filter(declaration => declaration != null);
      case 'exports':
        return wrapSymbolTable(symbol.getExports());
      case 'members':
        return wrapSymbolTable(symbol.getMembers());
      case 'parent':
        return wrapSymbol(symbol.getParent());
      case 'valueDeclaration':
        return resolveDeclaration(symbol.valueDeclaration);
      case 'getDeclarations':
      case 'getDocumentationComment':
      case 'getEscapedName':
      case 'getFlags':
      case 'getJsDocTags':
      case 'getName':
        return symbolMethods[property];
      default:
        return NATIVE;
    }
  }

  function readClassicSignature(
    signature: NativeSignature,
    property: string,
  ): unknown {
    switch (property) {
      case 'declaration':
        return resolveDeclaration(signature.declaration);
      case 'parameters':
        return signature.getParameters().map(toSymbol);
      case 'resolvedReturnType':
        return wrapType(signature.getReturnType());
      case 'target':
        return wrapSignature(signature.getTarget());
      case 'thisParameter':
        return wrapSymbol(signature.getThisParameter());
      case 'typeParameters':
        return wrapTypeList(signature.getTypeParameters());
      case 'getDeclaration':
      case 'getDocumentationComment':
      case 'getJsDocTags':
      case 'getParameters':
      case 'getReturnType':
      case 'getTypeParameterAtPosition':
      case 'getTypeParameters':
        return signatureMethods[property];
      default:
        return NATIVE;
    }
  }

  const { unwrap: unwrapType, wrap: wrapType } = createWrapper<
    NativeType,
    ts.Type
  >(readClassicType);
  const { unwrap: unwrapSymbol, wrap: wrapSymbol } = createWrapper<
    NativeSymbol,
    ts.Symbol
  >(readClassicSymbol);
  const { unwrap: unwrapSignature, wrap: wrapSignature } = createWrapper<
    NativeSignature,
    ts.Signature
  >(readClassicSignature);

  function wrapSymbolTable(
    table: ReadonlyMap<string, NativeSymbol>,
  ): ts.SymbolTable {
    const wrappedTable = new Map<string, ts.Symbol>();
    for (const [name, member] of table) {
      wrappedTable.set(name, wrapSymbol(member));
    }
    return wrappedTable as unknown as ts.SymbolTable;
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
