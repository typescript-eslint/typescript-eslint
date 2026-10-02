import type {
  Checker as NativeChecker,
  SymbolFlags,
  Symbol as NativeSymbol,
} from '@typescript/native/unstable/sync';

import { SyntaxKind as NativeSyntaxKind } from '@typescript/native/unstable/ast';
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

  /** Native only answers for parsed nodes, so a meta property's keyword asks after the meta property. */
  function unwrapLocation(node: ts.Node) {
    const native = unwrapNode(node);
    return (native.kind === NativeSyntaxKind.ImportKeyword ||
      native.kind === NativeSyntaxKind.NewKeyword) &&
      native.parent.kind === NativeSyntaxKind.MetaProperty
      ? native.parent
      : native;
  }
  const typesOfSymbolsElsewhere = new Map<NativeSymbol, ts.Type>();

  // Classic's intrinsic `true` and `false` are the regular constituents of `boolean`.
  function getBooleanLiteralType(value: boolean): ts.Type {
    const boolean = checker.getBooleanType();
    const type = boolean.isUnionType()
      ? boolean
          .getTypes()
          .find(
            constituent =>
              constituent.isBooleanLiteralType() && constituent.value === value,
          )
      : undefined;
    if (!type) {
      throw new Error(`The native boolean type has no ${value} constituent.`);
    }
    return wrapType(type);
  }

  const pendingIdentifiers = new WeakMap<object, readonly ts.Node[]>();

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
    getFalseType: () => getBooleanLiteralType(false),
    getFullyQualifiedName: symbol =>
      checker.getFullyQualifiedName(unwrapSymbol(symbol)),
    getImmediateAliasedSymbol: symbol =>
      wrapSymbol(checker.getImmediateAliasedSymbol(unwrapSymbol(symbol))),
    getIndexInfoOfType: (type, kind) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
      const info = checker.getIndexInfoOfType(unwrapType(type), kind);
      return info && wrapIndexInfo(info);
    },
    getIndexInfosOfType: type =>
      checker.getIndexInfosOfType(unwrapType(type)).map(wrapIndexInfo),
    getIndexTypeOfType: (type, kind) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
      checker.getSignaturesOfType(unwrapType(type), kind).map(toSignature),
    getStringType: () => wrapType(checker.getStringType()),
    getSymbolAtLocation: node => {
      const native = unwrapLocation(node);
      const sourceFile = native.getSourceFile();
      const identifiers = pendingIdentifiers.get(sourceFile);
      if (!identifiers) {
        return wrapSymbol(checker.getSymbolAtLocation(native));
      }
      pendingIdentifiers.delete(sourceFile);
      const symbols = checker
        .getSymbolAtLocation(identifiers.map(unwrapNode))
        .map(symbol => wrapSymbol(symbol));
      identifiers.forEach((identifier, index) => {
        seed('getSymbolAtLocation', [identifier], symbols[index]);
      });
      const index = identifiers.indexOf(node);
      return index === -1
        ? wrapSymbol(checker.getSymbolAtLocation(native))
        : symbols[index];
    },
    getSymbolsInScope: (location, meaning) =>
      checker
        .getSymbolsInScope(
          unwrapNode(location),
          meaning as unknown as SymbolFlags,
        )
        .map(toSymbol),
    getTrueType: () => getBooleanLiteralType(true),
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
        : wrapType(checker.getTypeAtLocation(unwrapLocation(node))),
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
        type = wrapType(checker.getNonMissingTypeOfSymbol(nativeSymbol));
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
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
  prefetchers.set(classicChecker, (nodes, identifiers) => {
    const types = checker.getTypeAtLocation(nodes.map(unwrapNode));
    nodes.forEach((node, index) => {
      seed('getTypeAtLocation', [node], wrapType(types[index]));
    });
    if (identifiers.length) {
      pendingIdentifiers.set(
        unwrapNode(identifiers[0]).getSourceFile(),
        identifiers,
      );
    }
  });
  return classicChecker;
}

const prefetchers = new WeakMap<
  ts.TypeChecker,
  (nodes: readonly ts.Node[], identifiers: readonly ts.Node[]) => void
>();

export function prefetchTypesAtLocation(
  checker: ts.TypeChecker,
  nodes: readonly ts.Node[],
  identifiers: readonly ts.Node[],
): void {
  prefetchers.get(checker)?.(nodes, identifiers);
}

type CheckerMethod = (...args: unknown[]) => unknown;

class MemoEntry {
  objects: undefined | WeakMap<object, MemoEntry> = undefined;
  primitives: Map<unknown, MemoEntry> | undefined = undefined;
  resolved = false;
  result: unknown = undefined;
}

function getMemoEntry(root: MemoEntry, args: readonly unknown[]): MemoEntry {
  let entry = root;
  for (const arg of args) {
    let next: MemoEntry | undefined;
    if (
      (typeof arg === 'object' && arg !== null) ||
      typeof arg === 'function'
    ) {
      entry.objects ??= new WeakMap();
      next = entry.objects.get(arg);
      if (!next) {
        next = new MemoEntry();
        entry.objects.set(arg, next);
      }
    } else {
      entry.primitives ??= new Map();
      next = entry.primitives.get(arg);
      if (!next) {
        next = new MemoEntry();
        entry.primitives.set(arg, next);
      }
    }
    entry = next;
  }
  return entry;
}

function memoizeChecker<Checker extends object>(
  checker: Checker,
): {
  memoized: Checker;
  seed: (name: string, args: readonly unknown[], result: unknown) => void;
} {
  const roots = new Map<string, MemoEntry>();

  function memoize(name: string, method: CheckerMethod): CheckerMethod {
    const root = new MemoEntry();
    roots.set(name, root);
    return function (...args) {
      const entry = getMemoEntry(root, args);
      if (!entry.resolved) {
        entry.result = method(...args);
        entry.resolved = true;
      }
      return entry.result;
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
      const root = roots.get(name);
      if (root) {
        const entry = getMemoEntry(root, args);
        entry.result = result;
        entry.resolved = true;
      }
    },
  };
}
