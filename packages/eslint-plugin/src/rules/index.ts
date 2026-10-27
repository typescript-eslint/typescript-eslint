/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return */
import { lazyRules } from '../util/lazyRules';

const rules = lazyRules({
  'adjacent-overload-signatures': () =>
    require('./adjacent-overload-signatures'),
  'array-type': () => require('./array-type'),
  'await-thenable': () => require('./await-thenable'),
  'ban-ts-comment': () => require('./ban-ts-comment'),
  'ban-tslint-comment': () => require('./ban-tslint-comment'),
  'class-literal-property-style': () =>
    require('./class-literal-property-style'),
  'class-methods-use-this': () => require('./class-methods-use-this'),
  'consistent-generic-constructors': () =>
    require('./consistent-generic-constructors'),
  'consistent-indexed-object-style': () =>
    require('./consistent-indexed-object-style'),
  'consistent-return': () => require('./consistent-return'),
  'consistent-type-assertions': () => require('./consistent-type-assertions'),
  'consistent-type-definitions': () => require('./consistent-type-definitions'),
  'consistent-type-exports': () => require('./consistent-type-exports'),
  'consistent-type-imports': () => require('./consistent-type-imports'),
  'default-param-last': () => require('./default-param-last'),
  'dot-notation': () => require('./dot-notation'),
  'explicit-function-return-type': () =>
    require('./explicit-function-return-type'),
  'explicit-member-accessibility': () =>
    require('./explicit-member-accessibility'),
  'explicit-module-boundary-types': () =>
    require('./explicit-module-boundary-types'),
  'init-declarations': () => require('./init-declarations'),
  'max-params': () => require('./max-params'),
  'member-ordering': () => require('./member-ordering'),
  'method-signature-style': () => require('./method-signature-style'),
  'naming-convention': () => require('./naming-convention'),
  'no-array-constructor': () => require('./no-array-constructor'),
  'no-array-delete': () => require('./no-array-delete'),
  'no-base-to-string': () => require('./no-base-to-string'),
  'no-confusing-non-null-assertion': () =>
    require('./no-confusing-non-null-assertion'),
  'no-confusing-void-expression': () =>
    require('./no-confusing-void-expression'),
  'no-deprecated': () => require('./no-deprecated'),
  'no-dupe-class-members': () => require('./no-dupe-class-members'),
  'no-duplicate-enum-values': () => require('./no-duplicate-enum-values'),
  'no-duplicate-type-constituents': () =>
    require('./no-duplicate-type-constituents'),
  'no-dynamic-delete': () => require('./no-dynamic-delete'),
  'no-empty-function': () => require('./no-empty-function'),
  'no-empty-interface': () => require('./no-empty-interface'),
  'no-empty-object-type': () => require('./no-empty-object-type'),
  'no-explicit-any': () => require('./no-explicit-any'),
  'no-extra-non-null-assertion': () => require('./no-extra-non-null-assertion'),
  'no-extraneous-class': () => require('./no-extraneous-class'),
  'no-floating-promises': () => require('./no-floating-promises'),
  'no-for-in-array': () => require('./no-for-in-array'),
  'no-generated-empty-object-type': () =>
    require('./no-generated-empty-object-type'),
  'no-implied-eval': () => require('./no-implied-eval'),
  'no-import-type-side-effects': () => require('./no-import-type-side-effects'),
  'no-inferrable-types': () => require('./no-inferrable-types'),
  'no-invalid-this': () => require('./no-invalid-this'),
  'no-invalid-void-type': () => require('./no-invalid-void-type'),
  'no-loop-func': () => require('./no-loop-func'),
  'no-loss-of-precision': () => require('./no-loss-of-precision'),
  'no-magic-numbers': () => require('./no-magic-numbers'),
  'no-meaningless-void-operator': () =>
    require('./no-meaningless-void-operator'),
  'no-misused-new': () => require('./no-misused-new'),
  'no-misused-promises': () => require('./no-misused-promises'),
  'no-misused-spread': () => require('./no-misused-spread'),
  'no-mixed-enums': () => require('./no-mixed-enums'),
  'no-namespace': () => require('./no-namespace'),
  'no-non-null-asserted-nullish-coalescing': () =>
    require('./no-non-null-asserted-nullish-coalescing'),
  'no-non-null-asserted-optional-chain': () =>
    require('./no-non-null-asserted-optional-chain'),
  'no-non-null-assertion': () => require('./no-non-null-assertion'),
  'no-redeclare': () => require('./no-redeclare'),
  'no-redundant-default-arguments': () =>
    require('./no-redundant-default-arguments'),
  'no-redundant-type-constituents': () =>
    require('./no-redundant-type-constituents'),
  'no-require-imports': () => require('./no-require-imports'),
  'no-restricted-imports': () => require('./no-restricted-imports'),
  'no-restricted-types': () => require('./no-restricted-types'),
  'no-shadow': () => require('./no-shadow'),
  'no-this-alias': () => require('./no-this-alias'),
  'no-type-alias': () => require('./no-type-alias'),
  'no-unnecessary-boolean-literal-compare': () =>
    require('./no-unnecessary-boolean-literal-compare'),
  'no-unnecessary-condition': () => require('./no-unnecessary-condition'),
  'no-unnecessary-parameter-property-assignment': () =>
    require('./no-unnecessary-parameter-property-assignment'),
  'no-unnecessary-qualifier': () => require('./no-unnecessary-qualifier'),
  'no-unnecessary-template-expression': () =>
    require('./no-unnecessary-template-expression'),
  'no-unnecessary-type-arguments': () =>
    require('./no-unnecessary-type-arguments'),
  'no-unnecessary-type-assertion': () =>
    require('./no-unnecessary-type-assertion'),
  'no-unnecessary-type-constraint': () =>
    require('./no-unnecessary-type-constraint'),
  'no-unnecessary-type-conversion': () =>
    require('./no-unnecessary-type-conversion'),
  'no-unnecessary-type-parameters': () =>
    require('./no-unnecessary-type-parameters'),
  'no-unsafe-argument': () => require('./no-unsafe-argument'),
  'no-unsafe-assignment': () => require('./no-unsafe-assignment'),
  'no-unsafe-call': () => require('./no-unsafe-call'),
  'no-unsafe-declaration-merging': () =>
    require('./no-unsafe-declaration-merging'),
  'no-unsafe-enum-assignment': () => require('./no-unsafe-enum-assignment'),
  'no-unsafe-enum-comparison': () => require('./no-unsafe-enum-comparison'),
  'no-unsafe-function-type': () => require('./no-unsafe-function-type'),
  'no-unsafe-member-access': () => require('./no-unsafe-member-access'),
  'no-unsafe-return': () => require('./no-unsafe-return'),
  'no-unsafe-type-assertion': () => require('./no-unsafe-type-assertion'),
  'no-unsafe-unary-minus': () => require('./no-unsafe-unary-minus'),
  'no-unused-expressions': () => require('./no-unused-expressions'),
  'no-unused-private-class-members': () =>
    require('./no-unused-private-class-members'),
  'no-unused-vars': () => require('./no-unused-vars'),
  'no-use-before-define': () => require('./no-use-before-define'),
  'no-useless-constructor': () => require('./no-useless-constructor'),
  'no-useless-default-assignment': () =>
    require('./no-useless-default-assignment'),
  'no-useless-empty-export': () => require('./no-useless-empty-export'),
  'no-var-requires': () => require('./no-var-requires'),
  'no-wrapper-object-types': () => require('./no-wrapper-object-types'),
  'non-nullable-type-assertion-style': () =>
    require('./non-nullable-type-assertion-style'),
  'only-throw-error': () => require('./only-throw-error'),
  'parameter-properties': () => require('./parameter-properties'),
  'prefer-as-const': () => require('./prefer-as-const'),
  'prefer-destructuring': () => require('./prefer-destructuring'),
  'prefer-enum-initializers': () => require('./prefer-enum-initializers'),
  'prefer-find': () => require('./prefer-find'),
  'prefer-for-of': () => require('./prefer-for-of'),
  'prefer-function-type': () => require('./prefer-function-type'),
  'prefer-includes': () => require('./prefer-includes'),
  'prefer-literal-enum-member': () => require('./prefer-literal-enum-member'),
  'prefer-namespace-keyword': () => require('./prefer-namespace-keyword'),
  'prefer-nullish-coalescing': () => require('./prefer-nullish-coalescing'),
  'prefer-optional-chain': () => require('./prefer-optional-chain'),
  'prefer-promise-reject-errors': () =>
    require('./prefer-promise-reject-errors'),
  'prefer-readonly': () => require('./prefer-readonly'),
  'prefer-readonly-parameter-types': () =>
    require('./prefer-readonly-parameter-types'),
  'prefer-reduce-type-parameter': () =>
    require('./prefer-reduce-type-parameter'),
  'prefer-regexp-exec': () => require('./prefer-regexp-exec'),
  'prefer-return-this-type': () => require('./prefer-return-this-type'),
  'prefer-string-starts-ends-with': () =>
    require('./prefer-string-starts-ends-with'),
  'prefer-ts-expect-error': () => require('./prefer-ts-expect-error'),
  'promise-function-async': () => require('./promise-function-async'),
  'related-getter-setter-pairs': () => require('./related-getter-setter-pairs'),
  'require-array-sort-compare': () => require('./require-array-sort-compare'),
  'require-await': () => require('./require-await'),
  'restrict-plus-operands': () => require('./restrict-plus-operands'),
  'restrict-template-expressions': () =>
    require('./restrict-template-expressions'),
  'return-await': () => require('./return-await'),
  'sort-type-constituents': () => require('./sort-type-constituents'),
  'strict-boolean-expressions': () => require('./strict-boolean-expressions'),
  'strict-void-return': () => require('./strict-void-return'),
  'switch-exhaustiveness-check': () => require('./switch-exhaustiveness-check'),
  'triple-slash-reference': () => require('./triple-slash-reference'),
  typedef: () => require('./typedef'),
  'unbound-method': () => require('./unbound-method'),
  'unified-signatures': () => require('./unified-signatures'),
  'use-unknown-in-catch-callback-variable': () =>
    require('./use-unknown-in-catch-callback-variable'),
});

export = rules;
