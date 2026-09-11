import type {
  Checker as NativeChecker,
  Signature as NativeSignature,
  Symbol as NativeSymbol,
  Type as NativeType,
  SymbolFlags,
} from '@typescript/native/unstable/sync';
import type * as ts from 'typescript';

import { SignatureKind, TypeFlags } from '@typescript/native/unstable/sync';

import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeTypeAdapter } from './nativeTypeAdapter';

import { incrementNativeCheckerMetric } from '../use-at-your-own-risk/nativeMetrics';

export interface NativeCheckerAdapterContext {
  checker: NativeChecker;
  nodeAdapter: NativeNodeAdapter;
  typeAdapter: NativeTypeAdapter;
}

/**
 * Guards against a pathological `then` chain. `typescript` applies the same
 * bound for the same reason.
 */
const MAX_AWAITED_TYPE_DEPTH = 100;

/**
 * Presents the native preview API's `Checker` as a classic `ts.TypeChecker`.
 *
 * Most methods differ only in that arguments arrive as wrappers and have to be
 * unwrapped before the native call, and results have to be wrapped on the way
 * back. The exceptions are called out individually below: a handful of classic
 * methods have no native counterpart and are derived from the primitives the
 * native API does expose.
 *
 * Any classic method not listed here throws on access rather than surfacing as
 * `undefined`, so a rule reaching for an unsupported API fails with a message
 * naming the API instead of a `TypeError` deep inside the rule.
 */
export function createNativeChecker({
  checker,
  nodeAdapter,
  typeAdapter,
}: NativeCheckerAdapterContext): ts.TypeChecker {
  const {
    unwrapSignature,
    unwrapSymbol,
    unwrapType,
    wrapIndexInfo,
    wrapSignature,
    wrapSymbol,
    wrapType,
    wrapTypePredicate,
  } = typeAdapter;
  const { unwrapNode } = nodeAdapter;

  // `Array#map` would otherwise resolve each wrapper to its widest overload.
  const toSignature = (signature: NativeSignature): ts.Signature =>
    wrapSignature(signature);
  const toSymbol = (symbol: NativeSymbol): ts.Symbol => wrapSymbol(symbol);
  const toType = (type: NativeType): ts.Type => wrapType(type);

  function indexInfoOfType(
    type: ts.Type,
    kind: ts.IndexKind,
  ): ts.IndexInfo | undefined {
    const wanted =
      kind === ts.IndexKind.String ? TypeFlags.String : TypeFlags.Number;
    const info = checker
      .getIndexInfosOfType(unwrapType(type))
      .find(candidate => (candidate.keyType.flags & wanted) !== 0);
    return info && wrapIndexInfo(info);
  }

  /**
   * The native API exposes no way to construct a union, so a union whose
   * constituents await to different types cannot be represented. Classic
   * returns `undefined` when it cannot compute an awaited type, and callers
   * already treat that as "unknown", so the same signal is used here.
   */
  function awaitedTypeOf(type: NativeType, depth = 0): NativeType | undefined {
    if (depth > MAX_AWAITED_TYPE_DEPTH) {
      return undefined;
    }

    const constituents = (
      type as { getTypes?: () => readonly NativeType[] | undefined }
    ).getTypes?.();
    if (constituents?.length && type.flags & TypeFlags.Union) {
      const awaited = constituents.map((part: NativeType) =>
        awaitedTypeOf(part, depth + 1),
      );
      if (awaited.some((part: NativeType | undefined) => part == null)) {
        return undefined;
      }
      const [first, ...rest] = awaited;
      return rest.every((part: NativeType | undefined) => part === first)
        ? first
        : undefined;
    }

    const then = checker.getPropertyOfType(type, 'then');
    if (!then) {
      return type;
    }

    // A thenable's awaited type is the parameter of the callback its `then`
    // takes: `then(onfulfilled: (value: T) => ...)` awaits to `T`.
    const onFulfilled = checker
      .getSignaturesOfType(checker.getTypeOfSymbol(then), SignatureKind.Call)
      .flatMap(signature => signature.getParameters().slice(0, 1))
      .map(parameter => checker.getTypeOfSymbol(parameter))
      .flatMap(parameterType =>
        checker.getSignaturesOfType(parameterType, SignatureKind.Call),
      );
    const value = onFulfilled
      .flatMap(signature => signature.getParameters().slice(0, 1))
      .map(parameter => checker.getTypeOfSymbol(parameter));
    if (value.length !== 1) {
      return undefined;
    }
    return awaitedTypeOf(value[0], depth + 1);
  }

  const nativeChecker = {
    getApparentType: type =>
      wrapType(checker.getApparentType(unwrapType(type))),

    /**
     * Derived: the native API has no awaited-type primitive.
     */
    getAwaitedType: type => wrapType(awaitedTypeOf(unwrapType(type))),

    getBaseConstraintOfType: type =>
      wrapType(checker.getBaseConstraintOfType(unwrapType(type))),
    getBaseTypeOfLiteralType: type =>
      wrapType(checker.getBaseTypeOfLiteralType(unwrapType(type))),
    getBaseTypes: type =>
      checker
        .getBaseTypes(
          unwrapType(type) as Parameters<NativeChecker['getBaseTypes']>[0],
        )
        .map(toType),
    getConstantValue: node => checker.getConstantValue(unwrapNode(node)),
    getContextualType: node =>
      wrapType(
        checker.getContextualType(
          unwrapNode(node) as Parameters<NativeChecker['getContextualType']>[0],
        ),
      ),

    getDeclaredTypeOfSymbol: symbol =>
      wrapType(checker.getDeclaredTypeOfSymbol(unwrapSymbol(symbol))),
    getFullyQualifiedName: symbol =>
      checker.getFullyQualifiedName(unwrapSymbol(symbol)),
    getIndexInfosOfType: type =>
      checker.getIndexInfosOfType(unwrapType(type)).map(wrapIndexInfo),
    getNonNullableType: type =>
      wrapType(checker.getNonNullableType(unwrapType(type))),
    getPropertiesOfType: type =>
      checker.getPropertiesOfType(unwrapType(type)).map(toSymbol),
    getPropertyOfType: (type, name) =>
      wrapSymbol(checker.getPropertyOfType(unwrapType(type), name)),

    /**
     * Native always yields a signature, using a sentinel "unknown signature"
     * where classic returns `undefined`.
     */
    getAliasedSymbol: symbol =>
      wrapSymbol(checker.getAliasedSymbol(unwrapSymbol(symbol))),

    getExportsOfModule: symbol =>
      checker.getExportsOfModule(unwrapSymbol(symbol)).map(toSymbol),
    getExportSpecifierLocalTargetSymbol: node =>
      wrapSymbol(checker.getExportSpecifierLocalTargetSymbol(unwrapNode(node))),
    getImmediateAliasedSymbol: symbol =>
      wrapSymbol(checker.getImmediateAliasedSymbol(unwrapSymbol(symbol))),
    getResolvedSignature: node => {
      const signature = checker.getResolvedSignature(unwrapNode(node));
      return checker.isUnknownSignature(signature)
        ? undefined
        : wrapSignature(signature);
    },
    getReturnTypeOfSignature: signature =>
      wrapType(checker.getReturnTypeOfSignature(unwrapSignature(signature))),
    getShorthandAssignmentValueSymbol: node =>
      wrapSymbol(
        node && checker.getShorthandAssignmentValueSymbol(unwrapNode(node)),
      ),
    getSignatureFromDeclaration: declaration =>
      wrapSignature(
        checker.getSignatureFromDeclaration(unwrapNode(declaration)),
      ),
    getSignaturesOfType: (type, kind) =>
      checker.getSignaturesOfType(unwrapType(type), kind).map(toSignature),
    getSymbolAtLocation: node =>
      wrapSymbol(checker.getSymbolAtLocation(unwrapNode(node))),
    getSymbolsInScope: (location, meaning) =>
      checker
        .getSymbolsInScope(
          unwrapNode(location),
          meaning as unknown as SymbolFlags,
        )
        .map(toSymbol),
    getTypeArguments: type =>
      checker
        .getTypeArguments(
          unwrapType(type) as Parameters<NativeChecker['getTypeArguments']>[0],
        )
        .map(toType),
    getTypeAtLocation: node =>
      wrapType(checker.getTypeAtLocation(unwrapNode(node))),

    getTypeFromTypeNode: node =>
      wrapType(
        checker.getTypeFromTypeNode(
          unwrapNode(node) as Parameters<
            NativeChecker['getTypeFromTypeNode']
          >[0],
        ),
      ),
    getTypeOfSymbol: symbol =>
      wrapType(checker.getTypeOfSymbol(unwrapSymbol(symbol))),
    getTypeOfSymbolAtLocation: (symbol, node) =>
      wrapType(
        checker.getTypeOfSymbolAtLocation(
          unwrapSymbol(symbol),
          unwrapNode(node),
        ),
      ),
    getTypePredicateOfSignature: signature =>
      wrapTypePredicate(
        checker.getTypePredicateOfSignature(unwrapSignature(signature)),
      ),
    getWidenedType: type => wrapType(checker.getWidenedType(unwrapType(type))),

    isArrayLikeType: type => checker.isArrayLikeType(unwrapType(type)),
    isArrayType: type => checker.isArrayType(unwrapType(type)),
    isTupleType: type => checker.isTupleType(unwrapType(type)),
    isTypeAssignableTo: (source, target) =>
      checker.isTypeAssignableTo(unwrapType(source), unwrapType(target)),

    isUnknownSymbol: symbol => checker.isUnknownSymbol(unwrapSymbol(symbol)),
    resolveName: (name, location, meaning, excludeGlobals) =>
      wrapSymbol(
        checker.resolveName(
          name,
          meaning as unknown as SymbolFlags,
          location && unwrapNode(location),
          excludeGlobals,
        ),
      ),
    signatureToSignatureDeclaration: (
      signature,
      kind,
      enclosingDeclaration,
      flags,
    ) =>
      checker.signatureToSignatureDeclaration(
        unwrapSignature(signature),
        kind as never,
        enclosingDeclaration && unwrapNode(enclosingDeclaration),
        flags,
      ) as ts.SignatureDeclaration | undefined,
    typeToString: (type, enclosingDeclaration, flags) =>
      checker.typeToString(
        unwrapType(type),
        enclosingDeclaration && unwrapNode(enclosingDeclaration),
        flags as never,
      ),
    typeToTypeNode: (type, enclosingDeclaration, flags) => {
      const typeNode = checker.typeToTypeNode(
        unwrapType(type),
        enclosingDeclaration && unwrapNode(enclosingDeclaration),
        flags,
      );
      return typeNode && (nodeAdapter.wrapNode(typeNode) as ts.TypeNode);
    },

    // Intrinsic types.
    getAnyType: () => wrapType(checker.getAnyType()),
    getBigIntType: () => wrapType(checker.getBigIntType()),
    getBooleanType: () => wrapType(checker.getBooleanType()),
    getESSymbolType: () => wrapType(checker.getESSymbolType()),
    getNeverType: () => wrapType(checker.getNeverType()),
    getNullType: () => wrapType(checker.getNullType()),
    getNumberType: () => wrapType(checker.getNumberType()),
    getStringType: () => wrapType(checker.getStringType()),
    getUndefinedType: () => wrapType(checker.getUndefinedType()),
    getUnknownType: () => wrapType(checker.getUnknownType()),
    getVoidType: () => wrapType(checker.getVoidType()),

    // Derived from `getExportSymbol` on the symbol itself.
    getExportSymbolOfSymbol: symbol =>
      wrapSymbol(unwrapSymbol(symbol).getExportSymbol()),

    // Derived from the index infos the native API does expose.
    getIndexInfoOfType: indexInfoOfType,
    getIndexTypeOfType: (type, kind) => indexInfoOfType(type, kind)?.type,

    // Derived from a property lookup followed by the symbol's type.
    getTypeOfPropertyOfType: (type: ts.Type, name: string) => {
      const property = checker.getPropertyOfType(unwrapType(type), name);
      return property && wrapType(checker.getTypeOfSymbol(property));
    },

    /**
     * Derived: classic resolves the contextual type of an argument through the
     * call's resolved signature, which is what the parameter type gives here.
     */
    getContextualTypeForArgumentAtIndex: (call: ts.Node, index: number) => {
      const signature = checker.getResolvedSignature(unwrapNode(call));
      return checker.isUnknownSignature(signature)
        ? undefined
        : wrapType(checker.getParameterType(signature, index));
    },
  } satisfies Partial<ts.TypeChecker> & Record<string, unknown>;

  const counted = new Map<string, unknown>();

  return new Proxy(nativeChecker, {
    get(target, property) {
      const value: unknown = Reflect.get(target, property, target);
      if (value == null && typeof property === 'string') {
        throw new Error(
          `TypeChecker#${property} is not available on the TypeScript native preview API.`,
        );
      }
      if (typeof value !== 'function' || typeof property !== 'string') {
        return value;
      }
      // Every checker call is at least one round trip to the native compiler
      // process, so counting here is what makes cross-backend comparisons of
      // IPC volume meaningful.
      let wrapper = counted.get(property);
      if (!wrapper) {
        wrapper = (...args: unknown[]): unknown => {
          incrementNativeCheckerMetric(property);
          return (value as (...args: unknown[]) => unknown)(...args);
        };
        counted.set(property, wrapper);
      }
      return wrapper;
    },
  }) as unknown as ts.TypeChecker;
}
