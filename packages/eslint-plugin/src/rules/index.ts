import adjacentOverloadSignatures from './adjacent-overload-signatures';
import arrayType from './array-type';
import awaitThenable from './await-thenable';
import banTsIgnore from './ban-ts-ignore';
import banTypes from './ban-types';
import braceStyle from './brace-style';
import camelcase from './camelcase';
import classNameCasing from './class-name-casing';
import consistentTypeAssertions from './consistent-type-assertions';
import consistentTypeDefinitions from './consistent-type-definitions';
import explicitFunctionReturnType from './explicit-function-return-type';
import explicitMemberAccessibility from './explicit-member-accessibility';
import funcCallSpacing from './func-call-spacing';
import genericTypeNaming from './generic-type-naming';
import indent from './indent';
import interfaceNamePrefix from './interface-name-prefix';
import memberDelimiterStyle from './member-delimiter-style';
import memberNaming from './member-naming';
import memberOrdering from './member-ordering';
import noArrayConstructor from './no-array-constructor';
import noEmptyFunction from './no-empty-function';
import noEmptyInterface from './no-empty-interface';
import noExplicitAny from './no-explicit-any';
import noExtraParens from './no-extra-parens';
import noExtraneousClass from './no-extraneous-class';
import noFloatingPromises from './no-floating-promises';
import noForInArray from './no-for-in-array';
import noInferrableTypes from './no-inferrable-types';
import noMagicNumbers from './no-magic-numbers';
import noMisusedNew from './no-misused-new';
import noMisusedPromises from './no-misused-promises';
import noNamespace from './no-namespace';
import noNonNullAssertion from './no-non-null-assertion';
import noParameterProperties from './no-parameter-properties';
import noRequireImports from './no-require-imports';
import noThisAlias from './no-this-alias';
import noTypeAlias from './no-type-alias';
import noUnnecessaryCondition from './no-unnecessary-condition';
import noUnnecessaryQualifier from './no-unnecessary-qualifier';
import noUnnecessaryTypeAssertion from './no-unnecessary-type-assertion';
import noUnusedVars from './no-unused-vars';
import noUnusedExpressions from './no-unused-expressions';
import noUseBeforeDefine from './no-use-before-define';
import noUselessConstructor from './no-useless-constructor';
import noVarRequires from './no-var-requires';
import preferForOf from './prefer-for-of';
import preferFunctionType from './prefer-function-type';
import preferIncludes from './prefer-includes';
import preferNamespaceKeyword from './prefer-namespace-keyword';
import preferReadonly from './prefer-readonly';
import preferRegexpExec from './prefer-regexp-exec';
import preferStringStartsEndsWith from './prefer-string-starts-ends-with';
import promiseFunctionAsync from './promise-function-async';
import quotes from './quotes';
import requireArraySortCompare from './require-array-sort-compare';
import requireAwait from './require-await';
import restrictPlusOperands from './restrict-plus-operands';
import semi from './semi';
import strictBooleanExpressions from './strict-boolean-expressions';
import tripleSlashReference from './triple-slash-reference';
import typeAnnotationSpacing from './type-annotation-spacing';
import typedef from './typedef';
import unboundMethod from './unbound-method';
import unifiedSignatures from './unified-signatures';
import useDefaultTypeParameter from './no-unnecessary-type-arguments';

export default {
  'adjacent-overload-signatures': adjacentOverloadSignatures,
  'array-type': arrayType,
  'await-thenable': awaitThenable,
  'ban-ts-ignore': banTsIgnore,
  'ban-types': banTypes,
  'brace-style': braceStyle,
  camelcase: camelcase,
  'class-name-casing': classNameCasing,
  'consistent-type-assertions': consistentTypeAssertions,
  'consistent-type-definitions': consistentTypeDefinitions,
  'explicit-function-return-type': explicitFunctionReturnType,
  'explicit-member-accessibility': explicitMemberAccessibility,
  'func-call-spacing': funcCallSpacing,
  'generic-type-naming': genericTypeNaming,
  indent: indent,
  'interface-name-prefix': interfaceNamePrefix,
  'member-delimiter-style': memberDelimiterStyle,
  'member-naming': memberNaming,
  'member-ordering': memberOrdering,
  'no-array-constructor': noArrayConstructor,
  'no-empty-function': noEmptyFunction,
  'no-empty-interface': noEmptyInterface,
  'no-explicit-any': noExplicitAny,
  'no-extra-parens': noExtraParens,
  'no-extraneous-class': noExtraneousClass,
  'no-floating-promises': noFloatingPromises,
  'no-for-in-array': noForInArray,
  'no-inferrable-types': noInferrableTypes,
  'no-magic-numbers': noMagicNumbers,
  'no-misused-new': noMisusedNew,
  'no-misused-promises': noMisusedPromises,
  'no-namespace': noNamespace,
  'no-non-null-assertion': noNonNullAssertion,
  'no-parameter-properties': noParameterProperties,
  'no-require-imports': noRequireImports,
  'no-this-alias': noThisAlias,
  'no-type-alias': noTypeAlias,
  'no-unnecessary-condition': noUnnecessaryCondition,
  'no-unnecessary-qualifier': noUnnecessaryQualifier,
  'no-unnecessary-type-arguments': useDefaultTypeParameter,
  'no-unnecessary-type-assertion': noUnnecessaryTypeAssertion,
  'no-unused-vars': noUnusedVars,
  'no-unused-expressions': noUnusedExpressions,
  'no-use-before-define': noUseBeforeDefine,
  'no-useless-constructor': noUselessConstructor,
  'no-var-requires': noVarRequires,
  'prefer-for-of': preferForOf,
  'prefer-function-type': preferFunctionType,
  'prefer-includes': preferIncludes,
  'prefer-namespace-keyword': preferNamespaceKeyword,
  'prefer-readonly': preferReadonly,
  'prefer-regexp-exec': preferRegexpExec,
  'prefer-string-starts-ends-with': preferStringStartsEndsWith,
  'promise-function-async': promiseFunctionAsync,
  quotes: quotes,
  'require-array-sort-compare': requireArraySortCompare,
  'require-await': requireAwait,
  'restrict-plus-operands': restrictPlusOperands,
  semi: semi,
  'strict-boolean-expressions': strictBooleanExpressions,
  'triple-slash-reference': tripleSlashReference,
  'type-annotation-spacing': typeAnnotationSpacing,
  typedef: typedef,
  'unbound-method': unboundMethod,
  'unified-signatures': unifiedSignatures,
};
