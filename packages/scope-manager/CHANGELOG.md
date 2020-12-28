# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.11.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.11.0...v4.11.1) (2020-12-28)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.11.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.10.0...v4.11.0) (2020-12-21)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.9.1...v4.10.0) (2020-12-14)

**Note:** Version bump only for package @typescript-eslint/scope-manager





## [4.9.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.9.0...v4.9.1) (2020-12-07)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.8.2...v4.9.0) (2020-11-30)


### Bug Fixes

* **scope-manager:** fix assertion assignments not being marked as write references ([#2809](https://github.com/typescript-eslint/typescript-eslint/issues/2809)) ([fa68492](https://github.com/typescript-eslint/typescript-eslint/commit/fa6849245ca55ca407dc031afbad456f2925a8e9)), closes [#2804](https://github.com/typescript-eslint/typescript-eslint/issues/2804)


### Features

* **eslint-plugin:** [no-unused-vars] fork the base rule ([#2768](https://github.com/typescript-eslint/typescript-eslint/issues/2768)) ([a8227a6](https://github.com/typescript-eslint/typescript-eslint/commit/a8227a6185dd24de4bfc7d766931643871155021)), closes [#2782](https://github.com/typescript-eslint/typescript-eslint/issues/2782) [#2714](https://github.com/typescript-eslint/typescript-eslint/issues/2714) [#2648](https://github.com/typescript-eslint/typescript-eslint/issues/2648)





## [4.8.2](https://github.com/typescript-eslint/typescript-eslint/compare/v4.8.1...v4.8.2) (2020-11-23)

**Note:** Version bump only for package @typescript-eslint/scope-manager





## [4.8.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.8.0...v4.8.1) (2020-11-17)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.7.0...v4.8.0) (2020-11-16)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.6.1...v4.7.0) (2020-11-09)


### Features

* support TS4.1 features ([#2748](https://github.com/typescript-eslint/typescript-eslint/issues/2748)) ([2be354b](https://github.com/typescript-eslint/typescript-eslint/commit/2be354bb15f9013a2da1b13a0c0836e9ef057e16)), closes [#2583](https://github.com/typescript-eslint/typescript-eslint/issues/2583)





## [4.6.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.6.0...v4.6.1) (2020-11-02)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.5.0...v4.6.0) (2020-10-26)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.4.1...v4.5.0) (2020-10-19)


### Features

* **typescript-estree:** add flag EXPERIMENTAL_useSourceOfProjectReferenceRedirect ([#2669](https://github.com/typescript-eslint/typescript-eslint/issues/2669)) ([90a5878](https://github.com/typescript-eslint/typescript-eslint/commit/90a587845088da1b205e4d7d77dbc3f9447b1c5a))





## [4.4.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.4.0...v4.4.1) (2020-10-12)


### Bug Fixes

* **scope-manager:** don't create a variable for global augmentation ([#2639](https://github.com/typescript-eslint/typescript-eslint/issues/2639)) ([6bc9325](https://github.com/typescript-eslint/typescript-eslint/commit/6bc93257ec876214743a165093b6666d713379f6))





# [4.4.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.3.0...v4.4.0) (2020-10-05)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.3.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.2.0...v4.3.0) (2020-09-28)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.2.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.1.1...v4.2.0) (2020-09-21)


### Bug Fixes

* **scope-manager:** correct analysis of inferred types in conditional types ([#2537](https://github.com/typescript-eslint/typescript-eslint/issues/2537)) ([4f660fd](https://github.com/typescript-eslint/typescript-eslint/commit/4f660fd31acbb88b30719f925dcb2b3022cc2bab))





## [4.1.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.1.0...v4.1.1) (2020-09-14)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.1.0](https://github.com/typescript-eslint/typescript-eslint/compare/v4.0.1...v4.1.0) (2020-09-07)


### Bug Fixes

* **eslint-plugin:** [no-unused-vars] correct detection of unused vars in a declared module with `export =` ([#2505](https://github.com/typescript-eslint/typescript-eslint/issues/2505)) ([3d07a99](https://github.com/typescript-eslint/typescript-eslint/commit/3d07a99faa0a5fc1b44acdb43ddbfc90a5105833))
* **scope-manager:** add `const` as a global type variable ([#2499](https://github.com/typescript-eslint/typescript-eslint/issues/2499)) ([eb3f6e3](https://github.com/typescript-eslint/typescript-eslint/commit/eb3f6e39391d62ac424baa305a15e61806b2fd65))
* **scope-manager:** correctly handle inferred types in nested type scopes ([#2497](https://github.com/typescript-eslint/typescript-eslint/issues/2497)) ([95f6bf4](https://github.com/typescript-eslint/typescript-eslint/commit/95f6bf4818cdec48a0583bf82f928c598af22736))
* **scope-manager:** don't create references for intrinsic JSX elements ([#2504](https://github.com/typescript-eslint/typescript-eslint/issues/2504)) ([cdb9807](https://github.com/typescript-eslint/typescript-eslint/commit/cdb9807a5a368a136856cd03048b68e0f2dfb405))
* **scope-manager:** fallback to lib 'esnext' or 'es5' when ecma version is unsupported ([#2474](https://github.com/typescript-eslint/typescript-eslint/issues/2474)) ([20a7dcc](https://github.com/typescript-eslint/typescript-eslint/commit/20a7dcc808a39cd447d6e52fc5a1e1373d7122e9))
* **scope-manager:** support rest function type parameters ([#2491](https://github.com/typescript-eslint/typescript-eslint/issues/2491)) ([9d8b4c4](https://github.com/typescript-eslint/typescript-eslint/commit/9d8b4c479c98623e4198aa07639321929a8a876f)), closes [#2449](https://github.com/typescript-eslint/typescript-eslint/issues/2449)
* **scope-manager:** support tagged template string generic type parameters ([#2492](https://github.com/typescript-eslint/typescript-eslint/issues/2492)) ([a2686c0](https://github.com/typescript-eslint/typescript-eslint/commit/a2686c04293ab9070c1500a0dab7e205bd1fa9d2))
* **scope-manager:** support type predicates ([#2493](https://github.com/typescript-eslint/typescript-eslint/issues/2493)) ([a40f54c](https://github.com/typescript-eslint/typescript-eslint/commit/a40f54c39d59096a0d12a492807dcd52fbcdc384)), closes [#2462](https://github.com/typescript-eslint/typescript-eslint/issues/2462)
* **scope-manager:** treat type imports as both values and types ([#2494](https://github.com/typescript-eslint/typescript-eslint/issues/2494)) ([916e95a](https://github.com/typescript-eslint/typescript-eslint/commit/916e95a505689746dda38a67148c95cc7d207d9f)), closes [#2453](https://github.com/typescript-eslint/typescript-eslint/issues/2453)


### Features

* **scope-manager:** add support for JSX scope analysis ([#2498](https://github.com/typescript-eslint/typescript-eslint/issues/2498)) ([f887ab5](https://github.com/typescript-eslint/typescript-eslint/commit/f887ab51f58c1b3571f9a14832864bc0ca59623f)), closes [#2455](https://github.com/typescript-eslint/typescript-eslint/issues/2455) [#2477](https://github.com/typescript-eslint/typescript-eslint/issues/2477)





## [4.0.1](https://github.com/typescript-eslint/typescript-eslint/compare/v4.0.0...v4.0.1) (2020-08-31)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [4.0.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.10.1...v4.0.0) (2020-08-31)

## [Please see the release notes for v4.0.0](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v4.0.0)

### Bug Fixes

* **scope-manager:** correct analysis of abstract class properties ([#2420](https://github.com/typescript-eslint/typescript-eslint/issues/2420)) ([cd84549](https://github.com/typescript-eslint/typescript-eslint/commit/cd84549beba3cf471d75cfd9ba26f80366842ed5))


### Features

* support ESTree optional chaining representation ([#2308](https://github.com/typescript-eslint/typescript-eslint/issues/2308)) ([e9d2ab6](https://github.com/typescript-eslint/typescript-eslint/commit/e9d2ab638b6767700b52797e74b814ea059beaae))





## [3.10.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.10.0...v3.10.1) (2020-08-25)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [3.10.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.9.1...v3.10.0) (2020-08-24)

**Note:** Version bump only for package @typescript-eslint/scope-manager





## [3.9.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.9.0...v3.9.1) (2020-08-17)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [3.9.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.8.0...v3.9.0) (2020-08-10)


### Features

* **typescript-estree:** support TSv4 labelled tuple members ([#2378](https://github.com/typescript-eslint/typescript-eslint/issues/2378)) ([00d84ff](https://github.com/typescript-eslint/typescript-eslint/commit/00d84ffbcbe9d0ec98bdb2f2ce59959a27ce4dbe))





# [3.8.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.7.1...v3.8.0) (2020-08-03)

**Note:** Version bump only for package @typescript-eslint/scope-manager





## [3.7.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.7.0...v3.7.1) (2020-07-27)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [3.7.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.6.1...v3.7.0) (2020-07-20)

**Note:** Version bump only for package @typescript-eslint/scope-manager





## [3.6.1](https://github.com/typescript-eslint/typescript-eslint/compare/v3.6.0...v3.6.1) (2020-07-13)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [3.6.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.5.0...v3.6.0) (2020-07-06)

**Note:** Version bump only for package @typescript-eslint/scope-manager





# [3.5.0](https://github.com/typescript-eslint/typescript-eslint/compare/v3.4.0...v3.5.0) (2020-06-29)


### Features

* add package scope-manager ([#1939](https://github.com/typescript-eslint/typescript-eslint/issues/1939)) ([682eb7e](https://github.com/typescript-eslint/typescript-eslint/commit/682eb7e009c3f22a542882dfd3602196a60d2a1e))
