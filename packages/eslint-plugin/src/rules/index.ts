import adjacentOverloadSignatures from './adjacent-overload-signatures';
import arrayType from './array-type';
import awaitThenable from './await-thenable';
import banTsIgnore from './ban-ts-ignore';
import banTsComment from './ban-ts-comment';
import banTypes from './ban-types';
import braceStyle from './brace-style';
import camelcase from './camelcase';
import classNameCasing from './class-name-casing';
import commaSpacing from './comma-spacing';
import consistentTypeAssertions from './consistent-type-assertions';
import consistentTypeDefinitions from './consistent-type-definitions';
import defaultParamLast from './default-param-last';
import explicitFunctionReturnType from './explicit-function-return-type';
import explicitMemberAccessibility from './explicit-member-accessibility';
import explicitModuleBoundaryTypes from './explicit-module-boundary-types';
import funcCallSpacing from './func-call-spacing';
import genericTypeNaming from './generic-type-naming';
import indent from './indent';
import interfaceNamePrefix from './interface-name-prefix';
import memberDelimiterStyle from './member-delimiter-style';
import memberNaming from './member-naming';
import memberOrdering from './member-ordering';
import namingConvention from './naming-convention';
import noArrayConstructor from './no-array-constructor';
import noBaseToString from './no-base-to-string';
import noDupeClassMembers from './no-dupe-class-members';
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
import noImpliedEval from './no-implied-eval';
import noInferrableTypes from './no-inferrable-types';
import noMagicNumbers from './no-magic-numbers';
import noMisusedNew from './no-misused-new';
import noMisusedPromises from './no-misused-promises';
import noNamespace from './no-namespace';
import noNonNullAssertion from './no-non-null-assertion';
import noNonNullAssertedOptionalChain from './no-non-null-asserted-optional-chain';
import noParameterProperties from './no-parameter-properties';
import noRequireImports from './no-require-imports';
import noThisAlias from './no-this-alias';
import noThrowLiteral from './no-throw-literal';
import noTypeAlias from './no-type-alias';
import noUnnecessaryBooleanLiteralCompare from './no-unnecessary-boolean-literal-compare';
import noUnnecessaryCondition from './no-unnecessary-condition';
import noUnnecessaryQualifier from './no-unnecessary-qualifier';
import useDefaultTypeParameter from './no-unnecessary-type-arguments';
import noUnnecessaryTypeAssertion from './no-unnecessary-type-assertion';
import noUntypedPublicSignature from './no-untyped-public-signature';
import noUnusedExpressions from './no-unused-expressions';
import noUnusedVars from './no-unused-vars';
import noUnusedVarsExperimental from './no-unused-vars-experimental';
import noUseBeforeDefine from './no-use-before-define';
import noUselessConstructor from './no-useless-constructor';
import noVarRequires from './no-var-requires';
import preferAsConst from './prefer-as-const';
import preferForOf from './prefer-for-of';
import preferFunctionType from './prefer-function-type';
import preferIncludes from './prefer-includes';
import preferNamespaceKeyword from './prefer-namespace-keyword';
import preferNullishCoalescing from './prefer-nullish-coalescing';
import preferOptionalChain from './prefer-optional-chain';
import preferReadonly from './prefer-readonly';
import preferRegexpExec from './prefer-regexp-exec';
import preferStringStartsEndsWith from './prefer-string-starts-ends-with';
import promiseFunctionAsync from './promise-function-async';
import quotes from './quotes';
import requireArraySortCompare from './require-array-sort-compare';
import requireAwait from './require-await';
import restrictPlusOperands from './restrict-plus-operands';
import restrictTemplateExpressions from './restrict-template-expressions';
import returnAwait from './return-await';
import semi from './semi';
import spaceBeforeFunctionParen from './space-before-function-paren';
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
  'ban-ts-ignore': banTsIgnore,
  'ban-ts-comment': banTsComment,
  'ban-types': banTypes,
  'no-base-to-string': noBaseToString,
  'brace-style': braceStyle,
  camelcase: camelcase,
  'class-name-casing': classNameCasing,
  'comma-spacing': commaSpacing,
  'consistent-type-assertions': consistentTypeAssertions,
  'consistent-type-definitions': consistentTypeDefinitions,
  'default-param-last': defaultParamLast,
  'explicit-function-return-type': explicitFunctionReturnType,
  'explicit-member-accessibility': explicitMemberAccessibility,
  'explicit-module-boundary-types': explicitModuleBoundaryTypes,
  'func-call-spacing': funcCallSpacing,
  'generic-type-naming': genericTypeNaming,
  indent: indent,
  'interface-name-prefix': interfaceNamePrefix,
  'member-delimiter-style': memberDelimiterStyle,
  'member-naming': memberNaming,
  'member-ordering': memberOrdering,
  'naming-convention': namingConvention,
  'no-array-constructor': noArrayConstructor,
  'no-dupe-class-members': noDupeClassMembers,
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
  'no-inferrable-types': noInferrableTypes,
  'no-implied-eval': noImpliedEval,
  'no-magic-numbers': noMagicNumbers,
  'no-misused-new': noMisusedNew,
  'no-misused-promises': noMisusedPromises,
  'no-namespace': noNamespace,
  'no-non-null-assertion': noNonNullAssertion,
  'no-non-null-asserted-optional-chain': noNonNullAssertedOptionalChain,
  'no-parameter-properties': noParameterProperties,
  'no-require-imports': noRequireImports,
  'no-this-alias': noThisAlias,
  'no-type-alias': noTypeAlias,
  'no-throw-literal': noThrowLiteral,
  'no-unnecessary-boolean-literal-compare': noUnnecessaryBooleanLiteralCompare,
  'no-unnecessary-condition': noUnnecessaryCondition,
  'no-unnecessary-qualifier': noUnnecessaryQualifier,
  'no-unnecessary-type-arguments': useDefaultTypeParameter,
  'no-unnecessary-type-assertion': noUnnecessaryTypeAssertion,
  'no-untyped-public-signature': noUntypedPublicSignature,
  'no-unused-vars': noUnusedVars,
  'no-unused-vars-experimental': noUnusedVarsExperimental,
  'no-unused-expressions': noUnusedExpressions,
  'no-use-before-define': noUseBeforeDefine,
  'no-useless-constructor': noUselessConstructor,
  'no-var-requires': noVarRequires,
  'prefer-as-const': preferAsConst,
  'prefer-for-of': preferForOf,
  'prefer-function-type': preferFunctionType,
  'prefer-includes': preferIncludes,
  'prefer-namespace-keyword': preferNamespaceKeyword,
  'prefer-nullish-coalescing': preferNullishCoalescing,
  'prefer-optional-chain': preferOptionalChain,
  'prefer-readonly': preferReadonly,
  'prefer-regexp-exec': preferRegexpExec,
  'prefer-string-starts-ends-with': preferStringStartsEndsWith,
  'promise-function-async': promiseFunctionAsync,
  quotes: quotes,
  'require-array-sort-compare': requireArraySortCompare,
  'require-await': requireAwait,
  'restrict-plus-operands': restrictPlusOperands,
  'restrict-template-expressions': restrictTemplateExpressions,
  'return-await': returnAwait,
  semi: semi,
  'space-before-function-paren': spaceBeforeFunctionParen,
  'strict-boolean-expressions': strictBooleanExpressions,
  'switch-exhaustiveness-check': switchExhaustivenessCheck,
  'triple-slash-reference': tripleSlashReference,
  'type-annotation-spacing': typeAnnotationSpacing,
  typedef: typedef,
  'unbound-method': unboundMethod,
  'unified-signatures': unifiedSignatures,
};
