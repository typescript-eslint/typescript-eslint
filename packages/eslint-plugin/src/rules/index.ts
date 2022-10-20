import adjacentOverloadSignatures from './adjacent-overload-signatures';
import arrayType from './array-type';
import awaitThenable from './await-thenable';
import banTsComment from './ban-ts-comment';
import banTslintComment from './ban-tslint-comment';
import banTypes from './ban-types';
import braceStyle from './brace-style';
import callSuperOnOverride from './call-super-on-override';
import classLiteralPropertyStyle from './class-literal-property-style';
import commaDangle from './comma-dangle';
import commaSpacing from './comma-spacing';
import consistentGenericConstructors from './consistent-generic-constructors';
import consistentIndexedObjectStyle from './consistent-indexed-object-style';
import consistentTypeAssertions from './consistent-type-assertions';
import consistentTypeDefinitions from './consistent-type-definitions';
import consistentTypeExports from './consistent-type-exports';
import consistentTypeImports from './consistent-type-imports';
import defaultParamLast from './default-param-last';
import dotNotation from './dot-notation';
import explicitFunctionReturnType from './explicit-function-return-type';
import explicitMemberAccessibility from './explicit-member-accessibility';
import explicitModuleBoundaryTypes from './explicit-module-boundary-types';
import funcCallSpacing from './func-call-spacing';
import indent from './indent';
import initDeclarations from './init-declarations';
import keywordSpacing from './keyword-spacing';
import linesBetweenClassMembers from './lines-between-class-members';
import memberDelimiterStyle from './member-delimiter-style';
import memberOrdering from './member-ordering';
import methodSignatureStyle from './method-signature-style';
import namingConvention from './naming-convention';
import noArrayConstructor from './no-array-constructor';
import noArrayDelete from './no-array-delete';
import noBaseToString from './no-base-to-string';
import confusingNonNullAssertionLikeNotEqual from './no-confusing-non-null-assertion';
import noConfusingVoidExpression from './no-confusing-void-expression';
import noDupeClassMembers from './no-dupe-class-members';
import noDuplicateEnumValues from './no-duplicate-enum-values';
import noDuplicateImports from './no-duplicate-imports';
import noDynamicDelete from './no-dynamic-delete';
import noEmptyFunction from './no-empty-function';
import noEmptyInterface from './no-empty-interface';
import noExplicitAny from './no-explicit-any';
import noExtraNonNullAssertion from './no-extra-non-null-assertion';
import noExtraParens from './no-extra-parens';
import noExtraSemi from './no-extra-semi';
import noExtraneousClass from './no-extraneous-class';
import noFloatingPromises from './no-floating-promises';
import noForInArray from './no-for-in-array';
import noImplicitAnyCatch from './no-implicit-any-catch';
import noImpliedEval from './no-implied-eval';
import noInArray from './no-in-array';
import noInferrableTypes from './no-inferrable-types';
import noInvalidThis from './no-invalid-this';
import noInvalidVoidType from './no-invalid-void-type';
import noLoopFunc from './no-loop-func';
import noLossOfPrecision from './no-loss-of-precision';
import noMagicNumbers from './no-magic-numbers';
import noMeaninglessVoidOperator from './no-meaningless-void-operator';
import noMisusedNew from './no-misused-new';
import noMisusedPromises from './no-misused-promises';
import noNamespace from './no-namespace';
import noNonNullAssertedNullishCoalescing from './no-non-null-asserted-nullish-coalescing';
import noNonNullAssertedOptionalChain from './no-non-null-asserted-optional-chain';
import noNonNullAssertion from './no-non-null-assertion';
import noParameterProperties from './no-parameter-properties';
import noRedeclare from './no-redeclare';
import noRedundantTypeConstituents from './no-redundant-type-constituents';
import noRequireImports from './no-require-imports';
import noRestrictedImports from './no-restricted-imports';
import noShadow from './no-shadow';
import noThisAlias from './no-this-alias';
import noThrowLiteral from './no-throw-literal';
import noTypeAlias from './no-type-alias';
import noUnnecessaryBooleanLiteralCompare from './no-unnecessary-boolean-literal-compare';
import noUnnecessaryCondition from './no-unnecessary-condition';
import noUnnecessaryQualifier from './no-unnecessary-qualifier';
import noUnnecessaryTypeArguments from './no-unnecessary-type-arguments';
import noUnnecessaryTypeAssertion from './no-unnecessary-type-assertion';
import noUnnecessaryTypeConstraint from './no-unnecessary-type-constraint';
import noUnsafeArgument from './no-unsafe-argument';
import noUnsafeAssignment from './no-unsafe-assignment';
import noUnsafeCall from './no-unsafe-call';
import noUnsafeDeclarationMerging from './no-unsafe-declaration-merging';
import noUnsafeMemberAccess from './no-unsafe-member-access';
import noUnsafeReturn from './no-unsafe-return';
import noUnusedExpressions from './no-unused-expressions';
import noUnusedVars from './no-unused-vars';
import noUseBeforeDefine from './no-use-before-define';
import noUselessConstructor from './no-useless-constructor';
import noUselessEmptyExport from './no-useless-empty-export';
import noVarRequires from './no-var-requires';
import nonNullableTypeAssertionStyle from './non-nullable-type-assertion-style';
import objectCurlySpacing from './object-curly-spacing';
import paddingLineBetweenStatements from './padding-line-between-statements';
import parameterProperties from './parameter-properties';
import preferAsConst from './prefer-as-const';
import preferEnumInitializers from './prefer-enum-initializers';
import preferForOf from './prefer-for-of';
import preferFunctionType from './prefer-function-type';
import preferIncludes from './prefer-includes';
import preferLiteralEnumMember from './prefer-literal-enum-member';
import preferNamespaceKeyword from './prefer-namespace-keyword';
import preferNullishCoalescing from './prefer-nullish-coalescing';
import preferOptionalChain from './prefer-optional-chain';
import preferReadonly from './prefer-readonly';
import preferReadonlyParameterTypes from './prefer-readonly-parameter-types';
import preferReduceTypeParameter from './prefer-reduce-type-parameter';
import preferRegexpExec from './prefer-regexp-exec';
import preferReturnThisType from './prefer-return-this-type';
import preferStringStartsEndsWith from './prefer-string-starts-ends-with';
import preferTsExpectError from './prefer-ts-expect-error';
import promiseFunctionAsync from './promise-function-async';
import quotes from './quotes';
import requireArraySortCompare from './require-array-sort-compare';
import requireAwait from './require-await';
import restrictPlusOperands from './restrict-plus-operands';
import restrictTemplateExpressions from './restrict-template-expressions';
import returnAwait from './return-await';
import semi from './semi';
import sortTypeUnionIntersectionMembers from './sort-type-union-intersection-members';
import spaceBeforeBlocks from './space-before-blocks';
import spaceBeforeFunctionParen from './space-before-function-paren';
import spaceInfixOps from './space-infix-ops';
import strictBooleanExpressions from './strict-boolean-expressions';
import switchExhaustivenessCheck from './switch-exhaustiveness-check';
import tripleSlashReference from './triple-slash-reference';
import typeAnnotationSpacing from './type-annotation-spacing';
import typedef from './typedef';
import unboundMethod from './unbound-method';
import unifiedSignatures from './unified-signatures';

export default {
  'adjacent-overload-signatures': adjacentOverloadSignatures,
  'array-type': arrayType,
  'await-thenable': awaitThenable,
  'ban-ts-comment': banTsComment,
  'ban-tslint-comment': banTslintComment,
  'ban-types': banTypes,
  'brace-style': braceStyle,
  'call-super-on-override': callSuperOnOverride,
  'class-literal-property-style': classLiteralPropertyStyle,
  'comma-dangle': commaDangle,
  'comma-spacing': commaSpacing,
  'consistent-generic-constructors': consistentGenericConstructors,
  'consistent-indexed-object-style': consistentIndexedObjectStyle,
  'consistent-type-assertions': consistentTypeAssertions,
  'consistent-type-definitions': consistentTypeDefinitions,
  'consistent-type-exports': consistentTypeExports,
  'consistent-type-imports': consistentTypeImports,
  'default-param-last': defaultParamLast,
  'dot-notation': dotNotation,
  'explicit-function-return-type': explicitFunctionReturnType,
  'explicit-member-accessibility': explicitMemberAccessibility,
  'explicit-module-boundary-types': explicitModuleBoundaryTypes,
  'func-call-spacing': funcCallSpacing,
  indent: indent,
  'init-declarations': initDeclarations,
  'keyword-spacing': keywordSpacing,
  'lines-between-class-members': linesBetweenClassMembers,
  'member-delimiter-style': memberDelimiterStyle,
  'member-ordering': memberOrdering,
  'method-signature-style': methodSignatureStyle,
  'naming-convention': namingConvention,
  'no-array-constructor': noArrayConstructor,
  'no-array-delete': noArrayDelete,
  'no-base-to-string': noBaseToString,
  'no-confusing-non-null-assertion': confusingNonNullAssertionLikeNotEqual,
  'no-confusing-void-expression': noConfusingVoidExpression,
  'no-dupe-class-members': noDupeClassMembers,
  'no-duplicate-enum-values': noDuplicateEnumValues,
  'no-duplicate-imports': noDuplicateImports,
  'no-dynamic-delete': noDynamicDelete,
  'no-empty-function': noEmptyFunction,
  'no-empty-interface': noEmptyInterface,
  'no-explicit-any': noExplicitAny,
  'no-extra-non-null-assertion': noExtraNonNullAssertion,
  'no-extra-parens': noExtraParens,
  'no-extra-semi': noExtraSemi,
  'no-extraneous-class': noExtraneousClass,
  'no-floating-promises': noFloatingPromises,
  'no-for-in-array': noForInArray,
  'no-implicit-any-catch': noImplicitAnyCatch,
  'no-implied-eval': noImpliedEval,
  'no-in-array': noInArray,
  'no-inferrable-types': noInferrableTypes,
  'no-invalid-this': noInvalidThis,
  'no-invalid-void-type': noInvalidVoidType,
  'no-loop-func': noLoopFunc,
  'no-loss-of-precision': noLossOfPrecision,
  'no-magic-numbers': noMagicNumbers,
  'no-meaningless-void-operator': noMeaninglessVoidOperator,
  'no-misused-new': noMisusedNew,
  'no-misused-promises': noMisusedPromises,
  'no-namespace': noNamespace,
  'no-non-null-asserted-nullish-coalescing': noNonNullAssertedNullishCoalescing,
  'no-non-null-asserted-optional-chain': noNonNullAssertedOptionalChain,
  'no-non-null-assertion': noNonNullAssertion,
  'no-parameter-properties': noParameterProperties,
  'no-redeclare': noRedeclare,
  'no-redundant-type-constituents': noRedundantTypeConstituents,
  'no-require-imports': noRequireImports,
  'no-restricted-imports': noRestrictedImports,
  'no-shadow': noShadow,
  'no-this-alias': noThisAlias,
  'no-throw-literal': noThrowLiteral,
  'no-type-alias': noTypeAlias,
  'no-unnecessary-boolean-literal-compare': noUnnecessaryBooleanLiteralCompare,
  'no-unnecessary-condition': noUnnecessaryCondition,
  'no-unnecessary-qualifier': noUnnecessaryQualifier,
  'no-unnecessary-type-arguments': noUnnecessaryTypeArguments,
  'no-unnecessary-type-assertion': noUnnecessaryTypeAssertion,
  'no-unnecessary-type-constraint': noUnnecessaryTypeConstraint,
  'no-unsafe-argument': noUnsafeArgument,
  'no-unsafe-assignment': noUnsafeAssignment,
  'no-unsafe-call': noUnsafeCall,
  'no-unsafe-declaration-merging': noUnsafeDeclarationMerging,
  'no-unsafe-member-access': noUnsafeMemberAccess,
  'no-unsafe-return': noUnsafeReturn,
  'no-unused-expressions': noUnusedExpressions,
  'no-unused-vars': noUnusedVars,
  'no-use-before-define': noUseBeforeDefine,
  'no-useless-constructor': noUselessConstructor,
  'no-useless-empty-export': noUselessEmptyExport,
  'no-var-requires': noVarRequires,
  'non-nullable-type-assertion-style': nonNullableTypeAssertionStyle,
  'object-curly-spacing': objectCurlySpacing,
  'padding-line-between-statements': paddingLineBetweenStatements,
  'parameter-properties': parameterProperties,
  'prefer-as-const': preferAsConst,
  'prefer-enum-initializers': preferEnumInitializers,
  'prefer-for-of': preferForOf,
  'prefer-function-type': preferFunctionType,
  'prefer-includes': preferIncludes,
  'prefer-literal-enum-member': preferLiteralEnumMember,
  'prefer-namespace-keyword': preferNamespaceKeyword,
  'prefer-nullish-coalescing': preferNullishCoalescing,
  'prefer-optional-chain': preferOptionalChain,
  'prefer-readonly': preferReadonly,
  'prefer-readonly-parameter-types': preferReadonlyParameterTypes,
  'prefer-reduce-type-parameter': preferReduceTypeParameter,
  'prefer-regexp-exec': preferRegexpExec,
  'prefer-return-this-type': preferReturnThisType,
  'prefer-string-starts-ends-with': preferStringStartsEndsWith,
  'prefer-ts-expect-error': preferTsExpectError,
  'promise-function-async': promiseFunctionAsync,
  quotes: quotes,
  'require-array-sort-compare': requireArraySortCompare,
  'require-await': requireAwait,
  'restrict-plus-operands': restrictPlusOperands,
  'restrict-template-expressions': restrictTemplateExpressions,
  'return-await': returnAwait,
  semi: semi,
  'sort-type-union-intersection-members': sortTypeUnionIntersectionMembers,
  'space-before-blocks': spaceBeforeBlocks,
  'space-before-function-paren': spaceBeforeFunctionParen,
  'space-infix-ops': spaceInfixOps,
  'strict-boolean-expressions': strictBooleanExpressions,
  'switch-exhaustiveness-check': switchExhaustivenessCheck,
  'triple-slash-reference': tripleSlashReference,
  'type-annotation-spacing': typeAnnotationSpacing,
  typedef: typedef,
  'unbound-method': unboundMethod,
  'unified-signatures': unifiedSignatures,
};
