/**
 * Support eslint flat config
 * Example:
 * import type { Linter } from 'eslint';
 * import type {ruleOptions} from '@typescript-eslint/eslint-plugin';
 *
 * And than define rules:
 *
 * type TSRules = {
 *   [K in keyof ruleOptions]?: Linter.RuleEntry<ruleOptions[K]>;
 * };
 * const rules: TSRules = {
 *   'accessor-pairs': 'error',
 *   'array-type': ['error', {
 *      readonly: 'array'
 *    }]
 *   ...
 * };
 */

import type { ESLintRules } from 'eslint/rules';
import type { Linter } from 'eslint';

// 获取eslint规则参数
type ESLintRuleOption = {
  [K in keyof ESLintRules]: ESLintRules[K] extends Linter.RuleEntry<infer O> ? O : [];
};

// 对象类型交叉合并属性
type MergeIntersectionObject<T, E> = T extends object ? T & E : T;

// 继承元组第一个元素
type ExtendsTupleFirstEl<T extends any[], E> = T extends [infer U, ...infer args]
  ? [MergeIntersectionObject<U, E>, ...args]
  : never;

type BanTSCommentOption = boolean | 'allow-with-description' | { descriptionFormat?: string };
type BanTypesOption = boolean | null | string | Partial<{
  fixWith: string;
  message: string;
  suggest: string[];
}>;
type ClassMethodsUseThisOption = ExtendsTupleFirstEl<ESLintRuleOption['class-methods-use-this'], Partial<{
  enforceForClassFields: boolean;
  ignoreOverrideMethods: boolean;
  ignoreClassesThatImplementAnInterface: boolean | 'public-fields';
}>>;

type ConsistentTypeImportsOption = Partial<{
  prefer: 'type-imports' | 'no-type-imports';
  disallowTypeAnnotations: boolean;
  fixStyle: 'separate-type-imports' | 'inline-type-imports';
}>;
type DotNotationOption = ExtendsTupleFirstEl<ESLintRuleOption['dot-notation'], Partial<{
  allowPrivateClassPropertyAccess: boolean;
  allowProtectedClassPropertyAccess: boolean;
  allowIndexSignaturePropertyAccess: boolean;
}>>;
type ExplicitFunctionReturnTypeOption = Partial<{
  allowExpressions: boolean;
  allowTypedFunctionExpressions: boolean;
  allowHigherOrderFunctions: boolean;
  allowDirectConstAssertionInArrowFunctions: boolean;
  allowConciseArrowFunctionExpressionsStartingWithVoid: boolean;
  allowFunctionsWithoutTypeParameters: boolean;
  allowedNames: string[];
  allowIIFEs: boolean;
}>;
type AccessibilityLevel = 'explicit' | 'off' | 'no-public';
type ExplicitMemberAccessibilityOption = Partial<{
  accessibility: AccessibilityLevel;
  ignoredMethodNames: string[];
  overrides: Partial<{
    accessors: AccessibilityLevel;
    constructors: AccessibilityLevel;
    methods: AccessibilityLevel;
    parameterProperties: AccessibilityLevel;
    properties: AccessibilityLevel;
  }>;
}>;
type ExplicitModuleBoundaryTypesOption = Partial<{
  allowArgumentsExplicitlyTypedAsAny: boolean;
  allowDirectConstAssertionInArrowFunctions: boolean;
  allowedNames: string[];
  allowHigherOrderFunctions: boolean;
  allowTypedFunctionExpressions: boolean;
}>;
type MaxParamsOption = Partial<{
  countVoidThis: boolean;
  max: number;
}>;
type MemberType = string | string[];
type SortedOrderConfig = Partial<{
  memberTypes: MemberType[] | 'never';
  optionalityOrder: 'optional-first' | 'required-first';
  order: 'alphabetically' | 'alphabetically-case-insensitive' | 'as-written' | 'natural' | 'natural-case-insensitive';
}>;
type OrderConfig = SortedOrderConfig | MemberType[] | 'never';
type MemberOrderingOption = Partial<{
  default?: OrderConfig;
  classes?: OrderConfig;
  classExpressions?: OrderConfig;
  interfaces?: OrderConfig;
  typeLiterals?: OrderConfig;
}>;
type NameFormating = 'camelCase' | 'strictCamelCase' | 'PascalCase' | 'StrictPascalCase' | 'snake_case' | 'UPPER_CASE';
type UnderscoreFormating = 'forbid' | 'require' | 'requireDouble' | 'allow' | 'allowDouble' | 'allowSingleOrDouble';
interface MatchRegexSchema {
  regex: string;
  match: boolean;
}
type NameSelector = 'variable' | 'function' | 'parameter' | 'parameterProperty' | 'accessor' | 'enumMember' | 'classMethod' | 'objectLiteralMethod' | 'typeMethod' | 'classProperty' | 'objectLiteralProperty' | 'typeProperty' | 'class' | 'interface' | 'typeAlias' | 'enum' | 'typeParameter' | 'import';
type NameMetaSelectors = 'default' | 'variableLike' | 'memberLike' | 'typeLike' | 'method' | 'property';
type ClassMemberModifier = 'abstract' | 'private' | '#private' | 'protected' | 'public' | 'readonly' | 'requiresQuotes' | 'static' | 'override';
type NameModifierSelectors = ClassMemberModifier | 'const' | 'destructured' | 'global' | 'exported' | 'unused' | 'async' | 'default' | 'namespace';
type NameTypeSelectors = 'boolean' | 'string' | 'number' | 'function' | 'array';
type NameSelectorSchema<S extends (NameMetaSelectors | NameSelector), T extends boolean, M extends NameModifierSelectors> = {
  selector: S;
  format: NameFormating[] | null;
  custom?: MatchRegexSchema;
  leadingUnderscore?: UnderscoreFormating;
  trailingUnderscore?: UnderscoreFormating;
  prefix?: string[];
  suffix?: string[];
  failureMessage?: string;
  filter?: string | MatchRegexSchema;
  modifiers?: M[];
} & (
  T extends true
    ? {
      types?: NameTypeSelectors[];
    }
    : {}
);

type NamingConventionOption = Array<
  NameSelectorSchema<'default', false, NameModifierSelectors>
  | NameSelectorSchema<'variableLike', false, 'unused' |'async'>
  | NameSelectorSchema<'variable', true, 'const' |'destructured' |'exported' |'global' |'unused' |'async'>
  | NameSelectorSchema<'function', false, 'exported' |'global' |'unused' |'async'>
  | NameSelectorSchema<'parameter', true, 'destructured' | 'unused'>
  | NameSelectorSchema<'memberLike', false, ClassMemberModifier | 'async'>
  | NameSelectorSchema<'classProperty', true, ClassMemberModifier>
  | NameSelectorSchema<'objectLiteralProperty', true, 'public' |'requiresQuotes'>
  | NameSelectorSchema<'typeProperty', true, 'public' | 'readonly' | 'requiresQuotes'>
  | NameSelectorSchema<'parameterProperty', true,  'private' | 'protected' | 'public' | 'readonly'>
  | NameSelectorSchema<'property', true, ClassMemberModifier | 'async'>
  | NameSelectorSchema<'classMethod', false, Exclude<ClassMemberModifier, 'readonly'> | 'async'>
  | NameSelectorSchema<'objectLiteralMethod', false, 'public' | 'requiresQuotes' | 'async'>
  | NameSelectorSchema<'typeMethod', false, 'public' | 'requiresQuotes'>
  | NameSelectorSchema<'method', false, Exclude<ClassMemberModifier, 'readonly'> | 'async'>
  | NameSelectorSchema<'accessor', true, Exclude<ClassMemberModifier, '#private' | 'readonly'>>
  | NameSelectorSchema<'enumMember', false, 'requiresQuotes'>
  | NameSelectorSchema<'typeLike', false, 'abstract' | 'exported' | 'unused'>
  | NameSelectorSchema<'class', false, 'abstract' | 'exported' | 'unused'>
  | NameSelectorSchema<'interface', false, 'exported' | 'unused'>
  | NameSelectorSchema<'typeAlias', false, 'exported' | 'unused'>
  | NameSelectorSchema<'enum', false, 'exported' | 'unused'>
  | NameSelectorSchema<'typeParameter', false, 'unused'>
  | NameSelectorSchema<'import', false, 'default' | 'namespace'>
>;
type NoConfusingVoidExpressionOption = Partial<{
  ignoreArrowShorthand: boolean;
  ignoreVoidOperator: boolean;
}>;
type NoEmptyFunctionOption = ESLintRuleOption['no-empty-function'] extends [infer U, ...infer args]
  ? U extends {allow?: Array<infer A>}
    ? [Omit<U, 'allow'> & Partial<{
      allow: Array<A | 'private-constructors' | 'protected-constructors' | 'decoratedFunctions' | 'overrideMethods'>;
    }>, ...args]
    : never
  : never;
type NoExtraneousClassOption = Partial<{
  allowConstructorOnly: boolean;
  allowEmpty: boolean;
  allowStaticOnly: boolean;
  allowWithDecorator: boolean;
}>;
type NoInvalidVoidTypeOption = Partial<{
  allowInGenericTypeArguments: boolean | string[];
  allowAsThisParameter: boolean;
}>;
type NoMagicNumbersOption = ExtendsTupleFirstEl<ESLintRuleOption['no-magic-numbers'], Partial<{
  ignoreNumericLiteralTypes: boolean;
  ignoreEnums: boolean;
  ignoreReadonlyClassProperties: boolean;
  ignoreTypeIndexes: boolean;
}>>;
type NoMisusedPromisesOption = Partial<{
  checksConditionals: boolean;
  checksSpreads: boolean;
  checksVoidReturn: boolean | Partial<{
    arguments: boolean;
    attributes: boolean;
    properties: boolean;
    returns: boolean;
    variables: boolean;
  }>;
}>;
interface NoRestrictedImportsAppend {
  allowTypeImports?: boolean;
}
type NoRestrictedImportsOption = ESLintRuleOption['no-restricted-imports'] extends Array<infer U>
  ? Array<
    U extends {paths?: Array<infer O>}
      ? Omit<U, 'paths'> & Partial<{
        paths: MergeIntersectionObject<O, NoRestrictedImportsAppend>;
      }>
      : MergeIntersectionObject<U, NoRestrictedImportsAppend>
  >
  : never;
type NoShadowOption = ExtendsTupleFirstEl<ESLintRuleOption['no-shadow'], Partial<{
  ignoreOnInitialization: boolean;
  ignoreTypeValueShadow: boolean;
  ignoreFunctionTypeParameterNameValueShadow: boolean;
}>>;
type NoUseBeforeDefineOption = ESLintRuleOption['no-use-before-define'] extends [infer U, ...infer args]
  ? [
      MergeIntersectionObject<U, Partial<{
        enums: boolean;
        typedefs: boolean;
        ignoreTypeReferences: boolean;
      }>>,
      ...args
    ]
  : never;
type ParameterPropertiesModifier = 'private' | 'protected' | 'public' | 'readonly' | 'private readonly' | 'protected readonly' | 'public readonly';
type PreferDestructuringOption = ESLintRuleOption['prefer-destructuring'] extends [infer F, infer S, ...infer args]
  ? [F, S & {
    enforceForDeclarationWithTypeAnnotation?: boolean;
  }, ...args]
  : never;
type PreferNullishCoalescingOption = Partial<{
  allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: boolean;
  ignoreConditionalTests: boolean;
  ignoreMixedLogicalExpressions: boolean;
  ignorePrimitives: true | Partial<{
    bigint: boolean;
    boolean: boolean;
    number: boolean;
    string: boolean;
  }>;
  ignoreTernaryTests: boolean;
}>;
type PreferOptionalChainOption = Partial<{
  checkAny: boolean;
  checkUnknown: boolean;
  checkNumber: boolean;
  checkBoolean: boolean;
  checkBigInt: boolean;
  requireNullish: boolean;
  allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: boolean;
}>;
type PreferReadonlyParameterTypesOption = Partial<{
  checkParameterProperties: boolean;
  ignoreInferredTypes: boolean;
  treatMethodsAsReadonly: boolean;
  allow: Array<string | {
    from: 'file';
    name: string[] | string;
    path?: string;
  } | {
    from: 'lib';
    name: string[] | string;
  } | {
    from: 'package';
    name: string[] | string;
    package: string;
  }>;
}>;
type PromiseFunctionAsyncOption = Partial<{
  allowAny: boolean;
  allowedPromiseNames: string[];
  checkArrowFunctions: boolean;
  checkFunctionDeclarations: boolean;
  checkFunctionExpressions: boolean;
  checkMethodDeclarations: boolean;
}>;
type RestrictPlusOperandsOption = Partial<{
  allowAny: boolean;
  allowBoolean: boolean;
  allowNullish: boolean;
  allowNumberAndString: boolean;
  allowRegExp: boolean;
  skipCompoundAssignments: boolean;
}>;
type RestrictTemplateExpressionsOption = Partial<{
  allowAny: boolean;
  allowBoolean: boolean;
  allowNullish: boolean;
  allowNumber: boolean;
  allowRegExp: boolean;
  allowNever: boolean;
}>;
type SortTypeConstituentsOption = Partial<{
  checkIntersections: boolean;
  checkUnions: boolean;
  groupOrder: 'conditional' | 'function' | 'import' | 'intersection' | 'keyword' | 'nullish' | 'literal' | 'named' | 'object' | 'operator' | 'tuple' | 'union';
}>;
type StrictBooleanExpressionsOption = Partial<{
  allowString: boolean;
  allowNumber: boolean;
  allowNullableObject: boolean;
  allowNullableBoolean: boolean;
  allowNullableString: boolean;
  allowNullableNumber: boolean;
  allowNullableEnum: boolean;
  allowAny: boolean;
  allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: boolean;
}>;
type Frequency = 'always' | 'never';
type TripleSlashReferenceOption = Partial<{
  lib: Frequency;
  path: Frequency;
  types: Frequency | 'prefer-import';
}>;
type TypedefOption = Partial<{
  arrayDestructuring: boolean;
  arrowParameter: boolean;
  memberVariableDeclaration: boolean;
  objectDestructuring: boolean;
  parameter: boolean;
  propertyDeclaration: boolean;
  variableDeclaration: boolean;
  variableDeclarationIgnoreFunction: boolean;
}>;

interface CustomRuleOption {
  [K: string]: any[];
}
/**
 * @typescript-eslint/eslint-plugin插件包含rule的参数类型
 * @see https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/rules/index.ts
 */
export interface TSRuleOptions extends CustomRuleOption {
  'adjacent-overload-signatures': [];
  /**
   * default [{default: 'array'}]
   */
  'array-type': [Partial<Record<'default' | 'readonly', 'array' | 'generic' | 'array-simple'>>];
  'await-thenable': [];
  /**
   * default [{
   * 'ts-expect-error': 'allow-with-description',
   * 'ts-ignore': true,
   * 'ts-nocheck': true,
   * 'ts-check': false,
   *  minimumDescriptionLength: 3
   * }]
   */
  'ban-ts-comment': [Partial<{
    'ts-check': BanTSCommentOption;
    'ts-expect-error': BanTSCommentOption;
    'ts-ignore': BanTSCommentOption;
    'ts-nocheck': BanTSCommentOption;
    minimumDescriptionLength: number;
  }>];
  'ban-tslint-comment': [];
  'ban-types': [Partial<{
    extendDefaults: boolean;
    types: Record<string, BanTypesOption>;
  }>];
  /**
   * default ['fields']
   */
  'class-literal-property-style': ['fields' | 'getters'];
  /**
   * default [{
   * enforceForClassFields: true,
   * exceptMethods: [],
   * ignoreOverrideMethods: false,
   * ignoreClassesThatImplementAnInterface: false
   * }]
   */
  'class-methods-use-this': ClassMethodsUseThisOption;
  /**
   * default ['constructor']
   */
  'consistent-generic-constructors': ['type-annotation' | 'constructor'];
  /**
   * default ['record']
   */
  'consistent-indexed-object-style': ['record' | 'index-signature'];
  /**
   * default [{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }]
   */
  'consistent-type-assertions': [{
    assertionStyle: 'never';
  } | {
    assertionStyle: 'angle-bracket' | 'as';
    objectLiteralTypeAssertions?: 'allow' | 'allow-as-parameter' | 'never';
  }];
  /**
   * default ['interface']
   */
  'consistent-type-definitions': ['interface' | 'type'];
  /**
   * default [{fixMixedExportsWithInlineTypeSpecifier: false}]
   */
  'consistent-type-exports': [{
    fixMixedExportsWithInlineTypeSpecifier?: boolean;
  }];
  /**
   * default [{prefer: 'type-imports', disallowTypeAnnotations: true, fixStyle: 'separate-type-imports'}]
   */
  'consistent-type-imports': [ConsistentTypeImportsOption];
  'default-param-last': [];
  /**
   * default [{
   * allowPrivateClassPropertyAccess: false,
   * allowProtectedClassPropertyAccess: false,
   * allowIndexSignaturePropertyAccess: false,
   * allowKeywords: true,
   * allowPattern: ''
   * }]
   */
  'dot-notation': DotNotationOption;
  /**
   * default [{
   * allowExpressions: false,
   * allowTypedFunctionExpressions: true,
   * allowHigherOrderFunctions: true,
   * allowDirectConstAssertionInArrowFunctions: true,
   * allowConciseArrowFunctionExpressionsStartingWithVoid: false,
   * allowFunctionsWithoutTypeParameters: false,
   * allowedNames: [],
   * allowIIFEs: false
   * }]
   */
  'explicit-function-return-type': [ExplicitFunctionReturnTypeOption];
  /**
   * default [{accessibility: 'explicit'}]
   */
  'explicit-member-accessibility': [ExplicitMemberAccessibilityOption];
  /**
   * default [{
   * allowArgumentsExplicitlyTypedAsAny: false,
   * allowDirectConstAssertionInArrowFunctions: true,
   * allowedNames: [],
   * allowHigherOrderFunctions: true,
   * allowTypedFunctionExpressions: true
   * }]
   */
  'explicit-module-boundary-types': [ExplicitModuleBoundaryTypesOption];
  'init-declarations': ESLintRuleOption['init-declarations'];
  /**
   * default [{ max: 3, countVoidThis: false }]
   */
  'max-params': [MaxParamsOption];
  /**
   * default [{default: {memberTypes: defaultOrder}}]
   */
  'member-ordering': [MemberOrderingOption];
  /**
   * default ['property']
   */
  'method-signature-style': ['method' | 'property'];
  /**
   * default [{
   * selector: 'default',
   * format: ['camelCase'],
   * leadingUnderscore: 'allow',
   * trailingUnderscore: 'allow'
   * }, {
   * selector: 'import',
   * format: ['camelCase', 'PascalCase']
   * }, {
   * selector: 'variable',
   * format: ['camelCase', 'UPPER_CASE'],
   * leadingUnderscore: 'allow',
   * trailingUnderscore: 'allow'
   * }, {
   * selector: 'typeLike',
   * format: ['PascalCase']
   * }]
   */
  'naming-convention': [NamingConventionOption];
  'no-array-constructor': [];
  'no-array-delete': [];
  /**
   * default [{ignoredTypeNames: ['Error', 'RegExp', 'URL', 'URLSearchParams']}]
   */
  'no-base-to-string': [Partial<{
    ignoredTypeNames: string[];
  }>];
  'no-confusing-non-null-assertion': [];
  /**
   * default [{ ignoreArrowShorthand: false, ignoreVoidOperator: false }]
   */
  'no-confusing-void-expression': [NoConfusingVoidExpressionOption];
  'no-duplicate-enum-values': [];
  /**
   * default [{ignoreIntersections: false, ignoreUnions: false}]
   */
  'no-duplicate-type-constituents': [Partial<{
    ignoreIntersections: boolean;
    ignoreUnions: boolean;
  }>];
  'no-dynamic-delete': [];
  /**
   * default [{allow: []}]
   */
  'no-empty-function': NoEmptyFunctionOption;
  /**
   * default [{allowSingleExtends: false}]
   */
  'no-empty-interface': [{
    allowSingleExtends?: boolean;
  }];
  /**
   * default [{fixToUnknown: false, ignoreRestArgs: false}]
   */
  'no-explicit-any': [Partial<{
    fixToUnknown?: boolean;
    ignoreRestArgs?: boolean;
  }>];
  'no-extra-non-null-assertion': [];
  /**
   * default [{ allowConstructorOnly: false, allowEmpty: false, allowStaticOnly: false, allowWithDecorator: false}]
   */
  'no-extraneous-class': [NoExtraneousClassOption];
  /**
   * default [{ignoreVoid: true, ignoreIIFE: false}]
   */
  'no-floating-promises': [Partial<{
    ignoreVoid: boolean;
    ignoreIIFE:boolean;
  }>];
  'no-for-in-array': [];
  'no-implied-eval': [];
  'no-import-type-side-effects': [];
  /**
   * default [{ignoreParameters: false, ignoreProperties: false}]
   */
  'no-inferrable-types': [Partial<{
    ignoreParameters: boolean;
    ignoreProperties: boolean;
  }>];
  'no-invalid-void-type': [NoInvalidVoidTypeOption];
  'no-loop-func': [];
  'no-loss-of-precision': [];
  'no-magic-numbers': NoMagicNumbersOption;
  /**
   * default [{checkNever: false}]
   */
  'no-meaningless-void-operator': [Partial<{
    checkNever: boolean;
  }>];
  'no-misused-new': [];
  /**
   * default [{checksConditionals: true, checksVoidReturn: true, checksSpreads: true}]
   */
  'no-misused-promises': [NoMisusedPromisesOption];
  'no-mixed-enums': [];
  /**
   * default [{ allowDeclarations: false, allowDefinitionFiles: true}]
   */
  'no-namespace': [Partial<{
    allowDeclarations: boolean;
    allowDefinitionFiles: boolean;
  }>];
  'no-non-null-asserted-nullish-coalescing': [];
  'no-non-null-asserted-optional-chain': [];
  'no-non-null-assertion': [];
  'no-redundant-type-constituents': [];
  /**
   * default [{allow: []}]
   */
  'no-require-imports': [Partial<{
    allow: string[];
  }>];
  /**
   * default []
   */
  'no-restricted-imports': [NoRestrictedImportsOption];
  /**
   * default [{
   * allow: [],
   * builtinGlobals: false,
   * hoist: 'functions',
   * ignoreOnInitialization: false,
   * ignoreTypeValueShadow: true,
   * ignoreFunctionTypeParameterNameValueShadow: true
   * }]
   */
  'no-shadow': NoShadowOption;
  /**
   * default [{allowDestructuring: true, allowedNames: []}]
   */
  'no-this-alias': [Partial<{
    allowDestructuring: boolean;
    allowedNames: string[];
  }>];
  /**
   * default [{allowThrowingAny: true, allowThrowingUnknown: true}]
   */
  'no-throw-literal': [Partial<{
    allowThrowingAny: boolean;
    allowThrowingUnknown: boolean;
  }>];
  /**
   * default [{ allowComparingNullableBooleansToTrue: true, allowComparingNullableBooleansToFalse: true}]
   */
  'no-unnecessary-boolean-literal-compare': [Partial<{
    allowComparingNullableBooleansToTrue: boolean;
    allowComparingNullableBooleansToFalse: boolean;
  }>];
  /**
   * default [{allowConstantLoopConditions: false, allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false}]
   */
  'no-unnecessary-condition': [Partial<{
    allowConstantLoopConditions: boolean;
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: boolean;
  }>];
  'no-unnecessary-qualifier': [];
  'no-unnecessary-type-arguments': [];
  'no-unnecessary-type-assertion': [Partial<{
    typesToIgnore: string[];
  }>];
  'no-unnecessary-type-constraint': [];
  'no-unsafe-argument': [];
  'no-unsafe-assignment': [];
  'no-unsafe-call': [];
  'no-unsafe-declaration-merging': [];
  'no-unsafe-enum-comparison': [];
  'no-unsafe-member-access': [];
  'no-unsafe-return': [];
  'no-unsafe-unary-minus': [];
  /**
   * default [{allowShortCircuit: false, allowTernary: false, allowTaggedTemplates: false}]
   */
  'no-unused-expressions': ESLintRuleOption['no-unused-expressions'];
  /**
   * default [{}]
   */
  'no-unused-vars': ESLintRuleOption['no-unused-vars'];
  /**
   * default [{
   * functions: true,
   * classes: true,
   * enums: true,
   * variables: true,
   * typedefs: true,
   * ignoreTypeReferences: true,
   * allowNamedExports: false
   * }]
   */
  'no-use-before-define': NoUseBeforeDefineOption;
  /**
   * default []
   */
  'no-useless-constructor': ESLintRuleOption['no-useless-constructor'];
  'no-useless-empty-export': [];
  'no-useless-template-literals': [];
  /**
   * default [{allow: []}]
   */
  'no-var-requires': [Partial<{
    allow: string[];
  }>];
  'non-nullable-type-assertion-style': [];
  'parameter-properties': [Partial<{
    allow: ParameterPropertiesModifier;
    prefer: 'class-property' | 'parameter-property';
  }>];
  'prefer-as-const': [];
  /**
   * default [{
   * VariableDeclarator: { array: true, object: true},
   * AssignmentExpression: { array: true, object: true, }
   * }, {}]
   */
  'prefer-destructuring': PreferDestructuringOption;
  'prefer-enum-initializers': [];
  'prefer-find': [];
  'prefer-for-of': [];
  'prefer-function-type': [];
  'prefer-includes': [];
  /**
   * default [{allowBitwiseExpressions: false}]
   */
  'prefer-literal-enum-member': [Partial<{
    allowBitwiseExpressions: boolean;
  }>];
  'prefer-namespace-keyword': [];
  /**
   * default [{
   * allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
   * ignoreConditionalTests: false,
   * ignoreTernaryTests: false,
   * ignoreMixedLogicalExpressions: false,
   * ignorePrimitives: {bigint: false, boolean: false, number: false, string: false}
   * }]
   */
  'prefer-nullish-coalescing': [PreferNullishCoalescingOption];
  /**
   * default [{
   * checkAny: true,
   * checkUnknown: true,
   * checkString: true,
   * checkNumber: true,
   * checkBoolean: true,
   * checkBigInt: true,
   * requireNullish: false,
   * allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false
   * }]
   */
  'prefer-optional-chain': [PreferOptionalChainOption];
  /**
   * default [{ allowEmptyReject: false}]
   */
  'prefer-promise-reject-errors': ESLintRuleOption['prefer-promise-reject-errors'];
  /**
   * default [{
   * allow: [],
   * checkParameterProperties: true,
   * ignoreInferredTypes: false,
   * treatMethodsAsReadonly: false
   * }]
   */
  'prefer-readonly-parameter-types': [PreferReadonlyParameterTypesOption];
  /**
   * default [{onlyInlineLambdas: false}]
   */
  'prefer-readonly': [Partial<{
    onlyInlineLambdas: boolean;
  }>];
  'prefer-reduce-type-parameter': [];
  'prefer-regexp-exec': [];
  'prefer-return-this-type': [];
  'prefer-string-starts-ends-with': [];
  'prefer-ts-expect-error': [];
  /**
   * default [{
   * allowAny: true,
   * allowedPromiseNames: [],
   * checkArrowFunctions: true,
   * checkFunctionDeclarations: true,
   * checkFunctionExpressions: true,
   * checkMethodDeclarations: true
   * }]
   */
  'promise-function-async': [PromiseFunctionAsyncOption];
  /**
   * default [{ignoreStringArrays: true}]
   */
  'require-array-sort-compare': [Partial<{
    ignoreStringArrays: boolean;
  }>];
  'require-await': ESLintRuleOption['require-await'];
  /**
   * default [{
   * allowAny: true,
   * allowBoolean: true,
   * allowNullish: true,
   * allowNumberAndString: true,
   * allowRegExp: true,
   * skipCompoundAssignments: false
   * }]
   */
  'restrict-plus-operands': [RestrictPlusOperandsOption];
  /**
   * default [{
   * allowAny: true,
   * allowBoolean: true,
   * allowNullish: true,
   * allowNumber: true,
   * allowRegExp: true,
   * allowNever: false
   * }]
   */
  'restrict-template-expressions': [RestrictTemplateExpressionsOption];
  /**
   * default ['in-try-catch']
   */
  'return-await': ['in-try-catch' | Frequency];
  /**
   * default [{
   * checkIntersections: true,
   * checkUnions: true,
   * groupOrder: ['named', 'keyword', 'operator', 'literal', 'function', 'import', 'conditional', 'object', 'tuple', 'intersection', 'union', 'nullish']
   * }]
   */
  'sort-type-constituents': [SortTypeConstituentsOption];
  /**
   * default [{
   * allowString: true,
   * allowNumber: true,
   * allowNullableObject: true,
   * allowNullableBoolean: false,
   * allowNullableString: false,
   * allowNullableNumber: false,
   * allowNullableEnum: false,
   * allowAny: false,
   * allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false
   * }]
   */
  'strict-boolean-expressions': [StrictBooleanExpressionsOption];
  /**
   * default [{
   * allowDefaultCaseForExhaustiveSwitch: true,
   * requireDefaultForNonUnion: false
   * }]
   */
  'switch-exhaustiveness-check': [Partial<{
    allowDefaultCaseForExhaustiveSwitch: boolean;
    requireDefaultForNonUnion: boolean;
  }>];
  /**
   * default [{
   * lib: 'always',
   * path: 'never',
   * types: 'prefer-import'
   * }]
   */
  'triple-slash-reference': [TripleSlashReferenceOption];
  /**
   * default [{
   * arrayDestructuring: boolean;
   * arrowParameter: boolean;
   * memberVariableDeclaration: boolean;
   * objectDestructuring: boolean;
   * parameter: boolean;
   * propertyDeclaration: boolean;
   * variableDeclaration: boolean;
   * variableDeclarationIgnoreFunction: boolean;
   * }]
   */
  'typedef': [TypedefOption];
  /**
   * default [{ignoreStatic: false}]
   */
  'unbound-method': [Partial<{
    ignoreStatic: boolean;
  }>];
  /**
   * default [{ignoreDifferentlyNamedParameters: false}]
   */
  'unified-signatures': [Partial<{
    ignoreDifferentlyNamedParameters: boolean;
  }>];
}