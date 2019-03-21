import adjacentOverloadSignatures from './adjacent-overload-signatures';
import arrayType from './array-type';
import banTsIgnore from './ban-ts-ignore';
import banTypes from './ban-types';
import camelcase from './camelcase';
import classNameCasing from './class-name-casing';
import explicitFunctionReturnType from './explicit-function-return-type';
import explicitMemberAccessibility from './explicit-member-accessibility';
import genericTypeNaming from './generic-type-naming';
import indent from './indent';
import interfaceNamePrefix from './interface-name-prefix';
import memberDelimiterStyle from './member-delimiter-style';
import memberNaming from './member-naming';
import memberOrdering from './member-ordering';
import noAngleBracketTypeAssertion from './no-angle-bracket-type-assertion';
import noArrayConstructor from './no-array-constructor';
import noEmptyInterface from './no-empty-interface';
import noExplicitAny from './no-explicit-any';
import noExtraneousClass from './no-extraneous-class';
import noForInArray from './no-for-in-array';
import noInferrableTypes from './no-inferrable-types';
import noMisusedNew from './no-misused-new';
import noNamespace from './no-namespace';
import noNonNullAssertion from './no-non-null-assertion';
import noObjectLiteralTypeAssertion from './no-object-literal-type-assertion';
import noParameterProperties from './no-parameter-properties';
import noRequireImports from './no-require-imports';
import noThisAlias from './no-this-alias';
import noTripleSlashReference from './no-triple-slash-reference';
import noTypeAlias from './no-type-alias';
import noUnnecessaryQualifier from './no-unnecessary-qualifier';
import noUnnecessaryTypeAssertion from './no-unnecessary-type-assertion';
import noUnusedVars from './no-unused-vars';
import noUseBeforeDefine from './no-use-before-define';
import noUselessConstructor from './no-useless-constructor';
import noVarRequires from './no-var-requires';
import preferFunctionType from './prefer-function-type';
import preferInterface from './prefer-interface';
import preferNamespaceKeyword from './prefer-namespace-keyword';
import promiseFunctionAsync from './promise-function-async';
import requireArraySortCompare from './require-array-sort-compare';
import restrictPlusOperands from './restrict-plus-operands';
import typeAnnotationSpacing from './type-annotation-spacing';
import unifiedSignatures from './unified-signatures';

export default {
  'adjacent-overload-signatures': adjacentOverloadSignatures,
  'array-type': arrayType,
  'ban-ts-ignore': banTsIgnore,
  'ban-types': banTypes,
  camelcase: camelcase,
  'class-name-casing': classNameCasing,
  'explicit-function-return-type': explicitFunctionReturnType,
  'explicit-member-accessibility': explicitMemberAccessibility,
  'generic-type-naming': genericTypeNaming,
  indent: indent,
  'interface-name-prefix': interfaceNamePrefix,
  'member-delimiter-style': memberDelimiterStyle,
  'member-naming': memberNaming,
  'member-ordering': memberOrdering,
  'no-angle-bracket-type-assertion': noAngleBracketTypeAssertion,
  'no-array-constructor': noArrayConstructor,
  'no-empty-interface': noEmptyInterface,
  'no-explicit-any': noExplicitAny,
  'no-extraneous-class': noExtraneousClass,
  'no-for-in-array': noForInArray,
  'no-inferrable-types': noInferrableTypes,
  'no-misused-new': noMisusedNew,
  'no-namespace': noNamespace,
  'no-non-null-assertion': noNonNullAssertion,
  'no-object-literal-type-assertion': noObjectLiteralTypeAssertion,
  'no-parameter-properties': noParameterProperties,
  'no-require-imports': noRequireImports,
  'no-this-alias': noThisAlias,
  'no-triple-slash-reference': noTripleSlashReference,
  'no-type-alias': noTypeAlias,
  'no-unnecessary-qualifier': noUnnecessaryQualifier,
  'no-unnecessary-type-assertion': noUnnecessaryTypeAssertion,
  'no-unused-vars': noUnusedVars,
  'no-use-before-define': noUseBeforeDefine,
  'no-useless-constructor': noUselessConstructor,
  'no-var-requires': noVarRequires,
  'prefer-function-type': preferFunctionType,
  'prefer-interface': preferInterface,
  'prefer-namespace-keyword': preferNamespaceKeyword,
  'promise-function-async': promiseFunctionAsync,
  'require-array-sort-compare': requireArraySortCompare,
  'restrict-plus-operands': restrictPlusOperands,
  'type-annotation-spacing': typeAnnotationSpacing,
  'unified-signatures': unifiedSignatures,
};
