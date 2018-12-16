# Roadmap

## TSLint rules

✅ = done  
🌟 = in ESLint core  
🔌 = in another plugin  
🛑 = unimplemented  
❓ = implementations differ or ESLint version is missing functionality

### TypeScript-specific

| TSLint rule                       |     | ESLint rule                                                                                                                       |
| --------------------------------- | :-: | --------------------------------------------------------------------------------------------------------------------------------- |
| [`adjacent-overload-signatures`]  | ✅  | [`typescript/adjacent-overload-signatures`]                                                                                       |
| [`ban-types`]                     | ✅  | [`typescript/ban-types`]                                                                                                          |
| [`member-access`]                 | ✅  | [`typescript/explicit-member-accessibility`]                                                                                      |
| [`member-ordering`]               | ✅  | [`typescript/member-ordering`]                                                                                                    |
| [`no-any`]                        | ✅  | [`typescript/no-explicit-any`]                                                                                                    |
| [`no-empty-interface`]            | ✅  | [`typescript/no-empty-interface`]                                                                                                 |
| [`no-import-side-effect`]         | 🔌  | [`import/no-unassigned-import`](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unassigned-import.md) |
| [`no-inferrable-types`]           | ✅  | [`typescript/no-inferrable-types`]                                                                                                |
| [`no-internal-module`]            | ✅  | [`typescript/prefer-namespace-keyword`]                                                                                           |
| [`no-magic-numbers`]              | 🌟  | [`no-magic-numbers`](https://eslint.org/docs/rules/no-magic-numbers)                                                              |
| [`no-namespace`]                  | ✅  | [`typescript/no-namespace`]                                                                                                       |
| [`no-non-null-assertion`]         | ✅  | [`typescript/no-non-null-assertion`]                                                                                              |
| [`no-parameter-reassignment`]     | ✅  | [`no-parameter-reassignment`](https://eslint.org/docs/rules/no-param-reassign)                                                    |
| [`no-reference`]                  | ✅  | [`typescript/no-triple-slash-reference`]                                                                                          |
| [`no-unnecessary-type-assertion`] | 🛑  | N/A                                                                                                                               |
| [`no-var-requires`]               | ✅  | [`typescript/no-var-requires`]                                                                                                    |
| [`only-arrow-functions`]          | 🔌  | [`prefer-arrow/prefer-arrow-functions`](https://github.com/TristonJ/eslint-plugin-prefer-arrow)                                   |
| [`prefer-for-of`]                 | 🛑  | N/A                                                                                                                               |
| [`promise-function-async`]        | 🛑  | N/A ([relevant plugin](https://github.com/xjamundx/eslint-plugin-promise))                                                        |
| [`typedef`]                       | 🛑  | N/A                                                                                                                               |
| [`typedef-whitespace`]            | ✅  | [`typescript/type-annotation-spacing`]                                                                                            |
| [`unified-signatures`]            | 🛑  | N/A                                                                                                                               |

### Functionality

| TSLint rule                          |     | ESLint rule                                                                                                                                                         |
| ------------------------------------ | :-: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`await-promise`]                    | 🛑  | N/A                                                                                                                                                                 |
| [`ban-comma-operator`]               | 🌟  | [`no-sequences`](https://eslint.org/docs/rules/no-sequences)                                                                                                        |
| [`ban`]                              | 🌟  | [`no-restricted-properties`](https://eslint.org/docs/rules/no-restricted-properties) & [`no-restricted-syntax`](https://eslint.org/docs/rules/no-restricted-syntax) |
| [`curly`]                            | 🌟  | [`curly`](https://eslint.org/docs/rules/curly)                                                                                                                      |
| [`forin`]                            | 🌟  | [`guard-for-in`](https://eslint.org/docs/rules/guard-for-in)                                                                                                        |
| [`import-blacklist`]                 | 🌟  | [`no-restricted-imports`](https://eslint.org/docs/rules/no-restricted-imports)                                                                                      |
| [`label-position`]                   | 🌟  | [`no-unused-labels`](https://eslint.org/docs/rules/no-unused-labels) (similar)                                                                                      |
| [`no-arg`]                           | 🌟  | [`no-caller`](https://eslint.org/docs/rules/no-caller) (also blocks `arguments.caller`)                                                                             |
| [`no-bitwise`]                       | 🌟  | [`no-bitwise`](https://eslint.org/docs/rules/no-bitwise)                                                                                                            |
| [`no-conditional-assignment`]        | 🌟  | [`no-cond-assign`](https://eslint.org/docs/rules/no-cond-assign) (the ESLint rule also supports silencing with an extra set of parens (`if ((foo = bar)) {}`)       |
| [`no-console`]                       | 🌟  | [`no-console`](https://eslint.org/docs/rules/no-console) (configuration works slightly differently)                                                                 |
| [`no-construct`]                     | 🌟  | [`no-new-wrappers`](https://eslint.org/docs/rules/no-new-wrappers)                                                                                                  |
| [`no-debugger`]                      | 🌟  | [`no-debugger`](https://eslint.org/docs/rules/no-debugger)                                                                                                          |
| [`no-duplicate-super`]               | 🌟  | [`constructor-super`](https://eslint.org/docs/rules/constructor-super)                                                                                              |
| [`no-duplicate-switch-case`]         | 🌟  | [`no-duplicate-case`](https://eslint.org/docs/rules/no-duplicate-case)                                                                                              |
| [`no-duplicate-variable`]            | 🌟  | [`no-redeclare`](https://eslint.org/docs/rules/no-redeclare)                                                                                                        |
| [`no-dynamic-delete`]                | 🛑  | N/A                                                                                                                                                                 |
| [`no-empty`]                         | 🌟  | [`no-empty`](https://eslint.org/docs/rules/no-empty)                                                                                                                |
| [`no-eval`]                          | 🌟  | [`no-eval`](https://eslint.org/docs/rules/no-eval)                                                                                                                  |
| [`no-floating-promises`]             | 🛑  | N/A ([relevant plugin](https://github.com/xjamundx/eslint-plugin-promise))                                                                                          |
| [`no-for-in-array`]                  | 🛑  | N/A                                                                                                                                                                 |
| [`no-implicit-dependencies`]         | 🔌  | [`import/no-extraneous-dependencies`](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md)                       |
| [`no-inferred-empty-object-type`]    | 🛑  | N/A                                                                                                                                                                 |
| [`no-invalid-template-strings`]      | 🌟  | [`no-template-curly-in-string`](https://eslint.org/docs/rules/no-template-curly-in-string)                                                                          |
| [`no-invalid-this`]                  | 🌟  | [`no-invalid-this`](https://eslint.org/docs/rules/no-invalid-this)                                                                                                  |
| [`no-misused-new`]                   | ✅  | [`typescript/no-misused-new`]                                                                                                                                       |
| [`no-null-keyword`]                  | 🔌  | [`no-null/no-null`](https://github.com/nene/eslint-plugin-no-null)                                                                                                  |
| [`no-object-literal-type-assertion`] | ✅  | [`typescript/no-object-literal-type-assertion`]                                                                                                                     |
| [`no-return-await`]                  | 🌟  | [`no-return-await`](https://eslint.org/docs/rules/no-return-await)                                                                                                  |
| [`no-shadowed-variable`]             | 🌟  | [`no-shadow`](https://eslint.org/docs/rules/no-shadow)                                                                                                              |
| [`no-sparse-arrays`]                 | 🌟  | [`no-sparse-arrays`](https://eslint.org/docs/rules/no-sparse-arrays)                                                                                                |
| [`no-string-literal`]                | 🌟  | [`dot-notation`](https://eslint.org/docs/rules/dot-notation)                                                                                                        |
| [`no-string-throw`]                  | 🌟  | [`no-throw-literal`](https://eslint.org/docs/rules/no-throw-literal)                                                                                                |
| [`no-submodule-imports`]             | ❓  | [`import/no-internal-modules`](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-internal-modules.md) (slightly different)                |
| [`no-switch-case-fall-through`]      | 🌟  | [`no-fallthrough`](https://eslint.org/docs/rules/no-fallthrough)                                                                                                    |
| [`no-this-assignment`]               | ✅  | [`typescript/no-this-alias`]                                                                                                                                        |
| [`no-unbound-method`]                | 🛑  | N/A                                                                                                                                                                 |
| [`no-unnecessary-class`]             | ✅  | [`typescript/no-extraneous-class`]                                                                                                                                  |
| [`no-unsafe-any`]                    | 🛑  | N/A                                                                                                                                                                 |
| [`no-unsafe-finally`]                | 🌟  | [`no-unsafe-finally`](https://eslint.org/docs/rules/no-unsafe-finally)                                                                                              |
| [`no-unused-expression`]             | 🌟  | [`no-unused-expression`](https://eslint.org/docs/rules/no-unused-expressions)                                                                                       |
| [`no-unused-variable`]               | ❓  | [`no-unused-vars`](https://eslint.org/docs/rules/no-unused-vars) & [`typescript/no-unused-vars`] (missing private class member support)                             |
| [`no-use-before-declare`]            | ✅  | [`typescript/no-use-before-define`]                                                                                                                                 |
| [`no-var-keyword`]                   | 🌟  | [`no-var`](https://eslint.org/docs/rules/no-var)                                                                                                                    |
| [`no-void-expression`]               | 🌟  | [`no-void`](https://eslint.org/docs/rules/no-void)                                                                                                                  |
| [`prefer-conditional-expression`]    | 🛑  | N/A                                                                                                                                                                 |
| [`prefer-object-spread`]             | 🌟  | [`prefer-object-spread`](https://eslint.org/docs/rules/prefer-object-spread)                                                                                        |
| [`radix`]                            | 🌟  | [`radix`](https://eslint.org/docs/rules/radix)                                                                                                                      |
| [`restrict-plus-operands`]           | 🛑  | N/A ([old WIP implementation](https://github.com/bradzacher/eslint-plugin-typescript/commit/8e2b22f18e829c9a4ea624760033df95c3385a9e))                              |
| [`strict-boolean-expressions`]       | 🛑  | N/A                                                                                                                                                                 |
| [`strict-type-predicates`]           | 🛑  | N/A                                                                                                                                                                 |
| [`switch-default`]                   | 🌟  | [`default-case`](https://eslint.org/docs/rules/default-case)                                                                                                        |
| [`triple-equals`]                    | 🌟  | [`eqeqeq`](https://eslint.org/docs/rules/eqeqeq)                                                                                                                    |
| [`typeof-compare`]                   | 🌟  | [`valid-typeof`](https://eslint.org/docs/rules/valid-typeof)                                                                                                        |
| [`use-default-type-parameter`]       | 🛑  | N/A                                                                                                                                                                 |
| [`use-isnan`]                        | 🌟  | [`use-isnan`](https://eslint.org/docs/rules/use-isnan)                                                                                                              |

### Maintainability

| TSLint rule                  |     | ESLint rule                                                                                                                             |
| ---------------------------- | :-: | --------------------------------------------------------------------------------------------------------------------------------------- |
| [`cyclomatic-complexity`]    | 🌟  | [`complexity`](https://eslint.org/docs/rules/complexity)                                                                                |
| [`deprecation`]              | ❓  | [`import/no-deprecated`](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-deprecated.md) only covers imports |
| [`eofline`]                  | 🌟  | [`eol-last`](https://eslint.org/docs/rules/eol-last)                                                                                    |
| [`indent`]                   | ✅  | [`typescript/indent`] or [Prettier]                                                                                                     |
| [`linebreak-style`]          | 🌟  | [`linebreak-style`](https://eslint.org/docs/rules/linebreak-style) or [Prettier]                                                        |
| [`max-classes-per-file`]     | 🌟  | [`max-classes-per-file`](https://eslint.org/docs/rules/max-classes-per-file)                                                            |
| [`max-file-line-count`]      | 🌟  | [`max-lines`](https://eslint.org/docs/rules/max-lines)                                                                                  |
| [`max-line-length`]          | 🌟  | [`max-len`](https://eslint.org/docs/rules/max-len) or [Prettier]                                                                        |
| [`no-default-export`]        | 🔌  | [`import/no-default-export`](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-default-export.md)             |
| [`no-duplicate-imports`]     | 🔌  | [`import/no-duplicates`](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-duplicates.md)                     |
| [`no-mergeable-namespace`]   | 🛑  | N/A                                                                                                                                     |
| [`no-require-imports`]       | 🛑  | N/A                                                                                                                                     |
| [`object-literal-sort-keys`] | ❓  | [`sort-keys`](https://eslint.org/docs/rules/sort-keys) (missing support for blank line delimited sections)                              |
| [`prefer-const`]             | 🌟  | [`prefer-const`](https://eslint.org/docs/rules/prefer-const)                                                                            |
| [`prefer-readonly`]          | 🛑  | N/A                                                                                                                                     |
| [`trailing-comma`]           | ❓  | [`comma-dangle`](https://eslint.org/docs/rules/comma-dangle) or [Prettier]                                                              |

### Style

| TSLint rule                         |     | ESLint rule                                                                                                                                                                                                                                                     |
| ----------------------------------- | :-: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`align`]                           | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`array-type`]                      | ✅  | [`typescript/array-type`]                                                                                                                                                                                                                                       |
| [`arrow-parens`]                    | 🌟  | [`arrow-parens`](https://eslint.org/docs/rules/arrow-parens)                                                                                                                                                                                                    |
| [`arrow-return-shorthand`]          | 🌟  | [`arrow-body-style`](https://eslint.org/docs/rules/arrow-body-style)                                                                                                                                                                                            |
| [`binary-expression-operand-order`] | 🌟  | [`yoda`](https://eslint.org/docs/rules/yoda)                                                                                                                                                                                                                    |
| [`callable-types`]                  | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`class-name`]                      | ✅  | [`typescript/class-name-casing`]                                                                                                                                                                                                                                |
| [`comment-format`]                  | 🌟  | [`capitalized-comments`](https://eslint.org/docs/rules/capitalized-comments) & [`spaced-comment`](https://eslint.org/docs/rules/spaced-comment)                                                                                                                 |
| [`completed-docs`]                  | 🔌  | [`eslint-plugin-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc)                                                                                                                                                                                           |
| [`encoding`]                        | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`file-header`]                     | 🔌  | [`eslint-plugin-header`](https://github.com/Stuk/eslint-plugin-header) or [`-file-header`](https://github.com/Sekhmet/eslint-plugin-file-header)                                                                                                                |
| [`file-name-casing`]                | 🔌  | [`unicorn/filename-case`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/filename-case.md)                                                                                                                                        |
| [`import-spacing`]                  | 🔌  | Use [Prettier]                                                                                                                                                                                                                                                  |
| [`interface-name`]                  | ✅  | [`typescript/interface-name-prefix`]                                                                                                                                                                                                                            |
| [`interface-over-type-literal`]     | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`jsdoc-format`]                    | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`match-default-export-name`]       | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`newline-before-return`]           | 🌟  | [`padding-line-between-statements`](https://eslint.org/docs/rules/padding-line-between-statements) (`{ blankLine: "always", prev: "*", next: "return" }`)                                                                                                       |
| [`newline-per-chained-call`]        | 🌟  | [`newline-per-chained-call`](https://eslint.org/docs/rules/newline-per-chained-call)                                                                                                                                                                            |
| [`new-parens`]                      | 🌟  | [`new-parens`](https://eslint.org/docs/rules/new-parens)                                                                                                                                                                                                        |
| [`no-angle-bracket-type-assertion`] | ✅  | [`typescript/no-angle-bracket-type-assertion`]                                                                                                                                                                                                                  |
| [`no-boolean-literal-compare`]      | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`no-consecutive-blank-lines`]      | 🌟  | [`no-multiple-empty-lines`](https://eslint.org/docs/rules/no-multiple-empty-lines)                                                                                                                                                                              |
| [`no-irregular-whitespace`]         | 🌟  | [`no-irregular-whitespace`](https://eslint.org/docs/rules/no-irregular-whitespace) with `skipStrings: false`                                                                                                                                                    |
| [`no-parameter-properties`]         | ✅  | [`typescript/no-parameter-properties`]                                                                                                                                                                                                                          |
| [`no-redundant-jsdoc`]              | 🛑  | N/A ([open issue](https://github.com/gajus/eslint-plugin-jsdoc/issues/134))                                                                                                                                                                                     |
| [`no-reference-import`]             | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`no-trailing-whitespace`]          | 🌟  | [`no-trailing-spaces`](https://eslint.org/docs/rules/no-trailing-spaces)                                                                                                                                                                                        |
| [`no-unnecessary-callback-wrapper`] | 🛑  | N/A and this might be unsafe (i.e. with `forEach`)                                                                                                                                                                                                              |
| [`no-unnecessary-initializer`]      | 🌟  | [`no-undef-init`](https://eslint.org/docs/rules/no-undef-init)                                                                                                                                                                                                  |
| [`no-unnecessary-qualifier`]        | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`number-literal-format`]           | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`object-literal-key-quotes`]       | 🌟  | [`quote-props`](https://eslint.org/docs/rules/quote-props)                                                                                                                                                                                                      |
| [`object-literal-shorthand`]        | 🌟  | [`object-shorthand`](https://eslint.org/docs/rules/object-shorthand)                                                                                                                                                                                            |
| [`one-line`]                        | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`one-variable-per-declaration`]    | 🌟  | [`one-var`](https://eslint.org/docs/rules/one-var)                                                                                                                                                                                                              |
| [`ordered-imports`]                 | 🔌  | [`import/order`](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md)                                                                                                                                                             |
| [`prefer-function-over-method`]     | 🌟  | [`class-methods-use-this`](https://eslint.org/docs/rules/class-methods-use-this)                                                                                                                                                                                |
| [`prefer-method-signature`]         | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`prefer-switch`]                   | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`prefer-template`]                 | 🌟  | [`prefer-template`](https://eslint.org/docs/rules/prefer-template)                                                                                                                                                                                              |
| [`prefer-while`]                    | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`quotemark`]                       | 🌟  | [`quotes`](https://eslint.org/docs/rules/quotes)                                                                                                                                                                                                                |
| [`return-undefined`]                | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`semicolon`]                       | 🌟  | [`semi`](https://eslint.org/docs/rules/semi)                                                                                                                                                                                                                    |
| [`space-before-function-paren`]     | 🌟  | [`space-before-function-paren`](https://eslint.org/docs/rules/space-before-function-paren)                                                                                                                                                                      |
| [`space-within-parens`]             | 🌟  | [`space-in-parens`](https://eslint.org/docs/rules/space-in-parens)                                                                                                                                                                                              |
| [`switch-final-break`]              | 🛑  | N/A                                                                                                                                                                                                                                                             |
| [`type-literal-delimiter`]          | ✅  | [`typescript/member-delimiter-style`]                                                                                                                                                                                                                           |
| [`variable-name`]                   | 🌟  | [`camelcase`](https://eslint.org/docs/rules/camelcase), [`no-underscore-dangle`](https://eslint.org/docs/rules/no-underscore-dangle), [`id-blacklist`](https://eslint.org/docs/rules/id-blacklist), and/or [`id-match`](https://eslint.org/docs/rules/id-match) |
| [`whitespace`]                      | 🔌  | Use [Prettier]                                                                                                                                                                                                                                                  |

[prettier]: https://prettier.io

<!-- TSLint -->

[`adjacent-overload-signatures`]: https://palantir.github.io/tslint/rules/adjacent-overload-signatures
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
[`completed-docs`]: https://palantir.github.io/tslint/rules/completed-docs
[`encoding`]: https://palantir.github.io/tslint/rules/encoding
[`file-header`]: https://palantir.github.io/tslint/rules/file-header
[`file-name-casing`]: https://palantir.github.io/tslint/rules/file-name-casing
[`import-spacing`]: https://palantir.github.io/tslint/rules/import-spacing
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
[`variable-name`]: https://palantir.github.io/tslint/rules/variable-name
[`whitespace`]: https://palantir.github.io/tslint/rules/whitespace

<!-- ESLint-plugin-TypeScript -->

[`typescript/adjacent-overload-signatures`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/adjacent-overload-signatures.md
[`typescript/ban-types`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/ban-types.md
[`typescript/explicit-member-accessibility`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/explicit-member-accessibility.md
[`typescript/member-ordering`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/member-ordering.md
[`typescript/no-explicit-any`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-explicit-any.md
[`typescript/no-empty-interface`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-empty-interface.md
[`typescript/no-inferrable-types`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-inferrable-types.md
[`typescript/prefer-namespace-keyword`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/prefer-namespace-keyword.md
[`typescript/no-namespace`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-namespace.md
[`typescript/no-non-null-assertion`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-non-null-assertion.md
[`typescript/no-triple-slash-reference`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-triple-slash-reference.md
[`typescript/no-var-requires`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-var-requires.md
[`typescript/type-annotation-spacing`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/type-annotation-spacing.md
[`typescript/no-misused-new`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-misused-new.md
[`typescript/no-object-literal-type-assertion`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-object-literal-type-assertion.md
[`typescript/no-this-alias`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-this-alias.md
[`typescript/no-extraneous-class`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-extraneous-class.md
[`typescript/no-unused-vars`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-unused-vars.md
[`typescript/no-use-before-define`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-use-before-define.md
[`typescript/indent`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/indent.md
[`typescript/array-type`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/array-type.md
[`typescript/class-name-casing`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/class-name-casing.md
[`typescript/interface-name-prefix`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/interface-name-prefix.md
[`typescript/no-angle-bracket-type-assertion`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-angle-bracket-type-assertion.md
[`typescript/no-parameter-properties`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/no-parameter-properties.md
[`typescript/member-delimiter-style`]: https://github.com/bradzacher/eslint-plugin-typescript/blob/master/docs/rules/member-delimiter-style.md

