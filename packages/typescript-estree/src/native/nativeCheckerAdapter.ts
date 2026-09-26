import type {
  Checker as NativeChecker,
  SymbolFlags,
  Symbol as NativeSymbol,
} from '@typescript/native/unstable/sync';

import * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeTypeAdapter } from './nativeTypeAdapter';

import { throwOnUnsupportedMembers } from './throwOnUnsupportedMembers';

interface NativeCheckerAdapterContext {
  checker: NativeChecker;
  nodeAdapter: NativeNodeAdapter;
  typeAdapter: NativeTypeAdapter;
}

const UNSUPPORTED_CHECKER_MEMBERS = new Set([
  'getAmbientModules',
  'getAugmentedPropertiesOfType',
  'getBigIntLiteralType',
  'getFalseType',
  'getIndexInfosOfIndexSymbol',
  'getJsxIntrinsicTagNamesAt',
  'getMergedSymbol',
  'getNullableType',
  'getNumberLiteralType',
  'getPrivateIdentifierPropertyOfType',
  'getPropertySymbolOfDestructuringAssignment',
  'getRootSymbols',
  'getStringLiteralType',
  'getSymbolOfExpando',
  'getSymbolsOfParameterPropertyDeclaration',
  'getTrueType',
  'getTypeArgumentsForResolvedSignature',
  'getTypeOfAssignmentPattern',
  'indexInfoToIndexSignatureDeclaration',
  'isImplementationOfOverload',
  'isOptionalParameter',
  'isValidPropertyAccess',
  'runWithCancellationToken',
  'signatureToString',
  'symbolToEntityName',
  'symbolToExpression',
  'symbolToParameterDeclaration',
  'symbolToString',
  'symbolToTypeParameterDeclarations',
  'typeParameterToDeclaration',
  'typePredicateToString',
] satisfies readonly (keyof ts.TypeChecker)[]);

export function createNativeChecker({
  checker,
  nodeAdapter,
  typeAdapter,
}: NativeCheckerAdapterContext): ts.TypeChecker {
  const {
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
  } = typeAdapter;
  const { unwrapNode } = nodeAdapter;
  const typesOfSymbolsElsewhere = new Map<NativeSymbol, ts.Type>();

  const nativeChecker = {
    getAliasedSymbol: symbol =>
      wrapSymbol(checker.getAliasedSymbol(unwrapSymbol(symbol))),
    getAnyType: () => wrapType(checker.getAnyType()),
    getApparentType: type =>
      wrapType(checker.getApparentType(unwrapType(type))),
    getAwaitedType: type => wrapType(checker.getAwaitedType(unwrapType(type))),
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
    getBigIntType: () => wrapType(checker.getBigIntType()),
    getBooleanType: () => wrapType(checker.getBooleanType()),
    getConstantValue: node => checker.getConstantValue(unwrapNode(node)),
    getContextualType: node =>
      wrapType(
        checker.getContextualType(
          unwrapNode(node) as Parameters<NativeChecker['getContextualType']>[0],
        ),
      ),
    getContextualTypeForArgumentAtIndex: (call: ts.Node, index: number) =>
      wrapType(
        checker.getContextualTypeForArgumentAtIndex(
          unwrapNode(call) as Parameters<
            NativeChecker['getContextualTypeForArgumentAtIndex']
          >[0],
          index,
        ),
      ),
    getDeclaredTypeOfSymbol: symbol =>
      wrapType(checker.getDeclaredTypeOfSymbol(unwrapSymbol(symbol))),
    getDefaultFromTypeParameter: type =>
      wrapType(
        checker.getDefaultFromTypeParameter(
          unwrapType(type) as Parameters<
            NativeChecker['getDefaultFromTypeParameter']
          >[0],
        ),
      ),
    getESSymbolType: () => wrapType(checker.getESSymbolType()),
    getExportsOfModule: symbol =>
      checker.getExportsOfModule(unwrapSymbol(symbol)).map(toSymbol),
    getExportSpecifierLocalTargetSymbol: node =>
      wrapSymbol(checker.getExportSpecifierLocalTargetSymbol(unwrapNode(node))),
    getExportSymbolOfSymbol: symbol =>
      wrapSymbol(checker.getExportSymbolOfSymbol(unwrapSymbol(symbol))),
    getFullyQualifiedName: symbol =>
      checker.getFullyQualifiedName(unwrapSymbol(symbol)),
    getImmediateAliasedSymbol: symbol =>
      wrapSymbol(checker.getImmediateAliasedSymbol(unwrapSymbol(symbol))),
    getIndexInfoOfType: (type, kind) => {
      const info = checker.getIndexInfoOfType(unwrapType(type), kind);
      return info && wrapIndexInfo(info);
    },
    getIndexInfosOfType: type =>
      checker.getIndexInfosOfType(unwrapType(type)).map(wrapIndexInfo),
    getIndexTypeOfType: (type, kind) =>
      wrapType(checker.getIndexTypeOfType(unwrapType(type), kind)),
    getNeverType: () => wrapType(checker.getNeverType()),
    getNonNullableType: type =>
      wrapType(checker.getNonNullableType(unwrapType(type))),
    getNonPrimitiveType: () => wrapType(checker.getNonPrimitiveType()),
    getNullType: () => wrapType(checker.getNullType()),
    getNumberType: () => wrapType(checker.getNumberType()),
    getPropertiesOfType: type =>
      checker.getPropertiesOfType(unwrapType(type)).map(toSymbol),
    getPropertyOfType: (type, name) =>
      wrapSymbol(checker.getPropertyOfType(unwrapType(type), name)),
    getResolvedSignature: node =>
      wrapSignature(checker.getResolvedSignature(unwrapNode(node))),
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
    getStringType: () => wrapType(checker.getStringType()),
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
    // Classic answers the error type for a node it does not recognize, and
    // rules lean on that when a syntax node has no type of its own.
    getTypeAtLocation: (node: ts.Node | undefined) =>
      node == null
        ? wrapType(checker.getAnyType())
        : wrapType(checker.getTypeAtLocation(unwrapNode(node))),
    getTypeFromTypeNode: node =>
      wrapType(
        checker.getTypeFromTypeNode(
          unwrapNode(node) as Parameters<
            NativeChecker['getTypeFromTypeNode']
          >[0],
        ),
      ),
    getTypeOfPropertyOfType: (type: ts.Type, name: string) =>
      wrapType(checker.getTypeOfPropertyOfType(unwrapType(type), name)),
    getTypeOfSymbol: symbol =>
      wrapType(checker.getTypeOfSymbol(unwrapSymbol(symbol))),
    // The checker only consults an identifier location, for narrowing.
    // Anywhere else the answer is the symbol's own, so one serves them all.
    getTypeOfSymbolAtLocation: (symbol, node) => {
      const nativeSymbol = unwrapSymbol(symbol);
      if (
        node.kind === ts.SyntaxKind.Identifier ||
        node.kind === ts.SyntaxKind.PrivateIdentifier
      ) {
        return wrapType(
          checker.getTypeOfSymbolAtLocation(nativeSymbol, unwrapNode(node)),
        );
      }
      let type = typesOfSymbolsElsewhere.get(nativeSymbol);
      if (!type) {
        type = wrapType(
          checker.getTypeOfSymbolAtLocation(nativeSymbol, unwrapNode(node)),
        );
        typesOfSymbolsElsewhere.set(nativeSymbol, type);
      }
      return type;
    },
    getTypePredicateOfSignature: signature =>
      wrapTypePredicate(
        checker.getTypePredicateOfSignature(unwrapSignature(signature)),
      ),
    getUndefinedType: () => wrapType(checker.getUndefinedType()),
    getUnknownType: () => wrapType(checker.getUnknownType()),
    getVoidType: () => wrapType(checker.getVoidType()),
    getWidenedType: type => wrapType(checker.getWidenedType(unwrapType(type))),
    isArgumentsSymbol: symbol =>
      checker.isArgumentsSymbol(unwrapSymbol(symbol)),
    isArrayLikeType: type => checker.isArrayLikeType(unwrapType(type)),
    isArrayType: type => checker.isArrayType(unwrapType(type)),
    isTupleType: type => checker.isTupleType(unwrapType(type)),
    isTypeAssignableTo: (source, target) =>
      checker.isTypeAssignableTo(unwrapType(source), unwrapType(target)),
    isUndefinedSymbol: symbol =>
      checker.isUndefinedSymbol(unwrapSymbol(symbol)),
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
    ) => {
      // Every signature declaration kind native has shares its classic number.
      const declaration = checker.signatureToSignatureDeclaration(
        unwrapSignature(signature),
        kind as never,
        enclosingDeclaration && unwrapNode(enclosingDeclaration),
        flags,
      );
      return (
        declaration &&
        (nodeAdapter.wrapNode(declaration) as ts.SignatureDeclaration)
      );
    },
    tryGetMemberInModuleExports: (memberName, moduleSymbol) =>
      wrapSymbol(
        checker.getMemberInModuleExports(
          unwrapSymbol(moduleSymbol),
          memberName,
        ),
      ),
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
  } satisfies Partial<ts.TypeChecker> & Record<string, unknown>;

  const { memoized, seed } = memoizeChecker(nativeChecker);
  const classicChecker = throwOnUnsupportedMembers(
    'TypeChecker',
    UNSUPPORTED_CHECKER_MEMBERS,
    memoized,
  ) as unknown as ts.TypeChecker;
  prefetchers.set(classicChecker, nodes => {
    const types = checker.getTypeAtLocation(nodes.map(unwrapNode));
    nodes.forEach((node, index) => {
      seed('getTypeAtLocation', [node], wrapType(types[index]));
    });
  });
  return classicChecker;
}

const prefetchers = new WeakMap<
  ts.TypeChecker,
  (nodes: readonly ts.Node[]) => void
>();

export function prefetchTypesAtLocation(
  checker: ts.TypeChecker,
  nodes: readonly ts.Node[],
): void {
  prefetchers.get(checker)?.(nodes);
}

type CheckerMethod = (...args: unknown[]) => unknown;

function memoizeChecker<Checker extends object>(
  checker: Checker,
): {
  memoized: Checker;
  seed: (name: string, args: readonly unknown[], result: unknown) => void;
} {
  const results = new Map<string, unknown>();
  const ids = new WeakMap<object, number>();
  let nextId = 0;

  function keyOf(value: unknown): string {
    switch (typeof value) {
      case 'function':
      case 'object': {
        if (value == null) {
          return 'null';
        }
        let id = ids.get(value);
        if (id == null) {
          id = nextId++;
          ids.set(value, id);
        }
        return `#${id}`;
      }
      case 'string':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  function keyOfCall(name: string, args: readonly unknown[]): string {
    let key = name;
    for (const arg of args) {
      key += `,${keyOf(arg)}`;
    }
    return key;
  }

  function memoize(name: string, method: CheckerMethod): CheckerMethod {
    return function (...args) {
      const key = keyOfCall(name, args);
      const cached = results.get(key);
      if (cached != null || results.has(key)) {
        return cached;
      }
      const result = method(...args);
      results.set(key, result);
      return result;
    };
  }

  const memoized: Record<string, unknown> = {};
  for (const [name, member] of Object.entries(checker)) {
    memoized[name] =
      typeof member === 'function'
        ? memoize(name, member as CheckerMethod)
        : member;
  }
  return {
    memoized: memoized as Checker,
    seed: (name, args, result) => {
      results.set(keyOfCall(name, args), result);
    },
  };
}
