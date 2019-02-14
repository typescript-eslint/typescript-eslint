# Roadmap

✅ = done<br>
🌟 = in ESLint core<br>
🔌 = in another plugin<br>
🌓 = implementations differ or ESLint version is missing functionality<br>
🛑 = unimplemented<br>

## TSLint rules

### TypeScript-specific

| TSLint rule                       |     | ESLint rule                                          |
| --------------------------------- | :-: | ---------------------------------------------------- |
| [`adjacent-overload-signatures`]  | ✅  | [`@typescript-eslint/adjacent-overload-signatures`]  |
| [`ban-ts-ignore`]                 | 🛑  | N/A                                                  |
| [`ban-types`]                     | ✅  | [`@typescript-eslint/ban-types`]                     |
| [`member-access`]                 | ✅  | [`@typescript-eslint/explicit-member-accessibility`] |
| [`member-ordering`]               | ✅  | [`@typescript-eslint/member-ordering`]               |
| [`no-any`]                        | ✅  | [`@typescript-eslint/no-explicit-any`]               |
| [`no-empty-interface`]            | ✅  | [`@typescript-eslint/no-empty-interface`]            |
| [`no-import-side-effect`]         | 🔌  | [`import/no-unassigned-import`]                      |
| [`no-inferrable-types`]           | ✅  | [`@typescript-eslint/no-inferrable-types`]           |
| [`no-internal-module`]            | ✅  | [`@typescript-eslint/prefer-namespace-keyword`]      |
| [`no-magic-numbers`]              | 🌟  | [`no-magic-numbers`][no-magic-numbers]               |
| [`no-namespace`]                  | ✅  | [`@typescript-eslint/no-namespace`]                  |
| [`no-non-null-assertion`]         | ✅  | [`@typescript-eslint/no-non-null-assertion`]         |
| [`no-parameter-reassignment`]     | ✅  | [`no-param-reassign`][no-param-reassign]             |
| [`no-reference`]                  | ✅  | [`@typescript-eslint/no-triple-slash-reference`]     |
| [`no-unnecessary-type-assertion`] | ✅  | [`@typescript-eslint/no-unnecessary-type-assertion`] |
| [`no-var-requires`]               | ✅  | [`@typescript-eslint/no-var-requires`]               |
| [`only-arrow-functions`]          | 🔌  | [`prefer-arrow/prefer-arrow-functions`]              |
| [`prefer-for-of`]                 | 🛑  | N/A                                                  |
| [`promise-function-async`]        | ✅  | [`@typescript-eslint/promise-function-async`]        |
| [`typedef`]                       | 🛑  | N/A                                                  |
| [`typedef-whitespace`]            | ✅  | [`@typescript-eslint/type-annotation-spacing`]       |
| [`unified-signatures`]            | 🛑  | N/A                                                  |

### Functionality

| TSLint rule                          |     | ESLint rule                                                           |
| ------------------------------------ | :-: | --------------------------------------------------------------------- |
| [`await-promise`]                    | 🛑  | N/A                                                                   |
| [`ban-comma-operator`]               | 🌟  | [`no-sequences`][no-sequences]                                        |
| [`ban`]                              | 🌟  | [`no-restricted-properties`][no-restricted-properties]                |
| [`curly`]                            | 🌟  | [`curly`][curly]                                                      |
| [`forin`]                            | 🌟  | [`guard-for-in`][guard-for-in]                                        |
| [`function-constructor`]             | 🌟  | [`no-new-func`][no-new-func]                                          |
| [`import-blacklist`]                 | 🌟  | [`no-restricted-imports`][no-restricted-imports]                      |
| [`label-position`]                   | 🌟  | [`no-unused-labels`][no-unused-labels] (similar)                      |
| [`no-arg`]                           | 🌟  | [`no-caller`][no-caller] (also blocks `arguments.caller`)             |
| [`no-bitwise`]                       | 🌟  | [`no-bitwise`][no-bitwise]                                            |
| [`no-conditional-assignment`]        | 🌟  | [`no-cond-assign`][no-cond-assign]<sup>[1]</sup>                      |
| [`no-console`]                       | 🌟  | [`no-console`][no-console] (configuration works slightly differently) |
| [`no-construct`]                     | 🌟  | [`no-new-wrappers`][no-new-wrappers]                                  |
| [`no-debugger`]                      | 🌟  | [`no-debugger`][no-debugger]                                          |
| [`no-duplicate-super`]               | 🌟  | [`constructor-super`][constructor-super]                              |
| [`no-duplicate-switch-case`]         | 🌟  | [`no-duplicate-case`][no-duplicate-case]                              |
| [`no-duplicate-variable`]            | 🌟  | [`no-redeclare`][no-redeclare]                                        |
| [`no-dynamic-delete`]                | 🛑  | N/A                                                                   |
| [`no-empty`]                         | 🌟  | [`no-empty`][no-empty]                                                |
| [`no-eval`]                          | 🌟  | [`no-eval`][no-eval]                                                  |
| [`no-floating-promises`]             | 🛑  | N/A ([relevant plugin][plugin:promise])                               |
| [`no-for-in-array`]                  | ✅  | [`@typescript-eslint/no-for-in-array`]                                |
| [`no-implicit-dependencies`]         | 🔌  | [`import/no-extraneous-dependencies`]                                 |
| [`no-inferred-empty-object-type`]    | 🛑  | N/A                                                                   |
| [`no-invalid-template-strings`]      | 🌟  | [`no-template-curly-in-string`][no-template-curly-in-string]          |
| [`no-invalid-this`]                  | 🌟  | [`no-invalid-this`][no-invalid-this]                                  |
| [`no-misused-new`]                   | ✅  | [`@typescript-eslint/no-misused-new`]                                 |
| [`no-null-keyword`]                  | 🔌  | [`no-null/no-null`] (doesn’t handle `null` type)                      |
| [`no-object-literal-type-assertion`] | ✅  | [`@typescript-eslint/no-object-literal-type-assertion`]               |
| [`no-return-await`]                  | 🌟  | [`no-return-await`][no-return-await]                                  |
| [`no-shadowed-variable`]             | 🌟  | [`no-shadow`][no-shadow]                                              |
| [`no-sparse-arrays`]                 | 🌟  | [`no-sparse-arrays`][no-sparse-arrays]                                |
| [`no-string-literal`]                | 🌟  | [`dot-notation`][dot-notation]                                        |
| [`no-string-throw`]                  | 🌟  | [`no-throw-literal`][no-throw-literal]                                |
| [`no-submodule-imports`]             | 🌓  | [`import/no-internal-modules`] (slightly different)                   |
| [`no-switch-case-fall-through`]      | 🌟  | [`no-fallthrough`][no-fallthrough]                                    |
| [`no-this-assignment`]               | ✅  | [`@typescript-eslint/no-this-alias`]                                  |
| [`no-unbound-method`]                | 🛑  | N/A                                                                   |
| [`no-unnecessary-class`]             | ✅  | [`@typescript-eslint/no-extraneous-class`]                            |
| [`no-unsafe-any`]                    | 🛑  | N/A                                                                   |
| [`no-unsafe-finally`]                | 🌟  | [`no-unsafe-finally`][no-unsafe-finally]                              |
| [`no-unused-expression`]             | 🌟  | [`no-unused-expression`][no-unused-expressions]                       |
| [`no-unused-variable`]               | 🌓  | [`no-unused-vars`][no-unused-vars] <sup>[2]</sup>                     |
| [`no-use-before-declare`]            | ✅  | [`@typescript-eslint/no-use-before-define`]                           |
| [`no-var-keyword`]                   | 🌟  | [`no-var`][no-var]                                                    |
| [`no-void-expression`]               | 🌟  | [`no-void`][no-void]                                                  |
| [`prefer-conditional-expression`]    | 🛑  | N/A                                                                   |
| [`prefer-object-spread`]             | 🌟  | [`prefer-object-spread`][prefer-object-spread]                        |
| [`radix`]                            | 🌟  | [`radix`][radix]                                                      |
| [`restrict-plus-operands`]           | ✅  | [`@typescript-eslint/restrict-plus-operands`]                         |
| [`strict-boolean-expressions`]       | 🛑  | N/A                                                                   |
| [`strict-type-predicates`]           | 🛑  | N/A                                                                   |
| [`switch-default`]                   | 🌟  | [`default-case`][default-case]                                        |
| [`triple-equals`]                    | 🌟  | [`eqeqeq`][eqeqeq]                                                    |
| [`typeof-compare`]                   | 🌟  | [`valid-typeof`][valid-typeof]                                        |
| [`unnecessary-constructor`]          | 🌟  | [`no-useless-constructor`][no-useless-constructor]                    |
| [`use-default-type-parameter`]       | 🛑  | N/A                                                                   |
| [`use-isnan`]                        | 🌟  | [`use-isnan`][use-isnan]                                              |

<sup>[1]</sup> The ESLint rule also supports silencing with an extra set of parens (`if ((foo = bar)) {}`)<br>
<sup>[2]</sup> Missing private class member support. [`@typescript-eslint/no-unused-vars`] adds support for some TS-specific features.

### Maintainability

| TSLint rule                  |     | ESLint rule                                        |
| ---------------------------- | :-: | -------------------------------------------------- |
| [`cyclomatic-complexity`]    | 🌟  | [`complexity`][complexity]                         |
| [`deprecation`]              | 🌓  | [`import/no-deprecated`] <sup>[1]</sup>            |
| [`eofline`]                  | 🌟  | [`eol-last`][eol-last]                             |
| [`indent`]                   | ✅  | [`@typescript-eslint/indent`] or [Prettier]        |
| [`linebreak-style`]          | 🌟  | [`linebreak-style`][linebreak-style] or [Prettier] |
| [`max-classes-per-file`]     | 🌟  | [`max-classes-per-file`][max-classes-per-file]     |
| [`max-file-line-count`]      | 🌟  | [`max-lines`][max-lines]                           |
| [`max-line-length`]          | 🌟  | [`max-len`][max-len] or [Prettier]                 |
| [`no-default-export`]        | 🔌  | [`import/no-default-export`]                       |
| [`no-default-import`]        | 🛑  | N/A                                                |
| [`no-duplicate-imports`]     | 🔌  | [`import/no-duplicates`]                           |
| [`no-mergeable-namespace`]   | 🛑  | N/A                                                |
| [`no-require-imports`]       | ✅  | [`@typescript-eslint/no-require-imports`]          |
| [`object-literal-sort-keys`] | 🌓  | [`sort-keys`][sort-keys] <sup>[2]</sup>            |
| [`prefer-const`]             | 🌟  | [`prefer-const`][prefer-const]                     |
| [`prefer-readonly`]          | 🛑  | N/A                                                |
| [`trailing-comma`]           | 🌓  | [`comma-dangle`][comma-dangle] or [Prettier]       |

<sup>[1]</sup> Only warns when importing deprecated symbols<br>
<sup>[2]</sup> Missing support for blank-line-delimited sections

### Style

| TSLint rule                         |     | ESLint rule                                                                         |
| ----------------------------------- | :-: | ----------------------------------------------------------------------------------- |
| [`align`]                           | 🛑  | N/A                                                                                 |
| [`array-type`]                      | ✅  | [`@typescript-eslint/array-type`]                                                   |
| [`arrow-parens`]                    | 🌟  | [`arrow-parens`][arrow-parens]                                                      |
| [`arrow-return-shorthand`]          | 🌟  | [`arrow-body-style`][arrow-body-style]                                              |
| [`binary-expression-operand-order`] | 🌟  | [`yoda`][yoda]                                                                      |
| [`callable-types`]                  | ✅  | [`@typescript-eslint/prefer-function-type`]                                         |
| [`class-name`]                      | ✅  | [`@typescript-eslint/class-name-casing`]                                            |
| [`comment-format`]                  | 🌟  | [`capitalized-comments`][capitalized-comments] & [`spaced-comment`][spaced-comment] |
| [`comment-type`]                    | 🛑  | N/A                                                                                 |
| [`completed-docs`]                  | 🔌  | [`eslint-plugin-jsdoc`][plugin:jsdoc]                                               |
| [`encoding`]                        | 🛑  | N/A                                                                                 |
| [`file-header`]                     | 🔌  | [`eslint-plugin-header`][plugin:header] or [`-file-header`][plugin:file-header]     |
| [`file-name-casing`]                | 🔌  | [`unicorn/filename-case`]                                                           |
| [`import-spacing`]                  | 🔌  | Use [Prettier]                                                                      |
| [`increment-decrement`]             | 🌟  | [`no-plusplus`][no-plusplus]                                                        |
| [`interface-name`]                  | ✅  | [`@typescript-eslint/interface-name-prefix`]                                        |
| [`interface-over-type-literal`]     | ✅  | [`@typescript-eslint/prefer-interface`]                                             |
| [`jsdoc-format`]                    | 🌓  | [`valid-jsdoc`][valid-jsdoc] or [`eslint-plugin-jsdoc`][plugin:jsdoc]               |
| [`match-default-export-name`]       | 🛑  | N/A                                                                                 |
| [`newline-before-return`]           | 🌟  | [`padding-line-between-statements`][padding-line-between-statements] <sup>[1]</sup> |
| [`newline-per-chained-call`]        | 🌟  | [`newline-per-chained-call`][newline-per-chained-call]                              |
| [`new-parens`]                      | 🌟  | [`new-parens`][new-parens]                                                          |
| [`no-angle-bracket-type-assertion`] | ✅  | [`@typescript-eslint/no-angle-bracket-type-assertion`]                              |
| [`no-boolean-literal-compare`]      | 🛑  | N/A                                                                                 |
| [`no-consecutive-blank-lines`]      | 🌟  | [`no-multiple-empty-lines`][no-multiple-empty-lines]                                |
| [`no-irregular-whitespace`]         | 🌟  | [`no-irregular-whitespace`][no-irregular-whitespace] with `skipStrings: false`      |
| [`no-parameter-properties`]         | ✅  | [`@typescript-eslint/no-parameter-properties`]                                      |
| [`no-redundant-jsdoc`]              | 🛑  | N/A ([open issue](https://github.com/gajus/eslint-plugin-jsdoc/issues/134))         |
| [`no-reference-import`]             | 🛑  | N/A                                                                                 |
| [`no-trailing-whitespace`]          | 🌟  | [`no-trailing-spaces`][no-trailing-spaces]                                          |
| [`no-unnecessary-callback-wrapper`] | 🛑  | N/A and this might be unsafe (i.e. with `forEach`)                                  |
| [`no-unnecessary-initializer`]      | 🌟  | [`no-undef-init`][no-undef-init]                                                    |
| [`no-unnecessary-qualifier`]        | ✅  | [`@typescript-eslint/no-unnecessary-qualifier`]                                     |
| [`number-literal-format`]           | 🛑  | N/A                                                                                 |
| [`object-literal-key-quotes`]       | 🌟  | [`quote-props`][quote-props]                                                        |
| [`object-literal-shorthand`]        | 🌟  | [`object-shorthand`][object-shorthand]                                              |
| [`one-line`]                        | 🛑  | N/A                                                                                 |
| [`one-variable-per-declaration`]    | 🌟  | [`one-var`][one-var]                                                                |
| [`ordered-imports`]                 | 🔌  | [`import/order`]                                                                    |
| [`prefer-function-over-method`]     | 🌟  | [`class-methods-use-this`][class-methods-use-this]                                  |
| [`prefer-method-signature`]         | 🛑  | N/A                                                                                 |
| [`prefer-switch`]                   | 🛑  | N/A                                                                                 |
| [`prefer-template`]                 | 🌟  | [`prefer-template`][prefer-template]                                                |
| [`prefer-while`]                    | 🛑  | N/A                                                                                 |
| [`quotemark`]                       | 🌟  | [`quotes`][quotes]                                                                  |
| [`return-undefined`]                | 🛑  | N/A                                                                                 |
| [`semicolon`]                       | 🌟  | [`semi`][semi]                                                                      |
| [`space-before-function-paren`]     | 🌟  | [`space-before-function-paren`][space-after-function-paren]                         |
| [`space-within-parens`]             | 🌟  | [`space-in-parens`][space-in-parens]                                                |
| [`switch-final-break`]              | 🛑  | N/A                                                                                 |
| [`type-literal-delimiter`]          | ✅  | [`@typescript-eslint/member-delimiter-style`]                                       |
| [`unnecessary-bind`]                | 🌟  | [`no-extra-bind`][no-extra-bind]                                                    |
| [`variable-name`]                   | 🌟  | <sup>[2]</sup>                                                                      |
| [`whitespace`]                      | 🔌  | Use [Prettier]                                                                      |

<sup>[1]</sup> Recommended config: `["error", { blankLine: "always", prev: "*", next: "return" }]`<br>
<sup>[2]</sup> [`camelcase`][camelcase], [`no-underscore-dangle`][no-underscore-dangle], [`id-blacklist`][id-blacklist], and/or [`id-match`][id-match]

## tslint-microsoft-contrib rules

Rule listing is [here](https://github.com/Microsoft/tslint-microsoft-contrib#supported-rules).
Deprecated rules are excluded (`missing-jsdoc`, `missing-optional-annotation`, `no-duplicate-case`, `no-duplicate-parameter-names`, `no-function-constructor-with-string-args`, `no-increment-decrement`, `no-empty-interfaces`, `no-missing-visibility-modifiers`, `no-multiple-var-decl`, `no-reserved-keywords`, `no-stateless-class`, `no-var-self`, `no-unnecessary-bind`, and `valid-typeof`). See the docs in the link above to find out what to use instead.

### Testing

Relevant plugins: [`chai-expect-keywords`](https://github.com/gavinaiken/eslint-plugin-chai-expect-keywords), [`chai-expect`](https://github.com/Turbo87/eslint-plugin-chai-expect), [`chai-friendly`](https://github.com/ihordiachenko/eslint-plugin-chai-friendly), [`mocha`](https://github.com/lo1tuma/eslint-plugin-mocha), and [`jest`](https://github.com/jest-community/eslint-plugin-jest)

| tslint-microsoft-contrib rule      |     | ESLint rule               |
| ---------------------------------- | :-: | ------------------------- |
| `chai-prefer-contains-to-index-of` | 🛑  | N/A                       |
| `chai-vague-errors`                | 🛑  | N/A                       |
| `mocha-avoid-only`                 | 🔌  | [`jest/no-focused-tests`] |
| `mocha-unneeded-done`              | 🛑  | N/A                       |

### TypeScript

| tslint-microsoft-contrib rule |     | ESLint rule                                                |
| ----------------------------- | :-: | ---------------------------------------------------------- |
| `prefer-array-literal`        | 🌓  | [`@typescript-eslint/no-array-constructor`] <sup>[1]</sup> |
| `prefer-type-cast`            | 🛑  | N/A                                                        |

<sup>[1]</sup> ESLint rule is slightly less strict, allowing `new Array<Foo>()` and `Array(2)`.

### Miscellaneous

| tslint-microsoft-contrib rule         |     | ESLint rule                                                            |
| ------------------------------------- | :-: | ---------------------------------------------------------------------- |
| `export-name`                         | 🛑  | N/A ([relevant plugin][plugin:import])                                 |
| `function-name`                       | 🛑  | N/A                                                                    |
| `import-name`                         | 🛑  | N/A ([relevant plugin][plugin:import])                                 |
| `informative-docs`                    | 🛑  | N/A                                                                    |
| `insecure-random`                     | 🔌  | [custom implementation][insecure-random]                               |
| `max-func-body-length`                | 🌟  | [`max-statements`][max-statements]                                     |
| `no-banned-terms`                     | 🌟  | [`no-caller`][no-caller] & [`no-eval`][no-eval]                        |
| `no-constant-condition`               | 🌟  | [`no-constant-condition`][no-constant-condition]                       |
| `no-control-regex`                    | 🌟  | [`no-control-regex`][no-control-regex]                                 |
| `no-delete-expression`                | 🌓  | [`no-delete-var`][no-delete-var]                                       |
| `no-empty-line-after-opening-brace`   | 🌟  | [`padded-blocks`][padded-blocks] <sup>[1]</sup> or [Prettier]          |
| `no-for-in`                           | 🌟  | [`no-restricted-syntax`][no-restricted-syntax] <sup>[2]</sup>          |
| `no-function-expression`              | 🌟  | [`func-style`][func-style] <sup>[3]</sup>                              |
| `no-invalid-regexp`                   | 🌟  | [`no-invalid-regexp`][no-invalid-regexp]                               |
| `no-multiline-string`                 | 🌟  | [`no-multi-str`][no-multi-str]                                         |
| `no-octal-literal`                    | 🌟  | [`no-octal-escape`][no-octal-escape], see also [`no-octal`][no-octal]  |
| `no-regex-spaces`                     | 🌟  | [`no-regex-spaces`][no-regex-spaces]                                   |
| `no-relative-imports`                 | 🛑  | N/A, _Not recommended by the maintainers_                              |
| `no-single-line-block-comment`        | 🛑  | N/A                                                                    |
| `no-suspicious-comment`               | 🌟  | [`no-warning-comments`][no-warning-comments] <sup>[4]</sup>            |
| `no-typeof-undefined`                 | 🛑  | N/A (this actually has a valid use: checking if a variable is defined) |
| `no-unexternalized-strings`           | 🛑  | N/A                                                                    |
| `no-unnecessary-field-initialization` | 🌓  | [`no-undef-init`][no-undef-init] <sup>[5]</sup>                        |
| `no-unnecessary-local-variable`       | 🛑  | N/A                                                                    |
| `no-unnecessary-override`             | 🛑  | N/A                                                                    |
| `no-unnecessary-semicolons`           | 🌟  | [`no-extra-semi`][no-extra-semi] or [Prettier]                         |
| `no-useless-files`                    | 🛑  | N/A                                                                    |
| `no-with-statement`                   | 🌟  | [`no-with`][no-with]                                                   |
| `promise-must-complete`               | 🛑  | N/A                                                                    |
| `underscore-consistent-invocation`    | 🔌  | [`lodash/chaining`]                                                    |
| `use-named-parameter`                 | 🛑  | N/A                                                                    |
| `use-simple-attributes`               | 🛑  | N/A                                                                    |

<sup>[1]</sup> Enforces blank lines both at the beginning and end of a block<br>
<sup>[2]</sup> Recommended config: `["error", "ForInStatement"]`<br>
<sup>[3]</sup> Recommended config: `["error", "declaration", { "allowArrowFunctions": true }]`<br>
<sup>[4]</sup> Recommended config: `["error", { "terms": ["BUG", "HACK", "FIXME", "LATER", "LATER2", "TODO"], "location": "anywhere" }]`<br>
<sup>[5]</sup> Does not check class fields.

[insecure-random]: https://github.com/desktop/desktop/blob/master/eslint-rules/insecure-random.js

### Security

| tslint-microsoft-contrib rule   |     | ESLint rule                                        |
| ------------------------------- | :-: | -------------------------------------------------- |
| `no-disable-auto-sanitization`  | 🛑  | N/A                                                |
| `no-document-domain`            | 🌓  | Use [`no-restricted-syntax`][no-restricted-syntax] |
| `no-http-string`                | 🛑  | N/A                                                |
| `no-inner-html`                 | 🛑  | N/A                                                |
| `no-string-based-set-immediate` | 🛑  | N/A                                                |
| `no-string-based-set-interval`  | 🛑  | N/A                                                |
| `no-string-based-set-timeout`   | 🛑  | N/A                                                |
| `react-iframe-missing-sandbox`  | 🛑  | N/A                                                |
| `react-no-dangerous-html`       | 🔌  | [`react/no-danger`]                                |
| `non-literal-fs-path`           | 🔌  | [`security/detect-non-literal-fs-filename`]        |
| `non-literal-require`           | 🔌  | [`security/detect-non-literal-require`]            |
| `possible-timing-attack`        | 🔌  | [`security/detect-possible-timing-attacks`]        |

### Browser

| tslint-microsoft-contrib rule       |     | ESLint rule                                        |
| ----------------------------------- | :-: | -------------------------------------------------- |
| `jquery-deferred-must-complete`     | 🛑  | N/A                                                |
| `no-backbone-get-set-outside-model` | 🛑  | N/A                                                |
| `no-cookies`                        | 🌓  | Use [`no-restricted-syntax`][no-restricted-syntax] |
| `no-document-write`                 | 🌓  | Use [`no-restricted-syntax`][no-restricted-syntax] |
| `no-exec-script`                    | 🌓  | Use [`no-restricted-syntax`][no-restricted-syntax] |
| `no-jquery-raw-elements`            | 🛑  | N/A                                                |
| `no-unsupported-browser-code`       | 🔌  | [`eslint-plugin-compat`][plugin:compat]            |
| `react-this-binding-issue`          | 🛑  | N/A                                                |
| `react-tsx-curly-spacing`           | 🔌  | [`react/jsx-curly-spacing`]                        |
| `react-unused-props-and-state`      | 🌓  | [`react/no-unused-state`]                          |

### React A11y

| tslint-microsoft-contrib rule             |     | ESLint rule                                                |
| ----------------------------------------- | :-: | ---------------------------------------------------------- |
| `react-a11y-accessible-headings`          | 🌓  | [`jsx-a11y/heading-has-content`] <sup>[1]</sup>            |
| `react-a11y-anchors`                      | 🔌  | [`jsx-a11y/anchor-is-valid`]                               |
| `react-a11y-aria-unsupported-elements`    | 🔌  | [`jsx-a11y/aria-unsupported-elements`]                     |
| `react-a11y-event-has-role`               | 🌓  | [`jsx-a11y/no-static-element-interactions`] <sup>[2]</sup> |
| `react-a11y-image-button-has-alt`         | 🔌  | [`jsx-a11y/alt-text`]                                      |
| `react-a11y-img-has-alt`                  | 🔌  | [`jsx-a11y/alt-text`]                                      |
| `react-a11y-input-elements`               | 🛑  | N/A                                                        |
| `react-a11y-lang`                         | 🔌  | [`jsx-a11y/html-has-lang`] & [`jsx-a11y/lang`]             |
| `react-a11y-meta`                         | 🛑  | N/A                                                        |
| `react-a11y-no-onchange`                  | 🔌  | [`jsx-a11y/no-onchange`]                                   |
| `react-a11y-props`                        | 🔌  | [`jsx-a11y/aria-props`]                                    |
| `react-a11y-proptypes`                    | 🔌  | [`jsx-a11y/aria-proptypes`]                                |
| `react-a11y-required`                     | 🛑  | N/A                                                        |
| `react-a11y-role-has-required-aria-props` | 🔌  | [`jsx-a11y/role-has-required-aria-props`]                  |
| `react-a11y-role-supports-aria-props`     | 🔌  | [`jsx-a11y/role-supports-aria-props`]                      |
| `react-a11y-role`                         | 🔌  | [`jsx-a11y/aria-role`]                                     |
| `react-a11y-tabindex-no-positive`         | 🔌  | [`jsx-a11y/tabindex-no-positive`]                          |
| `react-a11y-titles`                       | 🛑  | N/A                                                        |
| `react-anchor-blank-noopener`             | 🛑  | N/A                                                        |

<sup>[1]</sup> TSLint rule is more strict<br>
<sup>[2]</sup> ESLint rule only reports for click handlers

[prettier]: https://prettier.io

<!-- TSLint -->

[`adjacent-overload-signatures`]: https://palantir.github.io/tslint/rules/adjacent-overload-signatures
[`ban-ts-ignore`]: https://palantir.github.io/tslint/rules/ban-ts-ignore/
[`ban-types`]: https://palantir.github.io/tslint/rules/ban-types
[`member-access`]: https://palantir.github.io/tslint/rules/member-access
[`member-ordering`]: https://palantir.github.io/tslint/rules/member-ordering
[`no-any`]: https://palantir.github.io/tslint/rules/no-any
[`no-empty-interface`]: https://palantir.github.io/tslint/rules/no-empty-interface
[`no-import-side-effect`]: https://palantir.github.io/tslint/rules/no-import-side-effect
[`no-inferrable-types`]: https://palantir.github.io/tslint/rules/no-inferrable-types
[`no-internal-module`]: https://palantir.github.io/tslint/rules/no-internal-module
[`no-magic-numbers`]: https://palantir.github.io/tslint/rules/no-magic-numbers
[`no-namespace`]: https://palantir.github.io/tslint/rules/no-namespace
[`no-non-null-assertion`]: https://palantir.github.io/tslint/rules/no-non-null-assertion
[`no-parameter-reassignment`]: https://palantir.github.io/tslint/rules/no-parameter-reassignment
[`no-reference`]: https://palantir.github.io/tslint/rules/no-reference
[`no-unnecessary-type-assertion`]: https://palantir.github.io/tslint/rules/no-unnecessary-type-assertion
[`no-var-requires`]: https://palantir.github.io/tslint/rules/no-var-requires
[`only-arrow-functions`]: https://palantir.github.io/tslint/rules/only-arrow-functions
[`prefer-for-of`]: https://palantir.github.io/tslint/rules/prefer-for-of
[`promise-function-async`]: https://palantir.github.io/tslint/rules/promise-function-async
[`typedef`]: https://palantir.github.io/tslint/rules/typedef
[`typedef-whitespace`]: https://palantir.github.io/tslint/rules/typedef-whitespace
[`unified-signatures`]: https://palantir.github.io/tslint/rules/unified-signatures
[`await-promise`]: https://palantir.github.io/tslint/rules/await-promise
[`ban-comma-operator`]: https://palantir.github.io/tslint/rules/ban-comma-operator
[`ban`]: https://palantir.github.io/tslint/rules/ban
[`curly`]: https://palantir.github.io/tslint/rules/curly
[`forin`]: https://palantir.github.io/tslint/rules/forin
[`function-constructor`]: https://palantir.github.io/tslint/rules/function-constructor
[`import-blacklist`]: https://palantir.github.io/tslint/rules/import-blacklist
[`label-position`]: https://palantir.github.io/tslint/rules/label-position
[`no-arg`]: https://palantir.github.io/tslint/rules/no-arg
[`no-bitwise`]: https://palantir.github.io/tslint/rules/no-bitwise
[`no-conditional-assignment`]: https://palantir.github.io/tslint/rules/no-conditional-assignment
[`no-console`]: https://palantir.github.io/tslint/rules/no-console
[`no-construct`]: https://palantir.github.io/tslint/rules/no-construct
[`no-debugger`]: https://palantir.github.io/tslint/rules/no-debugger
[`no-duplicate-super`]: https://palantir.github.io/tslint/rules/no-duplicate-super
[`no-duplicate-switch-case`]: https://palantir.github.io/tslint/rules/no-duplicate-switch-case
[`no-duplicate-variable`]: https://palantir.github.io/tslint/rules/no-duplicate-variable
[`no-dynamic-delete`]: https://palantir.github.io/tslint/rules/no-dynamic-delete
[`no-empty`]: https://palantir.github.io/tslint/rules/no-empty
[`no-eval`]: https://palantir.github.io/tslint/rules/no-eval
[`no-floating-promises`]: https://palantir.github.io/tslint/rules/no-floating-promises
[`no-for-in-array`]: https://palantir.github.io/tslint/rules/no-for-in-array
[`no-implicit-dependencies`]: https://palantir.github.io/tslint/rules/no-implicit-dependencies
[`no-inferred-empty-object-type`]: https://palantir.github.io/tslint/rules/no-inferred-empty-object-type
[`no-invalid-template-strings`]: https://palantir.github.io/tslint/rules/no-invalid-template-strings
[`no-invalid-this`]: https://palantir.github.io/tslint/rules/no-invalid-this
[`no-misused-new`]: https://palantir.github.io/tslint/rules/no-misused-new
[`no-null-keyword`]: https://palantir.github.io/tslint/rules/no-null-keyword
[`no-object-literal-type-assertion`]: https://palantir.github.io/tslint/rules/no-object-literal-type-assertion
[`no-return-await`]: https://palantir.github.io/tslint/rules/no-return-await
[`no-shadowed-variable`]: https://palantir.github.io/tslint/rules/no-shadowed-variable
[`no-sparse-arrays`]: https://palantir.github.io/tslint/rules/no-sparse-arrays
[`no-string-literal`]: https://palantir.github.io/tslint/rules/no-string-literal
[`no-string-throw`]: https://palantir.github.io/tslint/rules/no-string-throw
[`no-submodule-imports`]: https://palantir.github.io/tslint/rules/no-submodule-imports
[`no-switch-case-fall-through`]: https://palantir.github.io/tslint/rules/no-switch-case-fall-through
[`no-this-assignment`]: https://palantir.github.io/tslint/rules/no-this-assignment
[`no-unbound-method`]: https://palantir.github.io/tslint/rules/no-unbound-method
[`no-unnecessary-class`]: https://palantir.github.io/tslint/rules/no-unnecessary-class
[`no-unsafe-any`]: https://palantir.github.io/tslint/rules/no-unsafe-any
[`no-unsafe-finally`]: https://palantir.github.io/tslint/rules/no-unsafe-finally
[`no-unused-expression`]: https://palantir.github.io/tslint/rules/no-unused-expression
[`no-unused-variable`]: https://palantir.github.io/tslint/rules/no-unused-variable
[`no-use-before-declare`]: https://palantir.github.io/tslint/rules/no-use-before-declare
[`no-var-keyword`]: https://palantir.github.io/tslint/rules/no-var-keyword
[`no-void-expression`]: https://palantir.github.io/tslint/rules/no-void-expression
[`prefer-conditional-expression`]: https://palantir.github.io/tslint/rules/prefer-conditional-expression
[`prefer-object-spread`]: https://palantir.github.io/tslint/rules/prefer-object-spread
[`radix`]: https://palantir.github.io/tslint/rules/radix
[`restrict-plus-operands`]: https://palantir.github.io/tslint/rules/restrict-plus-operands
[`strict-boolean-expressions`]: https://palantir.github.io/tslint/rules/strict-boolean-expressions
[`strict-type-predicates`]: https://palantir.github.io/tslint/rules/strict-type-predicates
[`switch-default`]: https://palantir.github.io/tslint/rules/switch-default
[`triple-equals`]: https://palantir.github.io/tslint/rules/triple-equals
[`typeof-compare`]: https://palantir.github.io/tslint/rules/typeof-compare
[`unnecessary-constructor`]: https://palantir.github.io/tslint/rules/unnecessary-constructor
[`use-default-type-parameter`]: https://palantir.github.io/tslint/rules/use-default-type-parameter
[`use-isnan`]: https://palantir.github.io/tslint/rules/use-isnan
[`cyclomatic-complexity`]: https://palantir.github.io/tslint/rules/cyclomatic-complexity
[`deprecation`]: https://palantir.github.io/tslint/rules/deprecation
[`eofline`]: https://palantir.github.io/tslint/rules/eofline
[`indent`]: https://palantir.github.io/tslint/rules/indent
[`linebreak-style`]: https://palantir.github.io/tslint/rules/linebreak-style
[`max-classes-per-file`]: https://palantir.github.io/tslint/rules/max-classes-per-file
[`max-file-line-count`]: https://palantir.github.io/tslint/rules/max-file-line-count
[`max-line-length`]: https://palantir.github.io/tslint/rules/max-line-length
[`no-default-export`]: https://palantir.github.io/tslint/rules/no-default-export
[`no-default-import`]: https://palantir.github.io/tslint/rules/no-default-import
[`no-duplicate-imports`]: https://palantir.github.io/tslint/rules/no-duplicate-imports
[`no-mergeable-namespace`]: https://palantir.github.io/tslint/rules/no-mergeable-namespace
[`no-require-imports`]: https://palantir.github.io/tslint/rules/no-require-imports
[`object-literal-sort-keys`]: https://palantir.github.io/tslint/rules/object-literal-sort-keys
[`prefer-const`]: https://palantir.github.io/tslint/rules/prefer-const
[`prefer-readonly`]: https://palantir.github.io/tslint/rules/prefer-readonly
[`trailing-comma`]: https://palantir.github.io/tslint/rules/trailing-comma
[`align`]: https://palantir.github.io/tslint/rules/align
[`array-type`]: https://palantir.github.io/tslint/rules/array-type
[`arrow-parens`]: https://palantir.github.io/tslint/rules/arrow-parens
[`arrow-return-shorthand`]: https://palantir.github.io/tslint/rules/arrow-return-shorthand
[`binary-expression-operand-order`]: https://palantir.github.io/tslint/rules/binary-expression-operand-order
[`callable-types`]: https://palantir.github.io/tslint/rules/callable-types
[`class-name`]: https://palantir.github.io/tslint/rules/class-name
[`comment-format`]: https://palantir.github.io/tslint/rules/comment-format
[`comment-type`]: https://palantir.github.io/tslint/rules/comment-type
[`completed-docs`]: https://palantir.github.io/tslint/rules/completed-docs
[`encoding`]: https://palantir.github.io/tslint/rules/encoding
[`file-header`]: https://palantir.github.io/tslint/rules/file-header
[`file-name-casing`]: https://palantir.github.io/tslint/rules/file-name-casing
[`import-spacing`]: https://palantir.github.io/tslint/rules/import-spacing
[`increment-decrement`]: https://palantir.github.io/tslint/rules/increment-decrement
[`interface-name`]: https://palantir.github.io/tslint/rules/interface-name
[`interface-over-type-literal`]: https://palantir.github.io/tslint/rules/interface-over-type-literal
[`jsdoc-format`]: https://palantir.github.io/tslint/rules/jsdoc-format
[`match-default-export-name`]: https://palantir.github.io/tslint/rules/match-default-export-name
[`newline-before-return`]: https://palantir.github.io/tslint/rules/newline-before-return
[`newline-per-chained-call`]: https://palantir.github.io/tslint/rules/newline-per-chained-call
[`new-parens`]: https://palantir.github.io/tslint/rules/new-parens
[`no-angle-bracket-type-assertion`]: https://palantir.github.io/tslint/rules/no-angle-bracket-type-assertion
[`no-boolean-literal-compare`]: https://palantir.github.io/tslint/rules/no-boolean-literal-compare
[`no-consecutive-blank-lines`]: https://palantir.github.io/tslint/rules/no-consecutive-blank-lines
[`no-irregular-whitespace`]: https://palantir.github.io/tslint/rules/no-irregular-whitespace
[`no-parameter-properties`]: https://palantir.github.io/tslint/rules/no-parameter-properties
[`no-redundant-jsdoc`]: https://palantir.github.io/tslint/rules/no-redundant-jsdoc
[`no-reference-import`]: https://palantir.github.io/tslint/rules/no-reference-import
[`no-trailing-whitespace`]: https://palantir.github.io/tslint/rules/no-trailing-whitespace
[`no-unnecessary-callback-wrapper`]: https://palantir.github.io/tslint/rules/no-unnecessary-callback-wrapper
[`no-unnecessary-initializer`]: https://palantir.github.io/tslint/rules/no-unnecessary-initializer
[`no-unnecessary-qualifier`]: https://palantir.github.io/tslint/rules/no-unnecessary-qualifier
[`number-literal-format`]: https://palantir.github.io/tslint/rules/number-literal-format
[`object-literal-key-quotes`]: https://palantir.github.io/tslint/rules/object-literal-key-quotes
[`object-literal-shorthand`]: https://palantir.github.io/tslint/rules/object-literal-shorthand
[`one-line`]: https://palantir.github.io/tslint/rules/one-line
[`one-variable-per-declaration`]: https://palantir.github.io/tslint/rules/one-variable-per-declaration
[`ordered-imports`]: https://palantir.github.io/tslint/rules/ordered-imports
[`prefer-function-over-method`]: https://palantir.github.io/tslint/rules/prefer-function-over-method
[`prefer-method-signature`]: https://palantir.github.io/tslint/rules/prefer-method-signature
[`prefer-switch`]: https://palantir.github.io/tslint/rules/prefer-switch
[`prefer-template`]: https://palantir.github.io/tslint/rules/prefer-template
[`prefer-while`]: https://palantir.github.io/tslint/rules/prefer-while
[`quotemark`]: https://palantir.github.io/tslint/rules/quotemark
[`return-undefined`]: https://palantir.github.io/tslint/rules/return-undefined
[`semicolon`]: https://palantir.github.io/tslint/rules/semicolon
[`space-before-function-paren`]: https://palantir.github.io/tslint/rules/space-before-function-paren
[`space-within-parens`]: https://palantir.github.io/tslint/rules/space-within-parens
[`switch-final-break`]: https://palantir.github.io/tslint/rules/switch-final-break
[`type-literal-delimiter`]: https://palantir.github.io/tslint/rules/type-literal-delimiter
[`unnecessary-bind`]: https://palantir.github.io/tslint/rules/unnecessary-bind
[`variable-name`]: https://palantir.github.io/tslint/rules/variable-name
[`whitespace`]: https://palantir.github.io/tslint/rules/whitespace

<!-- ESLint core -->

[no-magic-numbers]: https://eslint.org/docs/rules/no-magic-numbers
[no-param-reassign]: https://eslint.org/docs/rules/no-param-reassign
[no-sequences]: https://eslint.org/docs/rules/no-sequences
[no-restricted-properties]: https://eslint.org/docs/rules/no-restricted-properties
[no-restricted-syntax]: https://eslint.org/docs/rules/no-restricted-syntax
[curly]: https://eslint.org/docs/rules/curly
[guard-for-in]: https://eslint.org/docs/rules/guard-for-in
[no-new-func]: https://eslint.org/docs/rules/no-new-func
[no-restricted-imports]: https://eslint.org/docs/rules/no-restricted-imports
[no-unused-labels]: https://eslint.org/docs/rules/no-unused-labels
[no-caller]: https://eslint.org/docs/rules/no-caller
[no-bitwise]: https://eslint.org/docs/rules/no-bitwise
[no-cond-assign]: https://eslint.org/docs/rules/no-cond-assign
[no-console]: https://eslint.org/docs/rules/no-console
[no-new-wrappers]: https://eslint.org/docs/rules/no-new-wrappers
[no-debugger]: https://eslint.org/docs/rules/no-debugger
[constructor-super]: https://eslint.org/docs/rules/constructor-super
[no-duplicate-case]: https://eslint.org/docs/rules/no-duplicate-case
[no-redeclare]: https://eslint.org/docs/rules/no-redeclare
[no-empty]: https://eslint.org/docs/rules/no-empty
[no-eval]: https://eslint.org/docs/rules/no-eval
[no-template-curly-in-string]: https://eslint.org/docs/rules/no-template-curly-in-string
[no-invalid-this]: https://eslint.org/docs/rules/no-invalid-this
[no-return-await]: https://eslint.org/docs/rules/no-return-await
[no-shadow]: https://eslint.org/docs/rules/no-shadow
[no-sparse-arrays]: https://eslint.org/docs/rules/no-sparse-arrays
[dot-notation]: https://eslint.org/docs/rules/dot-notation
[no-throw-literal]: https://eslint.org/docs/rules/no-throw-literal
[no-fallthrough]: https://eslint.org/docs/rules/no-fallthrough
[no-unsafe-finally]: https://eslint.org/docs/rules/no-unsafe-finally
[no-unused-expressions]: https://eslint.org/docs/rules/no-unused-expressions
[no-unused-vars]: https://eslint.org/docs/rules/no-unused-vars
[no-var]: https://eslint.org/docs/rules/no-var
[no-void]: https://eslint.org/docs/rules/no-void
[prefer-object-spread]: https://eslint.org/docs/rules/prefer-object-spread
[radix]: https://eslint.org/docs/rules/radix
[default-case]: https://eslint.org/docs/rules/default-case
[eqeqeq]: https://eslint.org/docs/rules/eqeqeq
[valid-typeof]: https://eslint.org/docs/rules/valid-typeof
[no-useless-constructor]: https://eslint.org/docs/rules/no-useless-constructor
[use-isnan]: https://eslint.org/docs/rules/use-isnan
[complexity]: https://eslint.org/docs/rules/complexity
[eol-last]: https://eslint.org/docs/rules/eol-last
[linebreak-style]: https://eslint.org/docs/rules/linebreak-style
[max-classes-per-file]: https://eslint.org/docs/rules/max-classes-per-file
[max-lines]: https://eslint.org/docs/rules/max-lines
[max-len]: https://eslint.org/docs/rules/max-len
[sort-keys]: https://eslint.org/docs/rules/sort-keys
[prefer-const]: https://eslint.org/docs/rules/prefer-const
[comma-dangle]: https://eslint.org/docs/rules/comma-dangle
[arrow-parens]: https://eslint.org/docs/rules/arrow-parens
[arrow-body-style]: https://eslint.org/docs/rules/arrow-body-style
[yoda]: https://eslint.org/docs/rules/yoda
[capitalized-comments]: https://eslint.org/docs/rules/capitalized-comments
[spaced-comment]: https://eslint.org/docs/rules/spaced-comment
[no-plusplus]: https://eslint.org/docs/rules/no-plusplus
[valid-jsdoc]: https://eslint.org/docs/rules/valid-jsdoc
[padding-line-between-statements]: https://eslint.org/docs/rules/padding-line-between-statements
[newline-per-chained-call]: https://eslint.org/docs/rules/newline-per-chained-call
[new-parens]: https://eslint.org/docs/rules/new-parens
[no-multiple-empty-lines]: https://eslint.org/docs/rules/no-multiple-empty-lines
[no-irregular-whitespace]: https://eslint.org/docs/rules/no-irregular-whitespace
[no-trailing-spaces]: https://eslint.org/docs/rules/no-trailing-spaces
[no-undef-init]: https://eslint.org/docs/rules/no-undef-init
[quote-props]: https://eslint.org/docs/rules/quote-props
[object-shorthand]: https://eslint.org/docs/rules/object-shorthand
[one-var]: https://eslint.org/docs/rules/one-var
[class-methods-use-this]: https://eslint.org/docs/rules/class-methods-use-this
[prefer-template]: https://eslint.org/docs/rules/prefer-template
[quotes]: https://eslint.org/docs/rules/quotes
[semi]: https://eslint.org/docs/rules/semi
[space-after-function-paren]: https://eslint.org/docs/rules/space-before-function-paren
[space-in-parens]: https://eslint.org/docs/rules/space-in-parens
[no-extra-bind]: https://eslint.org/docs/rules/no-extra-bind
[camelcase]: https://eslint.org/docs/rules/camelcase
[no-underscore-dangle]: https://eslint.org/docs/rules/no-underscore-dangle
[id-blacklist]: https://eslint.org/docs/rules/id-blacklist
[id-match]: https://eslint.org/docs/rules/id-match
[max-statements]: https://eslint.org/docs/rules/max-statements
[no-constant-condition]: https://eslint.org/docs/rules/no-constant-condition
[no-control-regex]: https://eslint.org/docs/rules/no-control-regex
[no-invalid-regexp]: https://eslint.org/docs/rules/no-invalid-regexp
[no-regex-spaces]: https://eslint.org/docs/rules/no-regex-spaces
[no-new-func]: https://eslint.org/docs/rules/no-new-func
[no-delete-var]: https://eslint.org/docs/rules/no-delete-var
[padded-blocks]: https://eslint.org/docs/rules/padded-blocks
[func-style]: https://eslint.org/docs/rules/func-style
[no-multi-str]: https://eslint.org/docs/rules/no-multi-str
[no-octal]: https://eslint.org/docs/rules/no-octal
[no-octal-escape]: https://eslint.org/docs/rules/no-octal-escape
[no-extra-semi]: https://eslint.org/docs/rules/no-extra-semi
[no-with]: https://eslint.org/docs/rules/no-with
[no-warning-comments]: https://eslint.org/docs/rules/no-warning-comments

<!-- @typescript-eslint/eslint-plugin -->

[`@typescript-eslint/adjacent-overload-signatures`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/adjacent-overload-signatures.md
[`@typescript-eslint/ban-types`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-types.md
[`@typescript-eslint/explicit-member-accessibility`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-member-accessibility.md
[`@typescript-eslint/member-ordering`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-ordering.md
[`@typescript-eslint/no-explicit-any`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-explicit-any.md
[`@typescript-eslint/no-empty-interface`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-empty-interface.md
[`@typescript-eslint/no-inferrable-types`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-inferrable-types.md
[`@typescript-eslint/prefer-namespace-keyword`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-namespace-keyword.md
[`@typescript-eslint/promise-function-async`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/promise-function-async.md
[`@typescript-eslint/no-namespace`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-namespace.md
[`@typescript-eslint/no-non-null-assertion`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-non-null-assertion.md
[`@typescript-eslint/no-triple-slash-reference`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-triple-slash-reference.md
[`@typescript-eslint/no-unnecessary-type-assertion`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-type-assertion.md
[`@typescript-eslint/no-var-requires`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-var-requires.md
[`@typescript-eslint/type-annotation-spacing`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/type-annotation-spacing.md
[`@typescript-eslint/no-misused-new`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-misused-new.md
[`@typescript-eslint/no-object-literal-type-assertion`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-object-literal-type-assertion.md
[`@typescript-eslint/no-this-alias`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-this-alias.md
[`@typescript-eslint/no-extraneous-class`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-extraneous-class.md
[`@typescript-eslint/no-unused-vars`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md
[`@typescript-eslint/no-use-before-define`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md
[`@typescript-eslint/restrict-plus-operands`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/restrict-plus-operands.md
[`@typescript-eslint/indent`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
[`@typescript-eslint/no-require-imports`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-require-imports.md
[`@typescript-eslint/array-type`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/array-type.md
[`@typescript-eslint/class-name-casing`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/class-name-casing.md
[`@typescript-eslint/interface-name-prefix`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/interface-name-prefix.md
[`@typescript-eslint/no-angle-bracket-type-assertion`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-angle-bracket-type-assertion.md
[`@typescript-eslint/no-parameter-properties`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-parameter-properties.md
[`@typescript-eslint/member-delimiter-style`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-delimiter-style.md
[`@typescript-eslint/prefer-interface`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-interface.md
[`@typescript-eslint/no-array-constructor`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-array-constructor.md
[`@typescript-eslint/prefer-function-type`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-function-type.md
[`@typescript-eslint/no-for-in-array`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-for-in-array.md
[`@typescript-eslint/no-unnecessary-qualifier`]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-qualifier.md

<!-- eslint-plugin-import -->

[plugin:import]: https://github.com/benmosher/eslint-plugin-import
[`import/no-unassigned-import`]: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unassigned-import.md
[`import/no-extraneous-dependencies`]: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
[`import/no-internal-modules`]: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-internal-modules.md
[`import/no-deprecated`]: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-deprecated.md
[`import/no-default-export`]: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-default-export.md
[`import/no-duplicates`]: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-duplicates.md
[`import/order`]: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md

<!-- eslint-plugin-react -->

[`react/no-danger`]: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-danger.md
[`react/jsx-curly-spacing`]: https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-curly-spacing.md
[`react/no-unused-state`]: https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-unused-state.md

<!-- eslint-plugin-react-a11y -->

[`jsx-a11y/anchor-is-valid`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/anchor-is-valid.md
[`jsx-a11y/aria-unsupported-elements`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-unsupported-elements.md
[`jsx-a11y/no-static-element-interactions`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md
[`jsx-a11y/alt-text`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/alt-text.md
[`jsx-a11y/html-has-lang`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/html-has-lang.md
[`jsx-a11y/lang`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/lang.md
[`jsx-a11y/no-onchange`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-onchange.md
[`jsx-a11y/aria-props`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-props.md
[`jsx-a11y/aria-proptypes`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-proptypes.md
[`jsx-a11y/role-has-required-aria-props`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/role-has-required-aria-props.md
[`jsx-a11y/role-supports-aria-props`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/role-supports-aria-props.md
[`jsx-a11y/aria-role`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/aria-role.md
[`jsx-a11y/tabindex-no-positive`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/tabindex-no-positive.md

<!-- eslint-plugin-security -->

[`security/detect-non-literal-fs-filename`]: https://github.com/nodesecurity/eslint-plugin-security#detect-non-literal-fs-filename
[`security/detect-non-literal-require`]: https://github.com/nodesecurity/eslint-plugin-security#detect-non-literal-require
[`security/detect-possible-timing-attacks`]: https://github.com/nodesecurity/eslint-plugin-security#detect-possible-timing-attacks

<!-- Miscellaneous plugins -->

[`prefer-arrow/prefer-arrow-functions`]: https://github.com/TristonJ/eslint-plugin-prefer-arrow
[plugin:promise]: https://github.com/xjamundx/eslint-plugin-promise
[plugin:jsdoc]: https://github.com/gajus/eslint-plugin-jsdoc
[plugin:header]: https://github.com/Stuk/eslint-plugin-header
[plugin:file-header]: https://github.com/Sekhmet/eslint-plugin-file-header
[plugin:compat]: https://github.com/amilajack/eslint-plugin-compat
[`no-null/no-null`]: https://github.com/nene/eslint-plugin-no-null
[`unicorn/filename-case`]: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/filename-case.md
[`jest/no-focused-tests`]: https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-focused-tests.md
[`jsx-a11y/heading-has-content`]: https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/heading-has-content.md
[`lodash/chaining`]: https://github.com/wix/eslint-plugin-lodash/blob/master/docs/rules/chaining.md
