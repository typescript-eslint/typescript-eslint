import type {
  Checker as NativeChecker,
  SymbolFlags,
  Symbol as NativeSymbol,
} from '@typescript/native/unstable/sync';

import { SyntaxKind as NativeSyntaxKind } from '@typescript/native/unstable/ast';
import * as tsutils from 'ts-api-utils';
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

/** Where classic's answer can differ from the symbol's own type: narrowing and write types. */
function isTypeOfSymbolLocation(node: ts.Node) {
  return (
    node.kind === ts.SyntaxKind.Identifier ||
    node.kind === ts.SyntaxKind.PrivateIdentifier ||
    (!ts.isSourceFile(node) &&
      ((ts.isSetAccessorDeclaration(node.parent) &&
        node.parent.name === node) ||
        (ts.isElementAccessExpression(node.parent) &&
          node.parent.argumentExpression === node)))
  );
}

export function createNativeChecker({
  checker,
  nodeAdapter,
  typeAdapter,
}: NativeCheckerAdapterContext): {
  checker: ts.TypeChecker;
  prefetch: (
    nodes: readonly ts.Node[],
    identifiers: readonly ts.Node[],
  ) => void;
} {
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

  const getTypeOfSymbolElsewhere = memoize((symbol: NativeSymbol) =>
    wrapType(checker.getNonMissingTypeOfSymbol(symbol)),
  );

  // Classic's intrinsic `true` and `false` are the regular constituents of `boolean`.
  function getBooleanLiteralType(value: boolean) {
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
      if (identifiers) {
        pendingIdentifiers.delete(sourceFile);
        const symbols = checker
          .getSymbolAtLocation(identifiers.map(unwrapNode))
          .map(symbol => wrapSymbol(symbol));
        identifiers.forEach((identifier, index) => {
          seed(memoRoots.getSymbolAtLocation, identifier, symbols[index]);
        });
        const index = identifiers.indexOf(node);
        if (index !== -1) {
          return symbols[index];
        }
      }
      return wrapSymbol(checker.getSymbolAtLocation(native));
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
    // Classic answers its error type for a missing node. The native API has no
    // error type to return, so `any` stands in.
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
    // Elsewhere the answer is the symbol's own, so one serves them all.
    getTypeOfSymbolAtLocation: (symbol, node) => {
      const nativeSymbol = unwrapSymbol(symbol);
      return tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.ExportValue) ||
        isTypeOfSymbolLocation(node)
        ? wrapType(
            checker.getTypeOfSymbolAtLocation(nativeSymbol, unwrapNode(node)),
          )
        : getTypeOfSymbolElsewhere(nativeSymbol);
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

  const memoized: Record<string, unknown> = {};
  const memoRoots: Record<string, MemoEntry> = {};
  for (const [name, method] of Object.entries(nativeChecker)) {
    const root = new MemoEntry();
    memoRoots[name] = root;
    memoized[name] = memoize(method as CheckerMethod, root);
  }

  return {
    checker: throwOnUnsupportedMembers(
      'TypeChecker',
      UNSUPPORTED_CHECKER_MEMBERS,
      memoized,
    ) as unknown as ts.TypeChecker,
    prefetch(nodes, identifiers) {
      const types = checker.getTypeAtLocation(nodes.map(unwrapNode));
      nodes.forEach((node, index) => {
        seed(memoRoots.getTypeAtLocation, node, wrapType(types[index]));
      });
      if (identifiers.length) {
        pendingIdentifiers.set(
          unwrapNode(identifiers[0]).getSourceFile(),
          identifiers,
        );
      }
    },
  };
}

type CheckerMethod = (...args: unknown[]) => unknown;

class MemoEntry {
  objects: WeakMap<object, MemoEntry> | undefined = undefined;
  primitives: Map<unknown, MemoEntry> | undefined = undefined;
  resolved = false;
  result: unknown = undefined;
}

function getMemoEntry(
  root: MemoEntry,
  args: readonly unknown[],
  arity: number,
) {
  let length = Math.min(args.length, arity);
  while (length > 0 && args[length - 1] == null) {
    length--;
  }
  let entry = root;
  for (let index = 0; index < length; index++) {
    const arg = args[index];
    let next: MemoEntry | undefined;
    if (typeof arg === 'object' && arg != null) {
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

function memoize<Args extends unknown[], Result>(
  method: (...args: Args) => Result,
  root = new MemoEntry(),
) {
  return (...args: Args) => {
    const entry = getMemoEntry(root, args, method.length);
    if (!entry.resolved) {
      entry.result = method(...args);
      entry.resolved = true;
    }
    return entry.result as Result;
  };
}

function seed(root: MemoEntry, node: ts.Node, result: unknown) {
  const entry = getMemoEntry(root, [node], 1);
  entry.result = result;
  entry.resolved = true;
}
