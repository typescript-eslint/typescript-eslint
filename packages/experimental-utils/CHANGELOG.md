# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.1.0...v2.2.0) (2019-09-09)

**Note:** Version bump only for package @typescript-eslint/experimental-utils





# [2.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v2.0.0...v2.1.0) (2019-09-02)

**Note:** Version bump only for package @typescript-eslint/experimental-utils





# [2.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.13.0...v2.0.0) (2019-08-13)


### Bug Fixes

* **eslint-plugin:** add `Literal` to `RuleListener` types ([#824](https://github.com/typescript-eslint/typescript-eslint/issues/824)) ([3c902a1](https://github.com/typescript-eslint/typescript-eslint/commit/3c902a1))
* **utils:** add ES2019 as valid `ecmaVersion` ([#746](https://github.com/typescript-eslint/typescript-eslint/issues/746)) ([d11fbbe](https://github.com/typescript-eslint/typescript-eslint/commit/d11fbbe))


### Features

* explicitly support eslint v6 ([#645](https://github.com/typescript-eslint/typescript-eslint/issues/645)) ([34a7cf6](https://github.com/typescript-eslint/typescript-eslint/commit/34a7cf6))


* feat(eslint-plugin)!: recommended-requiring-type-checking config (#846) ([d3470c9](https://github.com/typescript-eslint/typescript-eslint/commit/d3470c9)), closes [#846](https://github.com/typescript-eslint/typescript-eslint/issues/846)
* feat(eslint-plugin)!: change recommended config (#729) ([428567d](https://github.com/typescript-eslint/typescript-eslint/commit/428567d)), closes [#729](https://github.com/typescript-eslint/typescript-eslint/issues/729)
* feat(eslint-plugin)!: add rule `consistent-type-assertions` (#731) ([92e98de](https://github.com/typescript-eslint/typescript-eslint/commit/92e98de)), closes [#731](https://github.com/typescript-eslint/typescript-eslint/issues/731)


### BREAKING CHANGES

* removed some rules from recommended config
* recommended config changes are considered breaking
* Merges both no-angle-bracket-type-assertion and no-object-literal-type-assertion into one rule
* Node 6 is no longer supported





# [1.13.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.12.0...v1.13.0) (2019-07-21)


### Bug Fixes

* Correct `@types/json-schema` dependency ([#675](https://github.com/typescript-eslint/typescript-eslint/issues/675)) ([a5398ce](https://github.com/typescript-eslint/typescript-eslint/commit/a5398ce))
* **utils:** move `typescript` from peer dep to dev dep ([#712](https://github.com/typescript-eslint/typescript-eslint/issues/712)) ([f949355](https://github.com/typescript-eslint/typescript-eslint/commit/f949355))
* **utils:** RuleTester should not require a parser ([#713](https://github.com/typescript-eslint/typescript-eslint/issues/713)) ([158a417](https://github.com/typescript-eslint/typescript-eslint/commit/158a417))


### Features

* **eslint-plugin:** add new rule no-misused-promises ([#612](https://github.com/typescript-eslint/typescript-eslint/issues/612)) ([28a131d](https://github.com/typescript-eslint/typescript-eslint/commit/28a131d))





# [1.12.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.11.0...v1.12.0) (2019-07-12)

**Note:** Version bump only for package @typescript-eslint/experimental-utils





# [1.11.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.2...v1.11.0) (2019-06-23)


### Bug Fixes

* **eslint-plugin:** Remove duplicated code ([#611](https://github.com/typescript-eslint/typescript-eslint/issues/611)) ([c4df4ff](https://github.com/typescript-eslint/typescript-eslint/commit/c4df4ff))


### Features

* **eslint-plugin:** add `consistent-type-definitions` rule ([#463](https://github.com/typescript-eslint/typescript-eslint/issues/463)) ([ec87d06](https://github.com/typescript-eslint/typescript-eslint/commit/ec87d06))





## [1.10.2](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.1...v1.10.2) (2019-06-10)

**Note:** Version bump only for package @typescript-eslint/experimental-utils

## [1.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v1.10.0...v1.10.1) (2019-06-09)

**Note:** Version bump only for package @typescript-eslint/experimental-utils

# [1.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.9.0...v1.10.0) (2019-06-09)

### Bug Fixes

- **experimental-utils:** add `endLine` and `endColumn` ([#517](https://github.com/typescript-eslint/typescript-eslint/issues/517)) ([d9e5f15](https://github.com/typescript-eslint/typescript-eslint/commit/d9e5f15))
- **experimental-utils:** Avoid typescript import at runtime ([#584](https://github.com/typescript-eslint/typescript-eslint/issues/584)) ([fac5c7d](https://github.com/typescript-eslint/typescript-eslint/commit/fac5c7d)), closes [/github.com/typescript-eslint/typescript-eslint/pull/425#issuecomment-498162293](https://github.com//github.com/typescript-eslint/typescript-eslint/pull/425/issues/issuecomment-498162293)

### Features

- make utils/TSESLint export typed classes instead of just types ([#526](https://github.com/typescript-eslint/typescript-eslint/issues/526)) ([370ac72](https://github.com/typescript-eslint/typescript-eslint/commit/370ac72))
- support TypeScript versions >=3.2.1 <3.6.0 ([#597](https://github.com/typescript-eslint/typescript-eslint/issues/597)) ([5d2b962](https://github.com/typescript-eslint/typescript-eslint/commit/5d2b962))

# [1.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.8.0...v1.9.0) (2019-05-12)

**Note:** Version bump only for package @typescript-eslint/experimental-utils

# [1.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v1.7.0...v1.8.0) (2019-05-10)

### Features

- Move shared types into their own package ([#425](https://github.com/typescript-eslint/typescript-eslint/issues/425)) ([a7a03ce](https://github.com/typescript-eslint/typescript-eslint/commit/a7a03ce))
