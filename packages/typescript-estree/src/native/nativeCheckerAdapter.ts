import type {
  Checker as NativeChecker,
  Signature as NativeSignature,
  Type as NativeType,
  SymbolFlags,
} from '@typescript/native/unstable/sync';

import { SignatureKind, TypeFlags } from '@typescript/native/unstable/sync';
import * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeTypeAdapter } from './nativeTypeAdapter';

import { throwOnUnsupportedMembers } from './throwOnUnsupportedMembers';

export interface NativeCheckerAdapterContext {
  checker: NativeChecker;
  nodeAdapter: NativeNodeAdapter;
  typeAdapter: NativeTypeAdapter;
}

const MAX_AWAITED_TYPE_DEPTH = 100;

const UNSUPPORTED_CHECKER_MEMBERS = new Set([
  'getAmbientModules',
  'getAugmentedPropertiesOfType',
  'getBigIntLiteralType',
  'getDefaultFromTypeParameter',
  'getFalseType',
  'getIndexInfosOfIndexSymbol',
  'getJsxIntrinsicTagNamesAt',
  'getMergedSymbol',
  'getNonPrimitiveType',
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
  'isArgumentsSymbol',
  'isImplementationOfOverload',
  'isOptionalParameter',
  'isUndefinedSymbol',
  'isValidPropertyAccess',
  'runWithCancellationToken',
  'signatureToString',
  'symbolToEntityName',
  'symbolToExpression',
  'symbolToParameterDeclaration',
  'symbolToString',
  'symbolToTypeParameterDeclarations',
  'tryGetMemberInModuleExports',
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

  function resolvedSignatureOf(node: ts.Node): NativeSignature | undefined {
    const signature = checker.getResolvedSignature(unwrapNode(node));
    return checker.isUnknownSignature(signature) ? undefined : signature;
  }

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

  /** Native cannot construct a union, so a multi-type union awaits to nothing. */
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

    // `then`'s callback is declared nullable, and a union with `null` has no
    // call signatures, so it is narrowed before its signatures are read.
    const value = checker
      .getSignaturesOfType(checker.getTypeOfSymbol(then), SignatureKind.Call)
      .flatMap(signature => signature.getParameters().slice(0, 1))
      .map(parameter =>
        checker.getNonNullableType(checker.getTypeOfSymbol(parameter)),
      )
      .flatMap(callbackType =>
        checker.getSignaturesOfType(callbackType, SignatureKind.Call),
      )
      .flatMap(signature => signature.getParameters().slice(0, 1))
      .map(parameter => checker.getTypeOfSymbol(parameter));

    if (value.length === 0) {
      return undefined;
    }
    const [first, ...rest] = value;
    return rest.every((part: NativeType) => part === first)
      ? awaitedTypeOf(first, depth + 1)
      : undefined;
  }

  const nativeChecker = {
    getAliasedSymbol: symbol =>
      wrapSymbol(checker.getAliasedSymbol(unwrapSymbol(symbol))),
    getAnyType: () => wrapType(checker.getAnyType()),
    getApparentType: type =>
      wrapType(checker.getApparentType(unwrapType(type))),
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
    getBigIntType: () => wrapType(checker.getBigIntType()),
    getBooleanType: () => wrapType(checker.getBooleanType()),
    getConstantValue: node => checker.getConstantValue(unwrapNode(node)),
    getContextualType: node =>
      wrapType(
        checker.getContextualType(
          unwrapNode(node) as Parameters<NativeChecker['getContextualType']>[0],
        ),
      ),
    getContextualTypeForArgumentAtIndex: (call: ts.Node, index: number) => {
      const signature = resolvedSignatureOf(call);
      return signature && wrapType(checker.getParameterType(signature, index));
    },
    getDeclaredTypeOfSymbol: symbol =>
      wrapType(checker.getDeclaredTypeOfSymbol(unwrapSymbol(symbol))),
    getESSymbolType: () => wrapType(checker.getESSymbolType()),
    getExportsOfModule: symbol =>
      checker.getExportsOfModule(unwrapSymbol(symbol)).map(toSymbol),
    getExportSpecifierLocalTargetSymbol: node =>
      wrapSymbol(checker.getExportSpecifierLocalTargetSymbol(unwrapNode(node))),
    getExportSymbolOfSymbol: symbol =>
      wrapSymbol(unwrapSymbol(symbol).getExportSymbol()),
    getFullyQualifiedName: symbol =>
      checker.getFullyQualifiedName(unwrapSymbol(symbol)),
    getImmediateAliasedSymbol: symbol =>
      wrapSymbol(checker.getImmediateAliasedSymbol(unwrapSymbol(symbol))),
    getIndexInfoOfType: indexInfoOfType,
    getIndexInfosOfType: type =>
      checker.getIndexInfosOfType(unwrapType(type)).map(wrapIndexInfo),
    getIndexTypeOfType: (type, kind) => indexInfoOfType(type, kind)?.type,
    getNeverType: () => wrapType(checker.getNeverType()),
    getNonNullableType: type =>
      wrapType(checker.getNonNullableType(unwrapType(type))),
    getNullType: () => wrapType(checker.getNullType()),
    getNumberType: () => wrapType(checker.getNumberType()),
    getPropertiesOfType: type =>
      checker.getPropertiesOfType(unwrapType(type)).map(toSymbol),
    getPropertyOfType: (type, name) =>
      wrapSymbol(checker.getPropertyOfType(unwrapType(type), name)),
    getResolvedSignature: node => wrapSignature(resolvedSignatureOf(node)),
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
    getTypeOfPropertyOfType: (type: ts.Type, name: string) => {
      const property = checker.getPropertyOfType(unwrapType(type), name);
      return property && wrapType(checker.getTypeOfSymbol(property));
    },
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
    getUndefinedType: () => wrapType(checker.getUndefinedType()),
    getUnknownType: () => wrapType(checker.getUnknownType()),
    getVoidType: () => wrapType(checker.getVoidType()),
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
  } satisfies Partial<ts.TypeChecker> & Record<string, unknown>;

  return throwOnUnsupportedMembers(
    'TypeChecker',
    UNSUPPORTED_CHECKER_MEMBERS,
    nativeChecker,
  ) as unknown as ts.TypeChecker;
}
