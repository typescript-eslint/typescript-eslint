import type {
  Checker as NativeChecker,
  Signature as NativeSignature,
  SymbolFlags,
} from '@typescript/native/unstable/sync';
import type * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeTypeAdapter } from './nativeTypeAdapter';

import { throwOnUnsupportedMembers } from './throwOnUnsupportedMembers';

export interface NativeCheckerAdapterContext {
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
    getTypeOfPropertyOfType: (type: ts.Type, name: string) =>
      wrapType(checker.getTypeOfPropertyOfType(unwrapType(type), name)),
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
